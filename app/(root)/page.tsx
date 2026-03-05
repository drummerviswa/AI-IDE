import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  Bot,
  Braces,
  Github,
  Layers,
  Linkedin,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    title: "AI Code Generation",
    description:
      "Generate complete boilerplate and production-ready snippets with context-aware prompts.",
    icon: Bot,
  },
  {
    title: "Template Playground",
    description:
      "Start instantly with framework templates for React, Next.js, Vue, Node, and more.",
    icon: Layers,
  },
  {
    title: "Smart Suggestions",
    description:
      "Get code improvements, refactors, and best-practice recommendations in seconds.",
    icon: WandSparkles,
  },
  {
    title: "Clean Developer UX",
    description:
      "Focused UI built for speed, clarity, and rapid iteration across projects.",
    icon: Sparkles,
  },
  {
    title: "Multi-Stack Friendly",
    description:
      "Build full-stack ideas quickly with support for modern web stacks and APIs.",
    icon: Braces,
  },
  {
    title: "One-Click Launch",
    description:
      "Move from idea to runnable prototype with minimal setup friction.",
    icon: ArrowUpRight,
  },
];

export default function Home() {
  return (
    <div className="z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl text-center">
        <Badge variant="secondary" className="mb-5 px-4 py-1.5 text-sm">
          Built by Viswanathan P
        </Badge>

        <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          ViswaCode Studio 
        </h1>

        <p className="mt-3 text-base font-medium text-primary sm:text-lg">
          AI powered vibecode IDE
        </p>

        <p className="mx-auto mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
          Building beautiful AI-powered developer experiences with fast execution,
          thoughtful UX, and scalable full-stack architecture.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="brand" size="lg" className="gap-2">
              Explore Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link
            href="https://github.com/drummerviswa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </Link>

          <Link
            href="https://www.linkedin.com/in/drummerviswa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">10+</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Framework starter options</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">AI-first</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Experience from prompt to product</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">Fast UX</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Optimized interaction and flow</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">Production</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Build quality with scalable patterns</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-14 w-full max-w-6xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Feature Presentation</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Everything needed to convert ideas into polished, working products.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg border p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
