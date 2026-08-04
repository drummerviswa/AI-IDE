"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"

export type EditorTheme = "modern-dark" | "github-light" | "dracula" | "one-dark-pro"

interface ThemeOption {
  id: EditorTheme
  label: string
  preview: string // color swatch hex
}

const THEMES: ThemeOption[] = [
  { id: "modern-dark", label: "Modern Dark", preview: "#0D1117" },
  { id: "github-light", label: "GitHub Light", preview: "#ffffff" },
  { id: "dracula", label: "Dracula", preview: "#282a36" },
  { id: "one-dark-pro", label: "One Dark Pro", preview: "#282c34" },
]

const STORAGE_KEY = "viswacode-editor-theme"

interface ThemePickerProps {
  onThemeChange?: (theme: EditorTheme) => void
}

export function ThemePicker({ onThemeChange }: ThemePickerProps) {
  const [currentTheme, setCurrentTheme] = useState<EditorTheme>("modern-dark")

  // Load persisted theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as EditorTheme | null
      if (saved && THEMES.some((t) => t.id === saved)) {
        setCurrentTheme(saved)
        onThemeChange?.(saved)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const handleSelect = (theme: EditorTheme) => {
    setCurrentTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
    onThemeChange?.(theme)
  }

  const current = THEMES.find((t) => t.id === currentTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-border/70 bg-background/70 hover:bg-accent gap-2"
          title="Editor theme"
        >
          <div
            className="w-3 h-3 rounded-full border border-border/60"
            style={{ backgroundColor: current?.preview }}
          />
          <Palette className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="w-4 h-4 rounded border border-border/60 shrink-0"
              style={{ backgroundColor: theme.preview }}
            />
            <span className="flex-1 text-sm">{theme.label}</span>
            {currentTheme === theme.id && (
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Hook to get the saved editor theme (for use in PlaygroundEditor) */
export function useEditorTheme() {
  const [theme, setTheme] = useState<EditorTheme>("modern-dark")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as EditorTheme | null
      if (saved && THEMES.some((t) => t.id === saved)) {
        setTheme(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  return { theme, setTheme }
}
