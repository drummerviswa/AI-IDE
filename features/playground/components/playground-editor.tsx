"use client"

import { useRef, useEffect, useCallback } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "@/features/playground/libs/editor-config"
import type { TemplateFile } from "@/features/playground/libs/path-to-json"

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined
  content: string
  onContentChange: (value: string) => void
  installedExtensions?: string[]
  suggestion: string | null
  suggestionLoading: boolean
  suggestionPosition: { line: number; column: number } | null
  onAcceptSuggestion: (editor: any, monaco: any) => void
  onRejectSuggestion: (editor: any) => void
  onTriggerSuggestion: (type: string, editor: any) => void
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  installedExtensions = [],
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const inlineCompletionProviderRef = useRef<any>(null)
  const currentSuggestionRef = useRef<{
    text: string
    position: { line: number; column: number }
    id: string
  } | null>(null)
  const isAcceptingSuggestionRef = useRef(false)
  const suggestionAcceptedRef = useRef(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const extensionProviderDisposablesRef = useRef<any[]>([])
  const lastTypingAtRef = useRef<number>(0)
  const contentChangeDisposableRef = useRef<any>(null)
  const blurDisposableRef = useRef<any>(null)

  // Generate unique ID for each suggestion
  const generateSuggestionId = () => `suggestion-${Date.now()}-${Math.random()}`

  // Create inline completion provider
  const createInlineCompletionProvider = useCallback(
    (monaco: Monaco) => {
      return {
        provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
          // Don't provide completions if we're currently accepting or have already accepted
          if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
            return { items: [] }
          }

          // Only provide suggestion if we have one
          if (!suggestion || !suggestionPosition) {
            return { items: [] }
          }

          // Check if current position matches suggestion position (with some tolerance)
          const currentLine = position.lineNumber
          const currentColumn = position.column

          const isPositionMatch =
            currentLine === suggestionPosition.line &&
            currentColumn >= suggestionPosition.column &&
            currentColumn <= suggestionPosition.column + 2 // Small tolerance

          if (!isPositionMatch) {
            return { items: [] }
          }

          const suggestionId = generateSuggestionId()
          currentSuggestionRef.current = {
            text: suggestion,
            position: suggestionPosition,
            id: suggestionId,
          }

          // Clean the suggestion text (remove \r characters)
          const cleanSuggestion = suggestion.replace(/\r/g, "")

          return {
            items: [
              {
                insertText: cleanSuggestion,
                range: new monaco.Range(
                  suggestionPosition.line,
                  suggestionPosition.column,
                  suggestionPosition.line,
                  suggestionPosition.column,
                ),
                kind: monaco.languages.CompletionItemKind.Snippet,
                label: "AI Suggestion",
                detail: "AI-generated code suggestion",
                documentation: "Press Tab to accept",
                sortText: "0000", // High priority
                filterText: "",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              },
            ],
          }
        },
        freeInlineCompletions: (_completions: any) => {
          // intentional no-op
        },
      }
    },
    [suggestion, suggestionPosition],
  )

  // Clear current suggestion
  const clearCurrentSuggestion = useCallback(() => {
    currentSuggestionRef.current = null
    suggestionAcceptedRef.current = false
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
    }
  }, [])

  // Accept current suggestion with double-acceptance prevention
  const acceptCurrentSuggestion = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !currentSuggestionRef.current) {
      return false
    }

    // CRITICAL: Prevent double acceptance with immediate flag setting
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      return false
    }

    // Set flags IMMEDIATELY to prevent any race conditions
    isAcceptingSuggestionRef.current = true
    suggestionAcceptedRef.current = true

    const editor = editorRef.current
    const monaco = monacoRef.current
    const currentSuggestion = currentSuggestionRef.current

    try {
      // Clean the suggestion text (remove \r characters)
      const cleanSuggestionText = currentSuggestion.text.replace(/\r/g, "")

      // Get current cursor position to validate
      const currentPosition = editor.getPosition()
      const suggestionPos = currentSuggestion.position

      // Verify we're still at the suggestion position
      if (
        currentPosition.lineNumber !== suggestionPos.line ||
        currentPosition.column < suggestionPos.column ||
        currentPosition.column > suggestionPos.column + 5
      ) {
        return false
      }

      // Insert the suggestion text at the correct position
      const range = new monaco.Range(suggestionPos.line, suggestionPos.column, suggestionPos.line, suggestionPos.column)

      // Use executeEdits to insert the text
      const success = editor.executeEdits("ai-suggestion-accept", [
        {
          range: range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ])

      if (!success) {
        console.error("Failed to execute AI suggestion edit")
        return false
      }

      // Calculate new cursor position
      const lines = cleanSuggestionText.split("\n")
      const endLine = suggestionPos.line + lines.length - 1
      const endColumn =
        lines.length === 1 ? suggestionPos.column + cleanSuggestionText.length : lines[lines.length - 1].length + 1

      // Move cursor to end of inserted text
      editor.setPosition({ lineNumber: endLine, column: endColumn })

      // Clear the suggestion
      clearCurrentSuggestion()

      // Call the parent's accept handler
      onAcceptSuggestion(editor, monaco)

      return true
    } catch (error) {
      console.error("Error accepting AI suggestion:", error)
      return false
    } finally {
      // Reset accepting flag immediately
      isAcceptingSuggestionRef.current = false

      // Keep accepted flag for longer to prevent immediate re-acceptance
      setTimeout(() => {
        suggestionAcceptedRef.current = false
      }, 1000)
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion])

  // Check if there's an active inline suggestion at current position
  const hasActiveSuggestionAtPosition = useCallback(() => {
    if (!editorRef.current || !currentSuggestionRef.current) return false

    const position = editorRef.current.getPosition()
    const suggestion = currentSuggestionRef.current

    return (
      position.lineNumber === suggestion.position.line &&
      position.column >= suggestion.position.column &&
      position.column <= suggestion.position.column + 2
    )
  }, [])

  // Update inline completions when suggestion changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return

    const editor = editorRef.current
    const monaco = monacoRef.current

    // Don't update if we're in the middle of accepting a suggestion
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      return
    }

    // Dispose previous provider
    if (inlineCompletionProviderRef.current) {
      inlineCompletionProviderRef.current.dispose()
      inlineCompletionProviderRef.current = null
    }

    // Clear current suggestion reference
    currentSuggestionRef.current = null

    // Register new provider if we have a suggestion
    if (suggestion && suggestionPosition) {
      const language = getEditorLanguage(activeFile?.fileExtension || "")
      const provider = createInlineCompletionProvider(monaco)

      inlineCompletionProviderRef.current = monaco.languages.registerInlineCompletionsProvider(language, provider)

      // Small delay to ensure editor is ready, then trigger suggestions
      setTimeout(() => {
        if (editorRef.current && !isAcceptingSuggestionRef.current && !suggestionAcceptedRef.current) {
          editor.trigger("ai", "editor.action.inlineSuggest.trigger", null)
        }
      }, 50)
    }

    return () => {
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose()
        inlineCompletionProviderRef.current = null
      }
    }
  }, [suggestion, suggestionPosition, activeFile, createInlineCompletionProvider])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: { enabled: true },
    })

    configureMonaco(monaco)

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      onTriggerSuggestion("completion", editor)
    })

    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        if (hasActiveSuggestionAtPosition()) {
          const accepted = acceptCurrentSuggestion()
          if (accepted) {
            return
          }
        }
      },
      "inlineSuggestionVisible && editorTextFocus && !editorReadonly",
    )

    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor)
        clearCurrentSuggestion()
      }
    })

    contentChangeDisposableRef.current = editor.onDidChangeModelContent(() => {
      lastTypingAtRef.current = Date.now()
    })

    blurDisposableRef.current = editor.onDidBlurEditorText(() => {
      const elapsed = Date.now() - lastTypingAtRef.current
      if (elapsed > 3000) return

      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement | null
        const isPreviewOrTerminalTarget =
          activeElement?.tagName === "IFRAME" ||
          !!activeElement?.closest(".xterm") ||
          activeElement?.classList.contains("xterm-helper-textarea")

        if (isPreviewOrTerminalTarget && editorRef.current) {
          editorRef.current.focus()
        }
      }, 0)
    })

    updateEditorLanguage()
  }

  const registerExtensionProviders = useCallback((monaco: Monaco) => {
    extensionProviderDisposablesRef.current.forEach((disposable) => disposable?.dispose?.())
    extensionProviderDisposablesRef.current = []

    const parseMithrilSegment = (segment: string) => {
      const [selectorPart, countPart] = segment.split("*")
      const count = Number(countPart || "1") || 1

      const tagMatch = selectorPart.match(/^[a-zA-Z][a-zA-Z0-9-]*/)
      const tag = tagMatch?.[0] || "div"

      const idMatch = selectorPart.match(/#([a-zA-Z0-9_-]+)/)
      const id = idMatch?.[1] ? `#${idMatch[1]}` : ""

      const classes = Array.from(selectorPart.matchAll(/\.([a-zA-Z0-9_-]+)/g)).map((match) => `.${match[1]}`)
      const selector = `${tag}${id}${classes.join("")}`

      return { selector, count }
    }

    const expandMithrilZenCoding = (abbreviation: string) => {
      const cleaned = abbreviation.trim()
      if (!cleaned || !/^[a-zA-Z.#][a-zA-Z0-9.#>*_-]*$/.test(cleaned)) return null

      const segments = cleaned.split(">")
      if (segments.length === 0) return null

      const buildNode = (index: number): string => {
        const { selector, count } = parseMithrilSegment(segments[index])
        const hasChild = index < segments.length - 1
        const childExpression = hasChild ? buildNode(index + 1) : ""

        const node = hasChild
          ? `m(\"${selector}\", ${childExpression.startsWith("[") ? childExpression : `[${childExpression}]`})`
          : `m(\"${selector}\")`

        if (count <= 1) return node

        return `[${Array.from({ length: count }, () => node).join(", ")}]`
      }

      return buildNode(0)
    }

    const registerSnippetExtension = (
      extensionId: string,
      extensionName: string,
      languages: string[],
      snippets: Array<{ label: string; body: string }>,
      triggerCharacters: string[] = [],
    ) => {
      if (!installedExtensions.includes(extensionId)) return

      const provider = {
        triggerCharacters,
        provideCompletionItems: (model: any, position: any) => {
          const wordInfo = model.getWordUntilPosition(position)
          const prefix = (wordInfo?.word || "").toLowerCase()

          const suggestions = snippets
            .filter((snippet) => !prefix || snippet.label.toLowerCase().startsWith(prefix))
            .map((snippet) => ({
              label: snippet.label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: snippet.body,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `${extensionName} extension`,
              detail: `Installed extension: ${extensionName}`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: wordInfo.startColumn,
                endColumn: wordInfo.endColumn,
              },
            }))

          return { suggestions }
        },
      }

      languages.forEach((language) => {
        extensionProviderDisposablesRef.current.push(
          monaco.languages.registerCompletionItemProvider(language, provider),
        )
      })
    }

    registerSnippetExtension(
      "emmet",
      "Emmet",
      ["html", "javascript", "typescript"],
      [
        { label: "div", body: "<div>$0</div>" },
        { label: "section", body: "<section>$0</section>" },
        { label: "article", body: "<article>$0</article>" },
        { label: "button", body: "<button type=\"button\">$0</button>" },
        { label: "input", body: "<input type=\"text\" />" },
        { label: "ul", body: "<ul>\n\t<li>$0</li>\n</ul>" },
        { label: "nav", body: "<nav>$0</nav>" },
        { label: "main", body: "<main>$0</main>" },
      ],
      [".", ">", "#", "*"],
    )

    if (installedExtensions.includes("emmet")) {
      const mithrilProvider = {
        triggerCharacters: [".", ">", "#", "*"],
        provideCompletionItems: (model: any, position: any) => {
          const lineContent = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
          const match = lineContent.match(/([a-zA-Z.#][a-zA-Z0-9.#>*_-]*)$/)
          if (!match?.[1]) return { suggestions: [] }

          const abbreviation = match[1]
          if (!abbreviation.includes(".") && !abbreviation.includes("#") && !abbreviation.includes(">") && !abbreviation.includes("*")) {
            return { suggestions: [] }
          }

          const expanded = expandMithrilZenCoding(abbreviation)
          if (!expanded) return { suggestions: [] }

          const startColumn = position.column - abbreviation.length

          return {
            suggestions: [
              {
                label: `mithril:${abbreviation}`,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: expanded,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Mithril Zen Coding via Emmet extension",
                detail: "Installed extension: Emmet (Mithril)",
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn,
                  endColumn: position.column,
                },
              },
            ],
          }
        },
      }

      extensionProviderDisposablesRef.current.push(
        monaco.languages.registerCompletionItemProvider("javascript", mithrilProvider),
        monaco.languages.registerCompletionItemProvider("typescript", mithrilProvider),
      )
    }

    registerSnippetExtension(
      "react-snippets",
      "React Snippets",
      ["javascript", "typescript"],
      [
        {
          label: "rfc",
          body: [
            "import React from 'react'",
            "",
            "interface ${1:Props} {}",
            "",
            "const ${2:ComponentName}: React.FC<${1:Props}> = () => {",
            "  return (",
            "    <div>$0</div>",
            "  )",
            "}",
            "",
            "export default ${2:ComponentName}",
          ].join("\n"),
        },
        {
          label: "rafce",
          body: [
            "import React from 'react'",
            "",
            "const ${1:ComponentName} = () => {",
            "  return (",
            "    <div>$0</div>",
            "  )",
            "}",
            "",
            "export default ${1:ComponentName}",
          ].join("\n"),
        },
        { label: "useState", body: "const [${1:state}, set${2:State}] = React.useState(${3:null})" },
        { label: "useEffect", body: ["React.useEffect(() => {", "  $0", "}, [${1:dependencies}])"].join("\n") },
      ],
      ["r", "u"],
    )

    registerSnippetExtension(
      "tailwind-snippets",
      "Tailwind CSS Snippets",
      ["html", "javascript", "typescript"],
      [
        { label: "tw-center", body: "className=\"flex items-center justify-center $0\"" },
        { label: "tw-card", body: "className=\"rounded-lg border bg-card p-4 shadow-sm $0\"" },
        { label: "tw-btn", body: "className=\"inline-flex items-center rounded-md px-4 py-2 text-sm font-medium $0\"" },
        { label: "tw-grid", body: "className=\"grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 $0\"" },
      ],
      ["t"],
    )

    registerSnippetExtension(
      "nextjs-snippets",
      "Next.js Snippets",
      ["javascript", "typescript"],
      [
        { label: "npage", body: ["export default function ${1:Page}() {", "  return (", "    <main>$0</main>", "  )", "}"].join("\n") },
        { label: "nlayout", body: ["export default function Layout({ children }: { children: React.ReactNode }) {", "  return <>{children}</>", "}"].join("\n") },
        { label: "nserver", body: ["export async function GET() {", "  return Response.json({ ok: true })", "}"].join("\n") },
        { label: "nclient", body: ["\"use client\"", "", "$0"].join("\n") },
      ],
      ["n"],
    )

    registerSnippetExtension(
      "typescript-essentials",
      "TypeScript Essentials",
      ["typescript", "javascript"],
      [
        { label: "tinterface", body: ["interface ${1:Name} {", "  $0", "}"].join("\n") },
        { label: "ttype", body: "type ${1:Name} = ${2:string}" },
        { label: "tenum", body: ["enum ${1:Name} {", "  ${2:Value} = \"${2:Value}\"", "}"].join("\n") },
        { label: "tguard", body: ["function is${1:Type}(value: unknown): value is ${1:Type} {", "  return $0", "}"].join("\n") },
      ],
      ["t"],
    )

    registerSnippetExtension(
      "node-express-snippets",
      "Node/Express Snippets",
      ["javascript", "typescript"],
      [
        { label: "express-server", body: ["import express from 'express'", "", "const app = express()", "", "app.get('/health', (_req, res) => {", "  res.json({ ok: true })", "})", "", "app.listen(${1:3000}, () => console.log('Server running'))"].join("\n") },
        { label: "express-route", body: ["router.${1:get}('/${2:path}', async (req, res) => {", "  $0", "})"].join("\n") },
        { label: "trycatch", body: ["try {", "  $0", "} catch (error) {", "  console.error(error)", "}"].join("\n") },
      ],
      ["e"],
    )

    registerSnippetExtension(
      "html-css-snippets",
      "HTML/CSS Snippets",
      ["html", "css"],
      [
        { label: "html5", body: ["<!doctype html>", "<html lang=\"en\">", "<head>", "  <meta charset=\"UTF-8\" />", "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />", "  <title>${1:Document}</title>", "</head>", "<body>", "  $0", "</body>", "</html>"].join("\n") },
        { label: "css-reset", body: ["* {", "  margin: 0;", "  padding: 0;", "  box-sizing: border-box;", "}"].join("\n") },
        { label: "flex-center", body: ["display: flex;", "align-items: center;", "justify-content: center;"].join("\n") },
      ],
      ["h", "c"],
    )

    registerSnippetExtension(
      "json-yaml-snippets",
      "JSON/YAML Snippets",
      ["json", "yaml"],
      [
        { label: "json-object", body: ["{\n  \"${1:key}\": \"${2:value}\"", "}"].join("\n") },
        { label: "json-array", body: ["[", "  \"${1:item}\"", "]"].join("\n") },
        { label: "yaml-basic", body: ["${1:key}: ${2:value}", "${3:enabled}: true"].join("\n") },
      ],
      ["j", "y"],
    )
  }, [installedExtensions])

  useEffect(() => {
    if (!monacoRef.current) return
    registerExtensionProviders(monacoRef.current)
  }, [installedExtensions, registerExtensionProviders])


  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(model, language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
  }

  useEffect(() => {
    updateEditorLanguage()
  }, [activeFile])

  // Cleanup on unmount
  useEffect(() => {
    const handleFocusIn = () => {
      const elapsed = Date.now() - lastTypingAtRef.current
      if (elapsed > 3000) return

      const activeElement = document.activeElement as HTMLElement | null
      if (!activeElement) return

      const isPreviewOrTerminalTarget =
        activeElement.tagName === "IFRAME" ||
        !!activeElement.closest(".xterm") ||
        activeElement.classList.contains("xterm-helper-textarea")

      if (isPreviewOrTerminalTarget && editorRef.current) {
        editorRef.current.focus()
      }
    }

    window.addEventListener("focusin", handleFocusIn, true)

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose()
        inlineCompletionProviderRef.current = null
      }
      if (contentChangeDisposableRef.current) {
        contentChangeDisposableRef.current.dispose()
        contentChangeDisposableRef.current = null
      }
      if (blurDisposableRef.current) {
        blurDisposableRef.current.dispose()
        blurDisposableRef.current = null
      }
      extensionProviderDisposablesRef.current.forEach((disposable) => disposable?.dispose?.())
      extensionProviderDisposablesRef.current = []
      window.removeEventListener("focusin", handleFocusIn, true)
    }
  }, [])

  return (
    <div className="h-full relative">
      {/* Loading indicator */}
      {suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-primary/10 px-2 py-1 rounded text-xs text-primary flex items-center gap-1 border border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          AI thinking...
        </div>
      )}

      {/* Active suggestion indicator */}
      {currentSuggestionRef.current && !suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-emerald-500/10 px-2 py-1 rounded text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Press Tab to accept
        </div>
      )}

      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
        options={defaultEditorOptions}
      />
    </div>
  )
}
