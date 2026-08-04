import type { Monaco } from "@monaco-editor/react";

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    
    // Web languages
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    
    // Markup/Documentation
    md: "markdown",
    markdown: "markdown",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    
    // Programming languages
    py: "python",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    sql: "sql",
    
    // Config files
    toml: "ini",
    ini: "ini",
    conf: "ini",
    dockerfile: "dockerfile",
  };
  
  return languageMap[extension] || "plaintext";
};

export const configureMonaco = (monaco: Monaco) => {
  // Define a beautiful modern dark theme
  monaco.editor.defineTheme("modern-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Comments
      { token: "comment", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.line", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.block", foreground: "7C7C7C", fontStyle: "italic" },
      
      // Keywords
      { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.control", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "D4D4D4" },
      
      // Strings
      { token: "string", foreground: "CE9178" },
      { token: "string.quoted", foreground: "CE9178" },
      { token: "string.template", foreground: "CE9178" },
      
      // Numbers
      { token: "number", foreground: "B5CEA8" },
      { token: "number.hex", foreground: "B5CEA8" },
      { token: "number.float", foreground: "B5CEA8" },
      
      // Functions
      { token: "entity.name.function", foreground: "DCDCAA" },
      { token: "support.function", foreground: "DCDCAA" },
      
      // Variables
      { token: "variable", foreground: "9CDCFE" },
      { token: "variable.parameter", foreground: "9CDCFE" },
      { token: "variable.other", foreground: "9CDCFE" },
      
      // Types
      { token: "entity.name.type", foreground: "4EC9B0" },
      { token: "support.type", foreground: "4EC9B0" },
      { token: "storage.type", foreground: "569CD6" },
      
      // Classes
      { token: "entity.name.class", foreground: "4EC9B0" },
      { token: "support.class", foreground: "4EC9B0" },
      
      // Constants
      { token: "constant", foreground: "4FC1FF" },
      { token: "constant.language", foreground: "569CD6" },
      { token: "constant.numeric", foreground: "B5CEA8" },
      
      // Operators
      { token: "keyword.operator", foreground: "D4D4D4" },
      { token: "punctuation", foreground: "D4D4D4" },
      
      // HTML/XML
      { token: "tag", foreground: "569CD6" },
      { token: "tag.id", foreground: "9CDCFE" },
      { token: "tag.class", foreground: "92C5F8" },
      { token: "attribute.name", foreground: "9CDCFE" },
      { token: "attribute.value", foreground: "CE9178" },
      
      // CSS
      { token: "attribute.name.css", foreground: "9CDCFE" },
      { token: "attribute.value.css", foreground: "CE9178" },
      { token: "property-name.css", foreground: "9CDCFE" },
      { token: "property-value.css", foreground: "CE9178" },
      
      // JSON
      { token: "key", foreground: "9CDCFE" },
      { token: "string.key", foreground: "9CDCFE" },
      { token: "string.value", foreground: "CE9178" },
      
      // Error/Warning
      { token: "invalid", foreground: "F44747", fontStyle: "underline" },
      { token: "invalid.deprecated", foreground: "D4D4D4", fontStyle: "strikethrough" },
    ],
    colors: {
      // Editor background
      "editor.background": "#0D1117",
      "editor.foreground": "#E6EDF3",
      
      // Line numbers
      "editorLineNumber.foreground": "#7D8590",
      "editorLineNumber.activeForeground": "#F0F6FC",
      
      // Cursor
      "editorCursor.foreground": "#F0F6FC",
      
      // Selection
      "editor.selectionBackground": "#264F78",
      "editor.selectionHighlightBackground": "#ADD6FF26",
      "editor.inactiveSelectionBackground": "#3A3D41",
      
      // Current line
      "editor.lineHighlightBackground": "#21262D",
      "editor.lineHighlightBorder": "#30363D",
      
      // Gutter
      "editorGutter.background": "#0D1117",
      "editorGutter.modifiedBackground": "#BB800966",
      "editorGutter.addedBackground": "#347D3966",
      "editorGutter.deletedBackground": "#F8514966",
      
      // Scrollbar
      "scrollbar.shadow": "#0008",
      "scrollbarSlider.background": "#6E768166",
      "scrollbarSlider.hoverBackground": "#6E768188",
      "scrollbarSlider.activeBackground": "#6E7681BB",
      
      // Minimap
      "minimap.background": "#161B22",
      "minimap.selectionHighlight": "#264F78",
      
      // Find/Replace
      "editor.findMatchBackground": "#9E6A03",
      "editor.findMatchHighlightBackground": "#F2CC6080",
      "editor.findRangeHighlightBackground": "#3FB95040",
      
      // Word highlight
      "editor.wordHighlightBackground": "#575757B8",
      "editor.wordHighlightStrongBackground": "#004972B8",
      
      // Brackets
      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#888888",
      
      // Indentation guides
      "editorIndentGuide.background": "#21262D",
      "editorIndentGuide.activeBackground": "#30363D",
      
      // Ruler
      "editorRuler.foreground": "#21262D",
      
      // Whitespace
      "editorWhitespace.foreground": "#6E7681",
      
      // Error/Warning squiggles
      "editorError.foreground": "#F85149",
      "editorWarning.foreground": "#D29922",
      "editorInfo.foreground": "#75BEFF",
      "editorHint.foreground": "#EEEEEE",
      
      // Suggest widget
      "editorSuggestWidget.background": "#161B22",
      "editorSuggestWidget.border": "#30363D",
      "editorSuggestWidget.foreground": "#E6EDF3",
      "editorSuggestWidget.selectedBackground": "#21262D",
      
      // Hover widget
      "editorHoverWidget.background": "#161B22",
      "editorHoverWidget.border": "#30363D",
      
      // Panel
      "panel.background": "#0D1117",
      "panel.border": "#30363D",
      
      // Activity bar
      "activityBar.background": "#0D1117",
      "activityBar.foreground": "#E6EDF3",
      "activityBar.border": "#30363D",
      
      // Side bar
      "sideBar.background": "#0D1117",
      "sideBar.foreground": "#E6EDF3",
      "sideBar.border": "#30363D",
    },
  });

  // Set the default theme
  monaco.editor.setTheme("modern-dark");

  // ── GitHub Light ────────────────────────────────────────────────────────────
  monaco.editor.defineTheme("github-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e7781", fontStyle: "italic" },
      { token: "keyword", foreground: "cf222e", fontStyle: "bold" },
      { token: "string", foreground: "0a3069" },
      { token: "number", foreground: "0550ae" },
      { token: "entity.name.function", foreground: "8250df" },
      { token: "variable", foreground: "953800" },
      { token: "entity.name.type", foreground: "116329" },
      { token: "tag", foreground: "116329" },
      { token: "attribute.name", foreground: "0550ae" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292f",
      "editorLineNumber.foreground": "#6e7781",
      "editorLineNumber.activeForeground": "#24292f",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editor.selectionBackground": "#0969da33",
      "editorCursor.foreground": "#0969da",
      "editorGutter.background": "#ffffff",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#d0d7de",
      "editorHoverWidget.background": "#ffffff",
      "editorHoverWidget.border": "#d0d7de",
    },
  });

  // ── Dracula ──────────────────────────────────────────────────────────────────
  monaco.editor.defineTheme("dracula", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
      { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
      { token: "string", foreground: "f1fa8c" },
      { token: "number", foreground: "bd93f9" },
      { token: "entity.name.function", foreground: "50fa7b" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "entity.name.type", foreground: "8be9fd", fontStyle: "italic" },
      { token: "tag", foreground: "ff79c6" },
      { token: "attribute.name", foreground: "50fa7b" },
      { token: "attribute.value", foreground: "f1fa8c" },
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#6272a4",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editor.lineHighlightBackground": "#44475a",
      "editor.selectionBackground": "#44475a",
      "editorCursor.foreground": "#f8f8f2",
      "editorGutter.background": "#282a36",
      "editorSuggestWidget.background": "#282a36",
      "editorSuggestWidget.border": "#6272a4",
      "editorHoverWidget.background": "#282a36",
      "editorHoverWidget.border": "#6272a4",
    },
  });

  // ── One Dark Pro ─────────────────────────────────────────────────────────────
  monaco.editor.defineTheme("one-dark-pro", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "keyword", foreground: "c678dd", fontStyle: "bold" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" },
      { token: "entity.name.function", foreground: "61afef" },
      { token: "variable", foreground: "e06c75" },
      { token: "entity.name.type", foreground: "e5c07b" },
      { token: "tag", foreground: "e06c75" },
      { token: "attribute.name", foreground: "d19a66" },
      { token: "attribute.value", foreground: "98c379" },
    ],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "editorLineNumber.foreground": "#4b5263",
      "editorLineNumber.activeForeground": "#abb2bf",
      "editor.lineHighlightBackground": "#2c313a",
      "editor.selectionBackground": "#3e4451",
      "editorCursor.foreground": "#528bff",
      "editorGutter.background": "#282c34",
      "editorSuggestWidget.background": "#21252b",
      "editorSuggestWidget.border": "#181a1f",
      "editorHoverWidget.background": "#21252b",
      "editorHoverWidget.border": "#181a1f",
    },
  });
  
  // ── Built-in Snippet Engine ───────────────────────────────────────────────────
  // Register snippet completions for TypeScript / JavaScript / TSX / JSX
  const tsSnippets: Array<{
    label: string;
    detail: string;
    insertText: string;
    docs?: string;
  }> = [
    // ── React Components ────────────────────────────────────────────────────────
    {
      label: "rfc",
      detail: "React Functional Component",
      docs: "Scaffold a typed React functional component",
      insertText: [
        "import React from 'react';",
        "",
        "interface ${1:ComponentName}Props {",
        "  ${2:// props}",
        "}",
        "",
        "const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = (${3:props}) => {",
        "  return (",
        "    <div>${4}</div>",
        "  );",
        "};",
        "",
        "export default ${1:ComponentName};",
      ].join("\n"),
    },
    {
      label: "rfce",
      detail: "React Functional Component (export)",
      insertText: [
        "export function ${1:ComponentName}() {",
        "  return (",
        "    <div>${2}</div>",
        "  );",
        "}",
      ].join("\n"),
    },
    {
      label: "rsc",
      detail: "React Server Component (Next.js)",
      docs: "Next.js async server component",
      insertText: [
        "export default async function ${1:PageName}() {",
        "  return (",
        "    <main>",
        "      <h1>${2:Hello}</h1>",
        "    </main>",
        "  );",
        "}",
      ].join("\n"),
    },
    {
      label: "npage",
      detail: "Next.js Page with params",
      insertText: [
        "interface PageProps {",
        "  params: { ${1:id}: string };",
        "  searchParams: Record<string, string>;",
        "}",
        "",
        "export default async function ${2:Page}({ params }: PageProps) {",
        "  return (",
        "    <div>${3}</div>",
        "  );",
        "}",
      ].join("\n"),
    },
    {
      label: "nlayout",
      detail: "Next.js Layout component",
      insertText: [
        "export default function ${1:Layout}({",
        "  children,",
        "}: {",
        "  children: React.ReactNode;",
        "}) {",
        "  return (",
        "    <div>",
        "      ${2:// layout content}",
        "      {children}",
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
    },
    {
      label: "nroute",
      detail: "Next.js API Route Handler",
      insertText: [
        "import { NextRequest, NextResponse } from 'next/server';",
        "",
        "export async function GET(req: NextRequest) {",
        "  try {",
        "    return NextResponse.json({ ${1:data} });",
        "  } catch (error) {",
        "    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });",
        "  }",
        "}",
        "",
        "export async function POST(req: NextRequest) {",
        "  const body = await req.json();",
        "  try {",
        "    return NextResponse.json({ ${2:data} }, { status: 201 });",
        "  } catch (error) {",
        "    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });",
        "  }",
        "}",
      ].join("\n"),
    },
    // ── React Hooks ─────────────────────────────────────────────────────────────
    {
      label: "useState",
      detail: "React useState hook",
      insertText: "const [${1:state}, set${2:State}] = useState<${3:string}>(${4:''});",
    },
    {
      label: "useEffect",
      detail: "React useEffect hook",
      insertText: [
        "useEffect(() => {",
        "  ${1:// effect}",
        "  return () => {",
        "    ${2:// cleanup}",
        "  };",
        "}, [${3:deps}]);",
      ].join("\n"),
    },
    {
      label: "useCallback",
      detail: "React useCallback hook",
      insertText: [
        "const ${1:handler} = useCallback(${2:(...args) => {",
        "  ${3:// handler}",
        "}}, [${4:deps}]);",
      ].join("\n"),
    },
    {
      label: "useMemo",
      detail: "React useMemo hook",
      insertText: "const ${1:value} = useMemo(() => ${2:computeValue}, [${3:deps}]);",
    },
    {
      label: "useRef",
      detail: "React useRef hook",
      insertText: "const ${1:ref} = useRef<${2:HTMLDivElement}>(null);",
    },
    {
      label: "useContext",
      detail: "React useContext hook",
      insertText: "const ${1:value} = useContext(${2:Context});",
    },
    {
      label: "useReducer",
      detail: "React useReducer hook",
      insertText: [
        "type ${1:Action} =",
        "  | { type: '${2:INCREMENT}' }",
        "  | { type: '${3:DECREMENT}' };",
        "",
        "function reducer(state: ${4:State}, action: ${1:Action}): ${4:State} {",
        "  switch (action.type) {",
        "    case '${2:INCREMENT}':",
        "      return ${5:state};",
        "    default:",
        "      return state;",
        "  }",
        "}",
        "",
        "const [state, dispatch] = useReducer(reducer, ${6:initialState});",
      ].join("\n"),
    },
    {
      label: "ucustom",
      detail: "Custom React hook",
      insertText: [
        "import { useState, useEffect } from 'react';",
        "",
        "export function use${1:HookName}(${2:param}: ${3:string}) {",
        "  const [data, setData] = useState<${4:any}>(null);",
        "  const [loading, setLoading] = useState(false);",
        "  const [error, setError] = useState<Error | null>(null);",
        "",
        "  useEffect(() => {",
        "    setLoading(true);",
        "    ${5:// fetch or compute}",
        "    setLoading(false);",
        "  }, [${2:param}]);",
        "",
        "  return { data, loading, error };",
        "}",
      ].join("\n"),
    },
    // ── TypeScript ───────────────────────────────────────────────────────────────
    {
      label: "interface",
      detail: "TypeScript interface",
      insertText: [
        "interface ${1:Name} {",
        "  ${2:key}: ${3:string};",
        "}",
      ].join("\n"),
    },
    {
      label: "type",
      detail: "TypeScript type alias",
      insertText: "type ${1:Name} = ${2:string | number};",
    },
    {
      label: "enum",
      detail: "TypeScript enum",
      insertText: [
        "enum ${1:Name} {",
        "  ${2:Value1} = '${3:value1}',",
        "  ${4:Value2} = '${5:value2}',",
        "}",
      ].join("\n"),
    },
    {
      label: "generic",
      detail: "TypeScript generic function",
      insertText: "function ${1:name}<${2:T}>(${3:arg}: ${2:T}): ${4:T} {\n  return ${3:arg};\n}",
    },
    // ── Async / Fetch ────────────────────────────────────────────────────────────
    {
      label: "afn",
      detail: "Async arrow function",
      insertText: "const ${1:fn} = async (${2:args}) => {\n  ${3:// body}\n};",
    },
    {
      label: "trycatch",
      detail: "Try / catch / finally block",
      insertText: [
        "try {",
        "  ${1:// code}",
        "} catch (error) {",
        "  console.error('${2:Error}:', error);",
        "  ${3:// handle error}",
        "} finally {",
        "  ${4:// cleanup}",
        "}",
      ].join("\n"),
    },
    {
      label: "fetchapi",
      detail: "Fetch API call with error handling",
      insertText: [
        "const ${1:fetchData} = async () => {",
        "  try {",
        "    const response = await fetch('${2:https://api.example.com/endpoint}');",
        "    if (!response.ok) throw new Error(`HTTP error: \\${response.status}`);",
        "    const data = await response.json();",
        "    return data;",
        "  } catch (error) {",
        "    console.error('Fetch failed:', error);",
        "    throw error;",
        "  }",
        "};",
      ].join("\n"),
    },
    // ── Express / Node ───────────────────────────────────────────────────────────
    {
      label: "express",
      detail: "Express.js app boilerplate",
      insertText: [
        "import express from 'express';",
        "",
        "const app = express();",
        "const PORT = process.env.PORT || ${1:3000};",
        "",
        "app.use(express.json());",
        "app.use(express.urlencoded({ extended: true }));",
        "",
        "app.get('/', (req, res) => {",
        "  res.json({ message: '${2:Hello World}' });",
        "});",
        "",
        "app.listen(PORT, () => {",
        "  console.log(`Server running on port \\${PORT}`);",
        "});",
        "",
        "export default app;",
      ].join("\n"),
    },
    {
      label: "router",
      detail: "Express Router",
      insertText: [
        "import { Router } from 'express';",
        "",
        "const router = Router();",
        "",
        "router.get('/', async (req, res) => {",
        "  try {",
        "    res.json({ data: ${1:null} });",
        "  } catch (err) {",
        "    res.status(500).json({ error: 'Server error' });",
        "  }",
        "});",
        "",
        "export default router;",
      ].join("\n"),
    },
    // ── Prisma ───────────────────────────────────────────────────────────────────
    {
      label: "prisma-find",
      detail: "Prisma findMany query",
      insertText: [
        "const ${1:items} = await db.${2:model}.findMany({",
        "  where: { ${3:field}: ${4:value} },",
        "  orderBy: { createdAt: 'desc' },",
        "  take: ${5:10},",
        "});",
      ].join("\n"),
    },
    {
      label: "prisma-create",
      detail: "Prisma create record",
      insertText: [
        "const ${1:item} = await db.${2:model}.create({",
        "  data: {",
        "    ${3:field}: ${4:value},",
        "  },",
        "});",
      ].join("\n"),
    },
    // ── Console & Debug ──────────────────────────────────────────────────────────
    {
      label: "cl",
      detail: "console.log",
      insertText: "console.log(${1:'${2:debug}', ${3:value}});",
    },
    {
      label: "ce",
      detail: "console.error",
      insertText: "console.error('${1:Error}:', ${2:error});",
    },
    {
      label: "clg",
      detail: "console.log with label",
      insertText: "console.log('🔍 ${1:label}:', ${2:value});",
    },
    // ── Imports ──────────────────────────────────────────────────────────────────
    {
      label: "imp",
      detail: "ES6 import",
      insertText: "import ${1:module} from '${2:package}';",
    },
    {
      label: "imn",
      detail: "Named import",
      insertText: "import { ${1:named} } from '${2:package}';",
    },
    {
      label: "imd",
      detail: "Default + named import",
      insertText: "import ${1:Default}, { ${2:named} } from '${3:package}';",
    },
  ];

  for (const lang of ["typescript", "javascript", "typescriptreact", "javascriptreact"]) {
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems(model, position) {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };
        return {
          suggestions: tsSnippets.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: s.detail,
            documentation: s.docs ?? s.detail,
            insertText: s.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          })),
        };
      },
    });
  }

  // ── CSS Snippets ─────────────────────────────────────────────────────────────
  const cssSnippets = [
    { label: "flex", detail: "Flexbox container", insertText: "display: flex;\nalign-items: ${1:center};\njustify-content: ${2:space-between};" },
    { label: "flexcol", detail: "Flex column", insertText: "display: flex;\nflex-direction: column;\nalign-items: ${1:center};\ngap: ${2:1rem};" },
    { label: "grid", detail: "CSS Grid", insertText: "display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:1rem};" },
    { label: "center", detail: "Absolute centering", insertText: "position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);" },
    { label: "hover", detail: "Hover transition", insertText: "transition: ${1:all} ${2:0.2s} ${3:ease};\n&:hover {\n  ${4:opacity: 0.8;}\n}" },
    { label: "animation", detail: "CSS animation", insertText: "@keyframes ${1:name} {\n  from { ${2:opacity: 0;} }\n  to { ${3:opacity: 1;} }\n}\n\n.${4:element} {\n  animation: ${1:name} ${5:0.3s} ${6:ease} forwards;\n}" },
    { label: "responsive", detail: "Media query breakpoint", insertText: "@media (max-width: ${1:768px}) {\n  ${2:// styles}\n}" },
    { label: "vars", detail: "CSS variables", insertText: ":root {\n  --${1:color-primary}: ${2:#6366f1};\n  --${3:color-secondary}: ${4:#8b5cf6};\n}" },
    { label: "shadow", detail: "Box shadow", insertText: "box-shadow: ${1:0 4px 6px -1px} rgba(${2:0, 0, 0}, ${3:0.1}), ${4:0 2px 4px -1px} rgba(${2:0, 0, 0}, ${5:0.06});" },
    { label: "gradient", detail: "Linear gradient", insertText: "background: linear-gradient(${1:135deg}, ${2:#6366f1} 0%, ${3:#8b5cf6} 100%);" },
    { label: "glassmorphism", detail: "Glass effect", insertText: "background: rgba(${1:255, 255, 255}, ${2:0.1});\nbackdrop-filter: blur(${3:10px});\nborder: 1px solid rgba(${1:255, 255, 255}, ${4:0.2});\nborder-radius: ${5:12px};" },
    { label: "truncate", detail: "Text truncation", insertText: "overflow: hidden;\ntext-overflow: ellipsis;\nwhite-space: nowrap;" },
    { label: "scrollbar", detail: "Custom scrollbar", insertText: "&::-webkit-scrollbar {\n  width: ${1:6px};\n}\n&::-webkit-scrollbar-track {\n  background: ${2:transparent};\n}\n&::-webkit-scrollbar-thumb {\n  background: ${3:#6366f1};\n  border-radius: ${4:3px};\n}" },
  ];

  monaco.languages.registerCompletionItemProvider("css", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return {
        suggestions: cssSnippets.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: s.detail,
          insertText: s.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });

  // ── HTML / Emmet-style Snippets ───────────────────────────────────────────────
  const htmlSnippets = [
    { label: "!", detail: "HTML5 boilerplate", insertText: "<!DOCTYPE html>\n<html lang=\"${1:en}\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>${2:Document}</title>\n</head>\n<body>\n  ${3}\n</body>\n</html>" },
    { label: "div", detail: "div with class", insertText: "<div class=\"${1:container}\">\n  ${2}\n</div>" },
    { label: "nav", detail: "Navigation bar", insertText: "<nav class=\"${1:navbar}\">\n  <ul>\n    <li><a href=\"${2:#}\">${3:Home}</a></li>\n    <li><a href=\"${4:#}\">${5:About}</a></li>\n  </ul>\n</nav>" },
    { label: "form", detail: "HTML Form", insertText: "<form action=\"${1:#}\" method=\"${2:post}\">\n  <label for=\"${3:field}\">${4:Label}</label>\n  <input type=\"${5:text}\" id=\"${3:field}\" name=\"${3:field}\" />\n  <button type=\"submit\">${6:Submit}</button>\n</form>" },
    { label: "table", detail: "HTML Table", insertText: "<table>\n  <thead>\n    <tr>\n      <th>${1:Column}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>${2:Data}</td>\n    </tr>\n  </tbody>\n</table>" },
    { label: "link", detail: "CSS link tag", insertText: "<link rel=\"stylesheet\" href=\"${1:styles.css}\" />" },
    { label: "script", detail: "Script tag", insertText: "<script src=\"${1:script.js}\"></script>" },
    { label: "img", detail: "Image tag", insertText: "<img src=\"${1:image.png}\" alt=\"${2:description}\" width=\"${3:100}\" height=\"${4:100}\" />" },
    { label: "meta", detail: "Meta tags (SEO)", insertText: "<meta name=\"description\" content=\"${1:Page description}\" />\n<meta name=\"keywords\" content=\"${2:keyword1, keyword2}\" />\n<meta name=\"author\" content=\"${3:Author Name}\" />" },
    { label: "section", detail: "Section with heading", insertText: "<section id=\"${1:section-id}\">\n  <h2>${2:Section Title}</h2>\n  <p>${3:Content}</p>\n</section>" },
    { label: "ul", detail: "Unordered list", insertText: "<ul>\n  <li>${1:Item 1}</li>\n  <li>${2:Item 2}</li>\n  <li>${3:Item 3}</li>\n</ul>" },
    { label: "input", detail: "Input field", insertText: "<input type=\"${1:text}\" id=\"${2:id}\" name=\"${2:id}\" placeholder=\"${3:Enter value}\" class=\"${4}\" />" },
    { label: "btn", detail: "Button element", insertText: "<button type=\"${1:button}\" class=\"${2:btn}\" onclick=\"${3:handler}\">\n  ${4:Click me}\n</button>" },
  ];

  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: ["<", "!", "."],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return {
        suggestions: htmlSnippets.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: s.detail,
          insertText: s.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });

  // Configure additional editor settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Set compiler options for better IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });
};


export const defaultEditorOptions = {
  // Font settings
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  fontLigatures: true,
  fontWeight: "400",
  
  // Layout
  minimap: { 
    enabled: true,
    size: "proportional",
    showSlider: "mouseover"
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  
  // Line settings
  lineNumbers: "on",
  lineHeight: 20,
  renderLineHighlight: "all",
  renderWhitespace: "selection",
  
  // Indentation
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  
  // Word wrapping
  wordWrap: "on",
  wordWrapColumn: 120,
  wrappingIndent: "indent",
  
  // Code folding
  folding: true,
  foldingHighlight: true,
  foldingStrategy: "indentation",
  showFoldingControls: "mouseover",
  
  // Scrolling
  smoothScrolling: true,
  mouseWheelZoom: true,
  fastScrollSensitivity: 5,
  
  // Selection
  multiCursorModifier: "ctrlCmd",
  selectionHighlight: true,
  occurrencesHighlight: "singleFile",
  
  // Suggestions
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on",
  tabCompletion: "on",
  wordBasedSuggestions: "currentDocument",
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  
  // Formatting
  formatOnPaste: true,
  formatOnType: true,
  
  // Bracket matching
  matchBrackets: "always",
  bracketPairColorization: {
    enabled: true
  },
  
  // Guides
  renderIndentGuides: true,
  highlightActiveIndentGuide: true,
  rulers: [80, 120] as number[],
  
  // Performance
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  
  // Accessibility
  accessibilitySupport: "auto",
  
  // Cursor
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  cursorStyle: "line",
  cursorWidth: 2,
  
  // Find
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "always"
  },
  
  // Hover
  hover: {
    enabled: true,
    delay: 300,
    sticky: true
  },
  
  // Semantic highlighting
  "semanticHighlighting.enabled": true,
  
  // Sticky scroll
  stickyScroll: {
    enabled: true
  }
} as const;