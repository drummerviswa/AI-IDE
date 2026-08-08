import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

// ─── Gemini Client ──────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"

// ─── Ollama fallback ─────────────────────────────────────────────────────────
const OLLAMA_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "codellama:latest"
const CHAT_TIMEOUT_MS = Number.parseInt(process.env.AI_CHAT_TIMEOUT_MS || "90000", 10)
const ENHANCE_TIMEOUT_MS = Number.parseInt(process.env.AI_ENHANCE_TIMEOUT_MS || "40000", 10)
const OLLAMA_RETRY_COUNT = Number.parseInt(process.env.AI_CHAT_RETRY_COUNT || "1", 10)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Gemini text generation ───────────────────────────────────────────────────

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  })

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  if (!text) throw new Error("Empty response from Gemini")
  return text.trim()
}

// ─── Gemini streaming (for chat) ─────────────────────────────────────────────

async function* callGeminiStream(messages: ChatMessage[], systemInstruction: string): AsyncGenerator<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  })

  // Convert our message format to Gemini chat history format
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }))

  const chat = model.startChat({ history })
  const lastMessage = messages[messages.length - 1]

  const result = await chat.sendMessageStream(lastMessage.content)

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

// ─── Ollama fallback ──────────────────────────────────────────────────────────

async function callOllamaWithTimeout(payload: Record<string, unknown>, timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (!data.response || typeof data.response !== "string") {
      throw new Error("No response from Ollama")
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

// ─── Unified AI call (Gemini preferred, Ollama fallback) ─────────────────────

async function generateAI(prompt: string, systemInstruction: string, timeoutMs = CHAT_TIMEOUT_MS): Promise<string> {
  // Try Gemini first
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(prompt, systemInstruction)
    } catch (error) {
      console.warn("Gemini failed, falling back to Ollama:", (error as Error).message)
    }
  }

  // Fallback: Ollama
  const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}`
  for (let attempt = 0; attempt <= OLLAMA_RETRY_COUNT; attempt++) {
    try {
      return await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt: fullPrompt,
          stream: false,
          options: { temperature: 0.7, max_tokens: 1000, num_predict: 1000 },
        },
        timeoutMs,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      const isLastAttempt = attempt === OLLAMA_RETRY_COUNT

      if (isLastAttempt) {
        if (message === "AI_REQUEST_TIMEOUT") {
          throw new Error(`Request timeout after ${timeoutMs}ms. Try a shorter prompt or check AI service.`)
        }
        throw error
      }
      await sleep(400 * (attempt + 1))
    }
  }

  throw new Error("Failed to generate response from any AI provider")
}

// ─── Chat (streaming via Gemini, non-streaming via Ollama) ───────────────────

const CHAT_SYSTEM_PROMPT = `You are an expert AI coding assistant embedded in vibe-ai-ide, a browser-based IDE. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors and build failures
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper markdown code blocks with language specification. Keep responses concise but comprehensive.`

async function generateAIResponse(messages: ChatMessage[], mode?: string): Promise<string> {
  const modeInstruction =
    mode === "review"
      ? " Focus on code quality review with concrete, actionable feedback."
      : mode === "fix"
      ? " Focus on bug fixes with root-cause analysis and exact change suggestions."
      : mode === "optimize"
      ? " Focus on performance and maintainability optimizations."
      : ""

  const systemInstruction = CHAT_SYSTEM_PROMPT + modeInstruction

  // For streaming endpoint, use callGeminiStream directly
  // For non-streaming (this function), collect full response
  if (GEMINI_API_KEY) {
    try {
      // Build prompt from message history
      const historyMessages = messages.slice(0, -1)
      const lastMessage = messages[messages.length - 1]

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction,
        generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
      })

      const history = historyMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }))

      const chat = model.startChat({ history })
      const result = await chat.sendMessage(lastMessage.content)
      const text = result.response.text()
      if (!text) throw new Error("Empty response from Gemini")
      return text.trim()
    } catch (error) {
      console.warn("Gemini chat failed, falling back to Ollama:", (error as Error).message)
    }
  }

  // Ollama fallback
  const fullMessages = [{ role: "system", content: systemInstruction }, ...messages]
  const prompt = fullMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")

  for (let attempt = 0; attempt <= OLLAMA_RETRY_COUNT; attempt++) {
    try {
      return await callOllamaWithTimeout(
        {
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.7, top_p: 0.9, max_tokens: 1000, num_predict: 1000, repeat_penalty: 1.1 },
        },
        CHAT_TIMEOUT_MS,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      if (attempt === OLLAMA_RETRY_COUNT) {
        if (message === "AI_REQUEST_TIMEOUT") {
          throw new Error(`Request timeout after ${CHAT_TIMEOUT_MS}ms.`)
        }
        throw error
      }
      await sleep(400 * (attempt + 1))
    }
  }

  throw new Error("Failed to generate response")
}

// ─── AI Actions ───────────────────────────────────────────────────────────────

async function handleAIAction(body: AIActionRequest) {
  switch (body.action) {
    case "analyze-codebase": {
      const systemInstruction = "You are a senior software architect. Analyze codebases and provide structured onboarding guides."
      const prompt = `Analyze this codebase for a new team member.

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

      const analysis = await generateAI(prompt, systemInstruction, CHAT_TIMEOUT_MS)
      return { analysis }
    }

    case "generate-feature": {
      const systemInstruction = "You are a senior software engineer. Generate implementation plans and starter code for new features."
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

      const featurePlan = await generateAI(prompt, systemInstruction, CHAT_TIMEOUT_MS)
      return { featurePlan }
    }

    case "fix-build-error": {
      const systemInstruction = "You are a debugging expert. Analyze build errors and provide precise fixes with root cause analysis."
      const prompt = `Debug this build error and provide a fix.

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

      const buildFix = await generateAI(prompt, systemInstruction, CHAT_TIMEOUT_MS)
      return { buildFix }
    }

    case "recommend-packages": {
      const systemInstruction = "You are an expert in the npm ecosystem. Recommend the best packages for given goals."
      const prompt = `Recommend npm packages for this goal.

Goal:
${body.goal || body.prompt || "No goal provided"}

Project context:
${body.projectSummary || "N/A"}

Return a concise list with:
- package name
- why it fits
- sample install command`

      const packageRecommendations = await generateAI(prompt, systemInstruction, ENHANCE_TIMEOUT_MS)
      return { packageRecommendations }
    }

    default: {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest)
      return { enhancedPrompt }
    }
  }
}

async function enhancePrompt(request: EnhancePromptRequest): Promise<string> {
  const systemInstruction = "You are a prompt engineering expert. Enhance user prompts to be more specific, detailed, and effective for coding AI assistants. Return only the enhanced prompt, nothing else."
  const prompt = `Enhance this basic prompt to be more specific, detailed, and effective:

Original prompt: "${request.prompt}"

Context: ${request.context ? JSON.stringify(request.context, null, 2) : "No additional context"}

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt text.`

  try {
    return await generateAI(prompt, systemInstruction, ENHANCE_TIMEOUT_MS)
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return request.prompt // Return original if enhancement fails
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.action) {
      const result = await handleAIAction(body as AIActionRequest)
      return NextResponse.json(result)
    }

    // Handle regular chat
    const { message, history, stream: useStream } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const validHistory = Array.isArray(history)
      ? history.filter((msg: unknown) => isValidChatMessage(msg))
      : []

    const recentHistory = validHistory.slice(-10)
    const messages: ChatMessage[] = [...recentHistory, { role: "user", content: message }]
    const mode = typeof body.mode === "string" ? body.mode : undefined

    // Streaming response (Gemini only)
    if (useStream && GEMINI_API_KEY) {
      const modeInstruction =
        mode === "review" ? " Focus on code quality review with concrete, actionable feedback."
        : mode === "fix" ? " Focus on bug fixes with root-cause analysis and exact change suggestions."
        : mode === "optimize" ? " Focus on performance and maintainability optimizations."
        : ""

      const systemInstruction = CHAT_SYSTEM_PROMPT + modeInstruction

      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of callGeminiStream(messages, systemInstruction)) {
              const data = `data: ${JSON.stringify({ chunk })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Stream error"
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`))
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // Non-streaming fallback
    const aiResponse = await generateAIResponse(messages, mode)

    if (!aiResponse) {
      throw new Error("Empty response from AI model")
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      provider: GEMINI_API_KEY ? "gemini" : "ollama",
    })
  } catch (error) {
    console.error("Error in AI chat route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const isTimeoutError = errorMessage.toLowerCase().includes("timeout")
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
    provider: GEMINI_API_KEY ? "gemini" : "ollama",
    model: GEMINI_API_KEY ? GEMINI_MODEL : OLLAMA_MODEL,
    streaming: !!GEMINI_API_KEY,
    info: "Use POST method to send chat messages or enhance prompts. Pass stream:true for streaming responses.",
  })
}
