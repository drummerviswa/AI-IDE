import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Code2,
  Github,
  Layers,
  Linkedin,
  Sparkles,
  Terminal,
  WandSparkles,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";

/* ─── Feature card data ───────────────────────────────────────────────────── */
const features = [
  {
    title: "AI Code Generation",
    description:
      "Generate complete boilerplate and production-ready snippets with context-aware prompts powered by Gemini.",
    icon: Bot,
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    glow: "hover:shadow-blue-500/20",
    delay: "0ms",
  },
  {
    title: "Template Playground",
    description:
      "Start instantly with framework templates for React, Next.js, Vue, Node, and more — zero config.",
    icon: Layers,
    gradient: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
    glow: "hover:shadow-violet-500/20",
    delay: "100ms",
  },
  {
    title: "Smart Suggestions",
    description:
      "Get code improvements, refactors, and best-practice recommendations in real-time as you type.",
    icon: WandSparkles,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-emerald-500/20",
    delay: "200ms",
  },
  {
    title: "Monaco Editor",
    description:
      "The same battle-tested editor powering VS Code — syntax highlighting, IntelliSense, multi-cursor and more.",
    icon: Code2,
    gradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/20",
    delay: "300ms",
  },
  {
    title: "WebContainer Sandbox",
    description:
      "Run Node.js directly in your browser tab. Install packages, run servers — no cloud VM needed.",
    icon: Terminal,
    gradient: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-400",
    glow: "hover:shadow-rose-500/20",
    delay: "400ms",
  },
  {
    title: "One-Click Launch",
    description:
      "Move from idea to runnable prototype in seconds with minimal setup friction and instant previews.",
    icon: Zap,
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/20",
    delay: "500ms",
  },
];

/* ─── Stats data ──────────────────────────────────────────────────────────── */
const stats = [
  { value: "10+", label: "Framework templates" },
  { value: "AI-first", label: "From prompt to product" },
  { value: "0ms setup", label: "WebContainer sandbox" },
  { value: "100%", label: "Browser-based, no install" },
];

/* ─── Tech badges data ────────────────────────────────────────────────────── */
const techBadges = [
  "Next.js 15",
  "Monaco Editor",
  "WebContainers",
  "TypeScript",
  "Tailwind CSS",
  "Zustand",
  "Next.js 15",
  "Monaco Editor",
  "WebContainers",
  "TypeScript",
  "Tailwind CSS",
  "Zustand",
];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-4 pb-24 pt-14 sm:px-6 lg:px-8">

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="flex w-full max-w-4xl flex-col items-center text-center">

        {/* Pulsing badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium tracking-wide"
          >
            ✨ AI-Powered Web IDE
          </Badge>
        </div>

        {/* Gradient headline */}
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Code Smarter,
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Build Faster
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
          <span className="font-semibold text-foreground">CodeAI</span>{" "}
          — where Monaco Editor, WebContainers, and AI assistance meet in your
          browser.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="brand"
              size="lg"
              className="gap-2 px-6 text-base font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" />
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link
            href="https://github.com/drummerviswa/AI-IDE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-6 text-base transition-all duration-300 hover:-translate-y-0.5"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </Link>
        </div>

        {/* ── Code Editor Mockup ─────────────────────────────────────────── */}
        <div className="relative mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-[#0D1117] shadow-2xl shadow-black/50">

          {/* Editor top bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-white/40 font-mono">index.ts — CodeAI</span>
            <Badge className="gap-1 bg-violet-600/30 text-violet-300 border-violet-500/30 text-xs px-2 py-0.5">
              <Sparkles className="h-3 w-3" />
              AI ✨
            </Badge>
          </div>

          {/* Code content */}
          <div className="p-6 font-mono text-sm leading-7 text-left">
            {/* Line 1 */}
            <div className="flex gap-4">
              <span className="w-4 select-none text-right text-white/20">1</span>
              <span className="text-emerald-400/80 italic">{"// AI suggestion accepted ✓"}</span>
            </div>
            {/* Line 2 */}
            <div className="flex gap-4">
              <span className="w-4 select-none text-right text-white/20">2</span>
              <span>
                <span className="text-violet-400">const </span>
                <span className="text-blue-300">greeting</span>
                <span className="text-white/70"> = (</span>
                <span className="text-amber-300">name</span>
                <span className="text-blue-400">: string</span>
                <span className="text-white/70">) {"=>"} {"{"}</span>
              </span>
            </div>
            {/* Line 3 */}
            <div className="flex gap-4">
              <span className="w-4 select-none text-right text-white/20">3</span>
              <span className="pl-6">
                <span className="text-violet-400">return </span>
                <span className="text-emerald-300">{"`Hello, "}</span>
                <span className="text-amber-300">{"${"}</span>
                <span className="text-blue-300">name</span>
                <span className="text-amber-300">{"}"}</span>
                <span className="text-emerald-300">{"! Welcome.`"}</span>
              </span>
            </div>
            {/* Line 4 */}
            <div className="flex gap-4">
              <span className="w-4 select-none text-right text-white/20">4</span>
              <span className="text-white/70">{"}"}</span>
            </div>
            {/* Line 5 — cursor */}
            <div className="flex gap-4 mt-1">
              <span className="w-4 select-none text-right text-white/20">5</span>
              <span>
                <span className="text-white/70">
                  greeting
                </span>
                <span className="animate-pulse text-white font-bold">▌</span>
              </span>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center gap-3 border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              WebContainer running
            </span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Strip ───────────────────────────────────────────────── */}
      <section className="mt-16 w-full overflow-hidden">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Built with
        </p>
        <div className="relative flex overflow-x-hidden">
          <div className="flex animate-[marquee_20s_linear_infinite] gap-3 whitespace-nowrap">
            {techBadges.map((tech, i) => (
              <Badge
                key={`a-${i}`}
                variant="outline"
                className="shrink-0 px-4 py-1.5 text-sm font-medium"
              >
                {tech}
              </Badge>
            ))}
          </div>
          <div
            className="absolute top-0 flex animate-[marquee_20s_linear_infinite] gap-3 whitespace-nowrap"
            style={{ animationDelay: "-10s" }}
          >
            {techBadges.map((tech, i) => (
              <Badge
                key={`b-${i}`}
                variant="outline"
                className="shrink-0 px-4 py-1.5 text-sm font-medium"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <section className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.value}
            className="border-border/50 bg-card/60 backdrop-blur-sm text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
          >
            <CardContent className="p-6">
              <p className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Feature Cards Section ─────────────────────────────────────────── */}
      <section className="mt-20 w-full max-w-6xl">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium uppercase tracking-widest">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              ship faster
            </span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A complete browser-based IDE with AI superpowers — no installs, no
            friction.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={`group h-full cursor-default border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.glow}`}
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Built By Footer ───────────────────────────────────────────────── */}
      <section className="mt-24 flex w-full flex-col items-center gap-5 border-t border-border/40 pt-12 text-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">
            Built by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent font-bold">
              Viswanathan P
            </span>{" "}
            •{" "}
            <span className="text-muted-foreground font-normal">
              @drummerviswa
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/drummerviswa/AI-IDE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </Link>
          <Link
            href="https://www.linkedin.com/in/drummerviswa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          CodeAI — AI-Powered Web IDE · {new Date().getFullYear()}
        </p>
      </section>
    </div>
  );
}
