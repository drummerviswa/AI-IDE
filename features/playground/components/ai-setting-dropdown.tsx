"use client"

import type React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Settings, SlidersHorizontal, ExternalLink, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISettingsDropdownProps {
  isAISuggestionsEnabled: boolean
  onToggleAISuggestions: (enabled: boolean) => void
  isCodeCompletionAllFilesEnabled: boolean
  onToggleCodeCompletionAllFiles: (enabled: boolean) => void
  isCodeCompletionTSXEnabled: boolean
  onToggleCodeCompletionTSX: (enabled: boolean) => void
  isNextEditSuggestionsEnabled: boolean
  onToggleNextEditSuggestions: (enabled: boolean) => void
  onTriggerAISuggestion: (type: string, mode: "overlay" | "inline") => void
  suggestionLoading: boolean
  activeFile: any // Replace 'any' with actual file type if available
}

export const AISettingsDropdown: React.FC<AISettingsDropdownProps> = ({
  isAISuggestionsEnabled,
  onToggleAISuggestions,
  isCodeCompletionAllFilesEnabled,
  onToggleCodeCompletionAllFiles,
  isCodeCompletionTSXEnabled,
  onToggleCodeCompletionTSX,
  isNextEditSuggestionsEnabled,
  onToggleNextEditSuggestions,
  onTriggerAISuggestion,
  suggestionLoading,
  activeFile,
}) => {
  // Mock usage data
  const codeCompletionsUsage = 5
  const chatMessagesUsage = 45
  const allowanceResetDate = "June 22, 2025"

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className="relative h-8 w-8" // Adjusted size for better fit
                onClick={() => onToggleAISuggestions(!isAISuggestionsEnabled)}
              >
                <Sparkles className={cn("w-5 h-5", { "opacity-50": !isAISuggestionsEnabled, "text-primary": isAISuggestionsEnabled })} />
                {!isAISuggestionsEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-destructive rotate-45 rounded-full"></div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{isAISuggestionsEnabled ? "Disable AI Suggestions" : "Enable AI Suggestions"}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-72 p-2 bg-popover text-popover-foreground border-border/70">
          {/* Copilot Usage Section */}
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            Copilot Usage
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <SlidersHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuLabel>
          <div className="px-2 py-1">
            <div className="text-sm font-medium flex items-center justify-between mb-1">
              Code completions
              <span className="text-xs text-muted-foreground">{codeCompletionsUsage}%</span>
            </div>
            <Progress value={codeCompletionsUsage} className="h-1.5 mb-3" indicatorColor="bg-primary" />

            <div className="text-sm font-medium flex items-center justify-between mb-1">
              Chat messages
              <span className="text-xs text-muted-foreground">{chatMessagesUsage}%</span>
            </div>
            <Progress value={chatMessagesUsage} className="h-1.5 mb-3" indicatorColor="bg-primary" />
            <p className="text-xs text-muted-foreground mt-2">Allowance resets {allowanceResetDate}.</p>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Workspace Index Section */}
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            Workspace Index
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </DropdownMenuLabel>
          <div className="px-2 py-1">
            <p className="text-sm text-muted-foreground">Remotely indexed</p>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Settings Section */}
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            Settings
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3 w-3" />
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={isCodeCompletionAllFilesEnabled}
            onCheckedChange={onToggleCodeCompletionAllFiles}
            className="text-sm"
          >
            Code completions (all files)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isCodeCompletionTSXEnabled}
            onCheckedChange={onToggleCodeCompletionTSX}
            className="text-sm"
          >
            Code completions (TypeScript JSX)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isNextEditSuggestionsEnabled}
            onCheckedChange={onToggleNextEditSuggestions}
            className="text-sm"
          >
            Next edit suggestions
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator className="my-2" />

          {/* Manual Suggestion Trigger */}
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("completion", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="flex items-center justify-between text-sm"
          >
            Get AI Suggestion (Ctrl+Space)
            {suggestionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Sparkles className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("function", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="text-sm"
          >
            Function Suggestion
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("variable", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="text-sm"
          >
            Variable Suggestion
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("import", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="text-sm"
          >
            Import Suggestion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
