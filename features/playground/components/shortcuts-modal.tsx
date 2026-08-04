"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard } from "lucide-react"

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  {
    category: "Editor",
    items: [
      { keys: ["Ctrl", "S"], description: "Save active file" },
      { keys: ["Ctrl", "Shift", "S"], description: "Save all files" },
      { keys: ["Ctrl", "Space"], description: "Trigger AI inline suggestion" },
      { keys: ["Tab"], description: "Accept AI suggestion" },
      { keys: ["Esc"], description: "Reject AI suggestion" },
      { keys: ["Alt", "Shift", "F"], description: "Format document" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
    ],
  },
  {
    category: "Navigation",
    items: [
      { keys: ["Ctrl", "P"], description: "Quick open file (Monaco)" },
      { keys: ["Ctrl", "G"], description: "Go to line" },
      { keys: ["Ctrl", "F"], description: "Find in file" },
      { keys: ["Ctrl", "H"], description: "Find & replace" },
    ],
  },
  {
    category: "Playground",
    items: [
      { keys: ["Ctrl", "`"], description: "Toggle terminal" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
]

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {shortcuts.map((group, i) => (
            <div key={group.category}>
              {i > 0 && <Separator className="mb-6" />}
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.category}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.description}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs px-1.5 py-0.5 h-auto"
                          >
                            {key}
                          </Badge>
                          {ki < item.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
