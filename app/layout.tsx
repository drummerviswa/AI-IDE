import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CodeAI — AI-Powered Web IDE",
  description:
    "CodeAI is an AI-powered browser-based IDE. Code, run, and ship full-stack projects instantly — with Monaco Editor, WebContainers, and Gemini AI built in.",
  keywords: ["AI IDE", "browser IDE", "Monaco Editor", "WebContainers", "CodeAI"],
  authors: [{ name: "Viswanathan P" }],
  openGraph: {
    title: "CodeAI — AI-Powered Web IDE",
    description: "Code, run, and ship full-stack projects instantly in your browser.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
            <div className="flex flex-col min-h-screen">
              <Toaster/>
              <div className="flex-1">{children}</div>
            </div>
        </ThemeProvider>
      </body>
    </html>
    </SessionProvider>
  );
}
