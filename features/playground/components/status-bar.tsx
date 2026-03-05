"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GitBranch, Wifi, WifiOff, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface StatusBarProps {
  isConnected: boolean
  hasUnsavedChanges: boolean
  activeFile?: string
  lineNumber?: number
  columnNumber?: number
  language?: string
  encoding?: string
  autoSaveEnabled?: boolean
  lastSaved?: Date
}

export function StatusBar({
  isConnected,
  hasUnsavedChanges,
  activeFile,
  lineNumber = 1,
  columnNumber = 1,
  language = "plaintext",
  encoding = "UTF-8",
  autoSaveEnabled = true,
  lastSaved,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-card/70 border-t border-border/60 flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {isConnected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-destructive" />}
          <span className={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Git Branch */}
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Unsaved Changes */}
        {hasUnsavedChanges && (
          <>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Unsaved changes</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        {/* Auto Save Status */}
        {autoSaveEnabled && (
          <>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-3 w-3" />
              <span>Auto Save</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        {/* Last Saved */}
        {lastSaved && (
          <>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Active File */}
        {activeFile && (
          <>
            <span className="font-medium">{activeFile}</span>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        {/* Cursor Position */}
        <span>
          Ln {lineNumber}, Col {columnNumber}
        </span>

        <Separator orientation="vertical" className="h-4" />

        {/* Language */}
        <Badge variant="secondary" className="h-4 text-xs">
          {language.toUpperCase()}
        </Badge>

        <Separator orientation="vertical" className="h-4" />

        {/* Encoding */}
        <span>{encoding}</span>
      </div>
    </div>
  )
}
