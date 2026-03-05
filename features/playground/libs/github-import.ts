import path from "path"
import type { TemplateFolder } from "./path-to-json"

export type PlaygroundTemplate = "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR"

interface ParseResult {
  owner: string
  repo: string
}

interface GitHubRepoMetadata {
  defaultBranch: string
  description: string | null
  name: string
}

interface GitTreeEntry {
  path: string
  mode: string
  type: "blob" | "tree"
  sha: string
  size?: number
}

interface GitTreeResponse {
  tree: GitTreeEntry[]
  truncated: boolean
}

const MAX_FILE_BYTES = 300_000
const MAX_FILES = 220

const SKIPPED_FOLDERS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
  "target",
  "vendor",
])

const TEXT_FILE_ALLOWLIST = new Set([
  "js", "jsx", "ts", "tsx", "json", "md", "txt", "html", "css", "scss", "sass", "less", "yml", "yaml", "xml", "svg",
  "py", "java", "go", "rs", "c", "cpp", "h", "hpp", "php", "rb", "sh", "bash", "env", "toml", "ini", "lock", "sql",
])

const FILE_NAME_ALLOWLIST = new Set([
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "Makefile",
  ".gitignore",
  ".npmrc",
  ".eslintrc",
  ".prettierrc",
])

function parseRepoInput(repoInput: string): ParseResult {
  const trimmed = repoInput.trim().replace(/\.git$/, "")
  if (!trimmed) {
    throw new Error("Repository input is required")
  }

  const directMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (directMatch) {
    return { owner: directMatch[1], repo: directMatch[2] }
  }

  const urlMatch = trimmed.match(/^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(?:\/.*)?$/i)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }

  throw new Error("Invalid repository format. Use owner/repo or a GitHub repo URL")
}

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "vibecode-playground-importer",
  }

  if (token?.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`
  }

  return headers
}

async function fetchGitHubJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: getHeaders(token),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub API error (${response.status}): ${errorText}`)
  }

  return (await response.json()) as T
}

function shouldSkipPath(filePath: string): boolean {
  const parts = filePath.split("/")
  if (parts.some((part) => SKIPPED_FOLDERS.has(part))) {
    return true
  }

  const filename = parts[parts.length - 1]
  if (FILE_NAME_ALLOWLIST.has(filename)) {
    return false
  }

  const extension = path.posix.extname(filename).slice(1).toLowerCase()
  if (!extension) {
    return false
  }

  return !TEXT_FILE_ALLOWLIST.has(extension)
}

function decodeGitHubBlob(content: string): string {
  const normalized = content.replace(/\n/g, "")
  return Buffer.from(normalized, "base64").toString("utf8")
}

function detectTemplate(fileMap: Map<string, string>): PlaygroundTemplate {
  const packageJsonRaw = fileMap.get("package.json")
  if (fileMap.has("angular.json")) {
    return "ANGULAR"
  }

  if (!packageJsonRaw) {
    return "REACT"
  }

  try {
    const pkg = JSON.parse(packageJsonRaw) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    }

    if (deps["next"]) return "NEXTJS"
    if (deps["hono"]) return "HONO"
    if (deps["vue"]) return "VUE"
    if (deps["express"]) return "EXPRESS"
    if (deps["@angular/core"]) return "ANGULAR"
    if (deps["react"]) return "REACT"
  } catch {
    return "REACT"
  }

  return "REACT"
}

function toTemplateFolder(fileMap: Map<string, string>): TemplateFolder {
  const root: TemplateFolder = {
    folderName: "Root",
    items: [],
  }

  for (const [fullPath, content] of fileMap.entries()) {
    const parts = fullPath.split("/").filter(Boolean)
    if (!parts.length) continue

    let currentFolder = root

    for (let index = 0; index < parts.length; index++) {
      const segment = parts[index]
      const isLast = index === parts.length - 1

      if (isLast) {
        const extension = path.posix.extname(segment)
        const filename = segment.slice(0, segment.length - extension.length)

        currentFolder.items.push({
          filename: filename || segment,
          fileExtension: extension.replace(/^\./, ""),
          content,
        })
        continue
      }

      const existingFolder = currentFolder.items.find(
        (item): item is TemplateFolder => "folderName" in item && item.folderName === segment,
      )

      if (existingFolder) {
        currentFolder = existingFolder
      } else {
        const newFolder: TemplateFolder = {
          folderName: segment,
          items: [],
        }
        currentFolder.items.push(newFolder)
        currentFolder = newFolder
      }
    }
  }

  return root
}

async function fetchRepoMetadata(owner: string, repo: string, token?: string): Promise<GitHubRepoMetadata> {
  const repoInfo = await fetchGitHubJson<{
    default_branch: string
    description: string | null
    name: string
  }>(`https://api.github.com/repos/${owner}/${repo}`, token)

  return {
    defaultBranch: repoInfo.default_branch,
    description: repoInfo.description,
    name: repoInfo.name,
  }
}

async function fetchRepoTree(owner: string, repo: string, branch: string, token?: string): Promise<GitTreeEntry[]> {
  const tree = await fetchGitHubJson<GitTreeResponse>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    token,
  )

  if (tree.truncated) {
    throw new Error("Repository is too large to import in one go. Please use a smaller project.")
  }

  return tree.tree.filter((entry) => entry.type === "blob")
}

async function fetchBlobContent(owner: string, repo: string, sha: string, token?: string): Promise<string> {
  const blob = await fetchGitHubJson<{ content: string; encoding: string }>(
    `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
    token,
  )

  if (blob.encoding !== "base64") {
    throw new Error("Unsupported blob encoding from GitHub")
  }

  return decodeGitHubBlob(blob.content)
}

export interface ImportedRepository {
  title: string
  description: string
  template: PlaygroundTemplate
  templateData: TemplateFolder
  sourceRepo: string
  sourceBranch: string
  importedFileCount: number
}

export async function importGitHubRepository(repoInput: string, branchInput?: string, token?: string): Promise<ImportedRepository> {
  const { owner, repo } = parseRepoInput(repoInput)
  const metadata = await fetchRepoMetadata(owner, repo, token)
  const branch = branchInput?.trim() || metadata.defaultBranch
  const treeEntries = await fetchRepoTree(owner, repo, branch, token)

  const candidateEntries = treeEntries
    .filter((entry) => !shouldSkipPath(entry.path))
    .filter((entry) => (entry.size || 0) <= MAX_FILE_BYTES)
    .slice(0, MAX_FILES)

  if (!candidateEntries.length) {
    throw new Error("No importable source files found in repository")
  }

  const fileMap = new Map<string, string>()

  for (const entry of candidateEntries) {
    try {
      const content = await fetchBlobContent(owner, repo, entry.sha, token)
      fileMap.set(entry.path, content)
    } catch {
      continue
    }
  }

  if (!fileMap.size) {
    throw new Error("Failed to fetch repository files")
  }

  const template = detectTemplate(fileMap)
  const templateData = toTemplateFolder(fileMap)

  return {
    title: repo,
    description: metadata.description || `Imported from ${owner}/${repo}`,
    template,
    templateData,
    sourceRepo: `${owner}/${repo}`,
    sourceBranch: branch,
    importedFileCount: fileMap.size,
  }
}
