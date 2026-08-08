import { notFound } from "next/navigation"
import { getPublicPlaygroundById } from "@/features/playground/actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, Eye } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const playground = await getPublicPlaygroundById(id)
  if (!playground || !playground.isPublic) {
    return { title: "Playground Not Found" }
  }
  return {
    title: `${playground.title} | vibe-ai-ide`,
    description: playground.description || `A ${playground.template} playground shared via vibe-ai-ide`,
  }
}

export default async function SharePlaygroundPage({ params }: Props) {
  const { id } = await params
  const playground = await getPublicPlaygroundById(id)

  if (!playground) {
    notFound()
  }

  if (!playground.isPublic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">This playground is private</h1>
        <p className="text-muted-foreground">The owner hasn&apos;t made this playground public yet.</p>
        <Link href="/" className="text-primary hover:underline text-sm">
          Go to vibe-ai-ide →
        </Link>
      </div>
    )
  }

  interface FileNode {
    filename: string
    fileExtension: string
    content?: string
  }

  interface FolderNode {
    folderName: string
    items: Array<FileNode | FolderNode>
  }

  type FileTreeNode = FileNode | FolderNode

  const rawContent = playground.templateFiles?.[0]?.content
  let fileTree: FolderNode | null = null
  try {
    fileTree = rawContent ? (JSON.parse(rawContent as string) as FolderNode) : null
  } catch {
    fileTree = null
  }

  // Flatten all files for display
  function flattenFiles(node: FileTreeNode, path = ""): Array<{ path: string; content: string; ext: string }> {
    if (!node) return []
    if ("filename" in node) {
      return [{ path: path ? `${path}/${node.filename}.${node.fileExtension}` : `${node.filename}.${node.fileExtension}`, content: node.content || "", ext: node.fileExtension || "txt" }]
    }
    if ("items" in node) {
      const folderPath = path ? `${path}/${node.folderName}` : node.folderName
      return node.items.flatMap((item) => flattenFiles(item, folderPath === "Root" ? "" : folderPath))
    }
    return []
  }

  const files = fileTree ? flattenFiles(fileTree) : []
  const firstFile = files[0]

  const templateColors: Record<string, string> = {
    REACT: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    NEXTJS: "bg-foreground/10 text-foreground border-foreground/30",
    VUE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    EXPRESS: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    HONO: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    ANGULAR: "bg-red-500/10 text-red-600 border-red-500/30",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b border-border/60 bg-card/70 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            vibe-ai-ide
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-sm font-medium">{playground.title}</h1>
          <Badge
            variant="outline"
            className={`text-xs ${templateColors[playground.template] || ""}`}
          >
            {playground.template}
          </Badge>
          <Badge variant="secondary" className="text-xs gap-1">
            <Eye className="h-3 w-3" />
            Public
          </Badge>
        </div>

        {playground.user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={playground.user.image || ""} />
              <AvatarFallback className="text-xs">{playground.user.name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <span>{playground.user.name}</span>
          </div>
        )}
      </header>

      {/* Main content — file browser + code viewer */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* File list sidebar */}
        <aside className="w-64 border-r border-border/60 bg-card/40 overflow-y-auto p-3 shrink-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 px-1">
            Files ({files.length})
          </p>
          <ul className="space-y-0.5">
            {files.map((file) => (
              <li key={file.path}>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-default">
                  <span className="text-muted-foreground truncate">{file.path}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Code preview */}
        <main className="flex-1 overflow-auto">
          {firstFile ? (
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">{firstFile.path}</span>
              </div>
              <pre className="rounded-lg border border-border/60 bg-[#0D1117] text-[#E6EDF3] p-6 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {firstFile.content || "(empty file)"}
              </pre>
              {files.length > 1 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  + {files.length - 1} more file{files.length > 2 ? "s" : ""} — sign in to open the full IDE
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <p>No files in this playground</p>
            </div>
          )}
        </main>
      </div>

      {/* CTA footer */}
      <div className="fixed bottom-0 inset-x-0 border-t border-border/60 bg-card/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          View-only mode • Sign in to fork and edit this playground
        </p>
        <Link
          href="/auth/sign-in"
          className="text-sm font-medium text-primary hover:underline"
        >
          Sign in to vibe-ai-ide →
        </Link>
      </div>
    </div>
  )
}
