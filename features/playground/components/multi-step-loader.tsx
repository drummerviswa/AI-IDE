"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStep {
  id: string
  label: string
  duration: number // ms to stay on this step
}

const DEFAULT_STEPS: LoadingStep[] = [
  { id: "boot", label: "Booting WebContainer sandbox…", duration: 2000 },
  { id: "deps", label: "Installing dependencies…", duration: 4000 },
  { id: "server", label: "Starting dev server…", duration: 2000 },
  { id: "ready", label: "Almost ready!", duration: 500 },
]

interface MultiStepLoaderProps {
  steps?: LoadingStep[]
  isLoading: boolean
  /** Called when all steps are visually complete */
  onComplete?: () => void
  className?: string
}

export function MultiStepLoader({
  steps = DEFAULT_STEPS,
  isLoading,
  onComplete,
  className,
}: MultiStepLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0)
      setCompletedSteps(new Set())
      return
    }

    let stepIndex = 0

    const advance = () => {
      if (stepIndex >= steps.length) {
        onComplete?.()
        return
      }

      const step = steps[stepIndex]
      setCurrentStepIndex(stepIndex)

      const timer = setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, step.id]))
        stepIndex++
        advance()
      }, step.duration)

      return timer
    }

    const firstTimer = advance()

    return () => {
      if (firstTimer) clearTimeout(firstTimer)
    }
  }, [isLoading, steps, onComplete])

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-8 px-8 py-12 max-w-md w-full">
        {/* Logo / title area */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-semibold">Initializing Playground</h2>
          <p className="text-sm text-muted-foreground">
            Setting up your in-browser Node.js environment
          </p>
        </div>

        {/* Steps list */}
        <div className="w-full space-y-3">
          {steps.map((step, index) => {
            const isDone = completedSteps.has(step.id)
            const isCurrent = index === currentStepIndex && !isDone
            const isPending = index > currentStepIndex

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300",
                  isDone && "border-emerald-500/30 bg-emerald-500/5",
                  isCurrent && "border-primary/40 bg-primary/5",
                  isPending && "border-border/40 opacity-40"
                )}
              >
                {/* Icon */}
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-border" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDone && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && "text-primary",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.round(((completedSteps.size) / steps.length) * 100)}%`,
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground animate-pulse">
          Powered by WebContainers API
        </p>
      </div>
    </div>
  )
}
