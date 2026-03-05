"use client"

import { usePlayground } from "../context/playground-context"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoadingStep from "@/components/ui/loader"
import { PlaygroundEditor } from "./playground-editor"
import { PlaygroundHeader } from "./playground-header"

export function PlaygroundLayout() {
  const { error, loadingStep, templateData, fetchPlaygroundData } = usePlayground()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchPlaygroundData} variant="destructive">
          Try Again
        </Button>
      </div>
    )
  }

  if (loadingStep < 3) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-sm border border-border/60 bg-card/70">
          <h2 className="text-xl font-semibold mb-6 text-center">Loading Playground</h2>
          <div className="mb-8">
            <LoadingStep currentStep={loadingStep} step={1} label="Loading playground metadata" />
            <LoadingStep currentStep={loadingStep} step={2} label="Loading template structure" />
            <LoadingStep currentStep={loadingStep} step={3} label="Ready to explore" />
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(loadingStep / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading template data...</h2>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <PlaygroundHeader />
      <PlaygroundEditor />
    </div>
  )
}