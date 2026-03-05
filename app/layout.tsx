import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],


})

export const metadata: Metadata = {
  title: "ViswaCode Studio",
  description:
    "ViswaCode Studio by Viswanathan P is an AI-powered web IDE for building, running, and shipping full-stack projects with speed.",
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
      <body
        className={` ${poppins.className} antialiased`}
      >
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
