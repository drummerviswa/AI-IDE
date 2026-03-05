"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2, Sparkles, Settings, Plus, Lightbulb } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlayground } from "../context/playground-context"

export function PlaygroundHeader() {
  const {
    playgroundData,
    activeFileId,
    openFiles,
    handleSave,
    handleSaveAll,
    isAISuggestionsEnabled,
    setIsAISuggestionsEnabled,
    setIsPreviewVisible,
    setIsTerminalVisible,
    isPreviewVisible,
    isTerminalVisible,
  } = usePlayground()

  const selectedFile = activeFileId ? openFiles.find((f) => f.id === activeFileId) : null
  const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedChanges)

  return (
    <header className="h-14 border-b border-border/60 bg-card/70 backdrop-blur-sm flex items-center px-4 justify-between">
      <div className="flex items-center">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-lg font-semibold">{playgroundData?.name || "Code Editor"}</h1>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedFile.fileExtension ? `${selectedFile.filename}.${selectedFile.fileExtension}` : selectedFile.filename}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave()}
            disabled={!selectedFile.hasUnsavedChanges}
            className="border-border/70 bg-background/70 hover:bg-accent"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges}
            className="border-border/70 bg-background/70 hover:bg-accent"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="border-border/70 bg-background/70 hover:bg-accent">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                {isPreviewVisible ? "Hide" : "Show"} Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTerminalVisible(!isTerminalVisible)}>
                {isTerminalVisible ? "Hide" : "Show"} Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAISuggestionsEnabled(!isAISuggestionsEnabled)}>
                {isAISuggestionsEnabled ? "Disable" : "Enable"} AI Suggestions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}