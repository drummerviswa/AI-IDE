import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface EnhancePromptRequest {
  prompt: string
  context?: {
    fileName?: string
    language?: string
    codeContent?: string
  }
}

interface AIActionRequest {
  action: "enhance" | "analyze-codebase" | "generate-feature" | "fix-build-error" | "recommend-packages"
  prompt?: string
  projectSummary?: string
  activeFile?: string
  activeFileContent?: string
  language?: string
  requirements?: string
  errorLog?: string
  goal?: string
}

function isValidChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<ChatMessage>
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  )
}

const OLLAMA_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "codellama:latest"
const CHAT_TIMEOUT_MS = Number.parseInt(process.env.AI_CHAT_TIMEOUT_MS || "90000", 10)
const ENHANCE_TIMEOUT_MS = Number.parseInt(process.env.AI_ENHANCE_TIMEOUT_MS || "40000", 10)
const OLLAMA_RETRY_COUNT = Number.parseInt(process.env.AI_CHAT_RETRY_COUNT || "1", 10)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callOllamaWithTimeout(payload: Record<string, unknown>, timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI model API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (!data.response || typeof data.response !== "string") {
      throw new Error("No response from AI model")
    }

    return data.response.trim()
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("AI_REQUEST_TIMEOUT")
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

async function generateAIResponse(messages: ChatMessage[], mode?: string) {
  const modeInstruction =
    mode === "review"
      ? "Focus on code quality review with concrete, actionable feedback."
      : mode === "fix"
      ? "Focus on bug fixes with root-cause analysis and exact change suggestions."
      : mode === "optimize"
      ? "Focus on performance and maintainability optimizations."
      : ""

  const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.
${modeInstruction}`

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]

  const prompt = fullMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")

  const payload = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1000,
      num_predict: 1000,
      repeat_penalty: 1.1,
      context_length: 4096,
    },
  }

  for (let attempt = 0; attempt <= OLLAMA_RETRY_COUNT; attempt++) {
    try {
      return await callOllamaWithTimeout(payload, CHAT_TIMEOUT_MS)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      const isLastAttempt = attempt === OLLAMA_RETRY_COUNT

      if (isLastAttempt) {
        if (message === "AI_REQUEST_TIMEOUT") {
          throw new Error(
            `Request timeout: AI model took too long to respond after ${CHAT_TIMEOUT_MS}ms. Try a shorter prompt or increase AI_CHAT_TIMEOUT_MS.`,
          )
        }
        console.error("AI generation error:", error)
        throw error
      }

      await sleep(400 * (attempt + 1))
    }
  }

  throw new Error("Failed to generate response")
}

async function handleAIAction(body: AIActionRequest) {
  switch (body.action) {
    case "analyze-codebase": {
      const prompt = `You are a senior software architect. Explain this codebase for onboarding.

Project summary:
${body.projectSummary || "N/A"}

Active file: ${body.activeFile || "N/A"}
Language: ${body.language || "Unknown"}

File content excerpt:
${(body.activeFileContent || "").slice(0, 3500)}

Return sections:
1) Architecture Overview
2) Key Entry Points
3) Critical Dependencies
4) Risks/Tech Debt
5) Suggested Next Improvements`

      const response = await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.2, max_tokens: 900 },
        },
        CHAT_TIMEOUT_MS,
      )

      return { analysis: response }
    }

    case "generate-feature": {
      const prompt = `Generate an implementation plan and starter code for this feature.

Requirements:
${body.requirements || body.prompt || "No requirements provided"}

Language: ${body.language || "TypeScript"}
Active file: ${body.activeFile || "N/A"}
Current file content:
${(body.activeFileContent || "").slice(0, 3500)}

Output format:
- Summary
- Files to change
- Code snippet(s)
- Validation steps`

      const response = await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.35, max_tokens: 1100 },
        },
        CHAT_TIMEOUT_MS,
      )

      return { featurePlan: response }
    }

    case "fix-build-error": {
      const prompt = `You are debugging a broken build. Analyze the error and provide a fix.

Error log:
${body.errorLog || body.prompt || "No error log provided"}

Language: ${body.language || "Unknown"}
Active file: ${body.activeFile || "N/A"}
Related code:
${(body.activeFileContent || "").slice(0, 3000)}

Return:
1) Root cause
2) Minimal fix patch suggestion
3) How to verify`

      const response = await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.2, max_tokens: 900 },
        },
        CHAT_TIMEOUT_MS,
      )

      return { buildFix: response }
    }

    case "recommend-packages": {
      const prompt = `Recommend npm packages for this goal.

Goal:
${body.goal || body.prompt || "No goal provided"}

Project context:
${body.projectSummary || "N/A"}

Return a concise list with:
- package name
- why it fits
- sample install command`

      const response = await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.3, max_tokens: 700 },
        },
        ENHANCE_TIMEOUT_MS,
      )

      return { packageRecommendations: response }
    }

    default: {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest)
      return { enhancedPrompt }
    }
  }
}

async function enhancePrompt(request: EnhancePromptRequest) {
  const enhancementPrompt = `You are a prompt enhancement assistant. Take the user's basic prompt and enhance it to be more specific, detailed, and effective for a coding AI assistant.

Original prompt: "${request.prompt}"

Context: ${request.context ? JSON.stringify(request.context, null, 2) : "No additional context"}

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt, nothing else.`

  try {
    return await callOllamaWithTimeout(
      {
        model: OLLAMA_MODEL,
        prompt: enhancementPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 500,
        },
      },
      ENHANCE_TIMEOUT_MS,
    )
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return request.prompt // Return original if enhancement fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.action) {
      const result = await handleAIAction(body as AIActionRequest)
      return NextResponse.json(result)
    }

    // Handle regular chat
    const { message, history } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const validHistory = Array.isArray(history)
      ? history.filter((msg: unknown) => isValidChatMessage(msg))
      : []

    const recentHistory = validHistory.slice(-10)
    const messages: ChatMessage[] = [...recentHistory, { role: "user", content: message }]

    const aiResponse = await generateAIResponse(messages, typeof body.mode === "string" ? body.mode : undefined)

    if (!aiResponse) {
      throw new Error("Empty response from AI model")
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in AI chat route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const isTimeoutError = errorMessage.toLowerCase().includes("request timeout")
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: isTimeoutError ? 504 : 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  })
}
