import { Loader2 } from "lucide-react";
import { type LoadingStepProps } from "../types";

export const LoadingStep: React.FC<LoadingStepProps> = ({
  currentStep,
  step,
  label,
}) => (
  <div className="flex items-center gap-2 mb-2 justify-center h-screen">
    <div
      className={`rounded-full p-1 ${
        currentStep === step
          ? "bg-primary/15"
          : currentStep > step
          ? "bg-emerald-500/15"
          : "bg-muted"
      }`}
    >
      {currentStep > step ? (
        <svg
          className="h-4 w-4 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : currentStep === step ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <div className="h-4 w-4 rounded-full bg-muted-foreground/40" />
      )}
    </div>
    <span
      className={`text-sm ${
        currentStep === step
          ? "text-primary font-medium"
          : currentStep > step
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground"
      }`}
    >
      {label}
    </span>
  </div>
);