"use client";

import React, { useEffect, useState } from "react";

interface PlaygroundLoaderProps {
  isVisible: boolean;
}

const steps = [
  {
    id: 1,
    icon: "🗄️",
    label: "Fetching playground data",
    sublabel: "Loading your files & configuration",
    duration: 1200,
  },
  {
    id: 2,
    icon: "📦",
    label: "Booting WebContainer",
    sublabel: "Spinning up an in-browser Node.js runtime",
    duration: 2000,
  },
  {
    id: 3,
    icon: "⚙️",
    label: "Installing dependencies",
    sublabel: "Running npm install in the sandbox",
    duration: 2500,
  },
  {
    id: 4,
    icon: "🚀",
    label: "Starting dev server",
    sublabel: "Launching your project preview",
    duration: 1000,
  },
];

export function PlaygroundLoader({ isVisible }: PlaygroundLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(".");

  // Animated dots
  useEffect(() => {
    if (!isVisible) return;
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(dotsInterval);
  }, [isVisible]);

  // Step progression
  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let elapsed = 0;
    const totalDuration = steps.reduce((s, step) => s + step.duration, 0);

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setCurrentStep(idx);
      }, elapsed);
      timers.push(timer);
      elapsed += step.duration;
    });

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (totalDuration / 80), 95));
    }, 80);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(250 50% 8%) 0%, hsl(240 30% 4%) 100%)",
      }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(260 80% 70% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(260 80% 70% / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div
        className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: "15%",
          left: "20%",
          background: "hsl(260 80% 60%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          width: 300,
          height: 300,
          bottom: "20%",
          right: "15%",
          background: "hsl(200 90% 50%)",
          animation: "pulse 5s ease-in-out infinite 1s",
        }}
      />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 80, height: 80 }}
          >
            {/* Outer spinning ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "hsl(260 80% 70%)",
                borderRightColor: "hsl(200 90% 60%)",
                animation: "spin 1.4s linear infinite",
              }}
            />
            {/* Inner spinning ring (opposite) */}
            <div
              className="absolute rounded-full border-2 border-transparent"
              style={{
                inset: 8,
                borderBottomColor: "hsl(260 80% 70% / 0.5)",
                borderLeftColor: "hsl(200 90% 60% / 0.5)",
                animation: "spin 2s linear infinite reverse",
              }}
            />
            {/* Center icon */}
            <div
              className="relative flex items-center justify-center rounded-xl text-2xl"
              style={{
                width: 52,
                height: 52,
                background:
                  "linear-gradient(135deg, hsl(260 80% 20%), hsl(240 60% 15%))",
                border: "1px solid hsl(260 80% 40% / 0.4)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              ⚡
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            CodeAI
          </h1>
          <p className="text-sm" style={{ color: "hsl(260 30% 65%)" }}>
            Preparing your playground{dots}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div
                key={step.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500"
                style={{
                  background: isActive
                    ? "hsl(260 80% 15% / 0.8)"
                    : isDone
                    ? "hsl(260 40% 10% / 0.4)"
                    : "transparent",
                  border: isActive
                    ? "1px solid hsl(260 80% 50% / 0.4)"
                    : isDone
                    ? "1px solid hsl(260 40% 30% / 0.2)"
                    : "1px solid transparent",
                  opacity: isPending ? 0.35 : 1,
                  transform: isActive ? "translateX(4px)" : "none",
                }}
              >
                {/* Status icon */}
                <div
                  className="flex items-center justify-center rounded-full text-sm shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: isDone
                      ? "hsl(142 70% 30%)"
                      : isActive
                      ? "hsl(260 80% 30%)"
                      : "hsl(240 20% 20%)",
                    border: isActive
                      ? "1px solid hsl(260 80% 60% / 0.5)"
                      : "1px solid transparent",
                    animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {isDone ? (
                    <span style={{ color: "hsl(142 70% 60%)" }}>✓</span>
                  ) : isActive ? (
                    <span style={{ animation: "spin 1s linear infinite", display: "block" }}>⟳</span>
                  ) : (
                    <span style={{ color: "hsl(240 20% 50%)" }}>{step.id}</span>
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium leading-tight"
                    style={{
                      color: isDone
                        ? "hsl(142 60% 70%)"
                        : isActive
                        ? "white"
                        : "hsl(240 20% 55%)",
                    }}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{
                        color: "hsl(260 40% 60%)",
                        animation: "fadeIn 0.3s ease-in",
                      }}
                    >
                      {step.sublabel}
                    </p>
                  )}
                </div>

                {/* Step emoji */}
                <span className="text-base shrink-0">{step.icon}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          className="rounded-full overflow-hidden"
          style={{
            height: 4,
            background: "hsl(240 30% 15%)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(260 80% 60%), hsl(200 90% 60%))",
              boxShadow: "0 0 10px hsl(260 80% 60% / 0.5)",
            }}
          />
        </div>

        {/* Bottom tip */}
        <p
          className="text-center text-xs mt-4"
          style={{ color: "hsl(240 20% 40%)" }}
        >
          Tip: Press{" "}
          <kbd
            className="rounded px-1 py-0.5 text-xs"
            style={{
              background: "hsl(240 20% 15%)",
              border: "1px solid hsl(240 20% 25%)",
              color: "hsl(240 20% 60%)",
            }}
          >
            Ctrl+S
          </kbd>{" "}
          to save,{" "}
          <kbd
            className="rounded px-1 py-0.5 text-xs"
            style={{
              background: "hsl(240 20% 15%)",
              border: "1px solid hsl(240 20% 25%)",
              color: "hsl(240 20% 60%)",
            }}
          >
            Ctrl+`
          </kbd>{" "}
          for terminal
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.97); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
