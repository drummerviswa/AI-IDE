import { NextResponse } from "next/server";

export async function GET() {
  const getStatus = (val: string | undefined) => {
    if (!val) return "MISSING";
    if (val.trim() === "") return "EMPTY_STRING";
    return `PRESENT (Length: ${val.length}, Preview: ${val.substring(0, 4)}...)`;
  };

  return NextResponse.json({
    AUTH_SECRET: getStatus(process.env.AUTH_SECRET),
    AUTH_URL: getStatus(process.env.AUTH_URL),
    NEXTAUTH_URL: getStatus(process.env.NEXTAUTH_URL),
    AUTH_GITHUB_ID: getStatus(process.env.AUTH_GITHUB_ID),
    AUTH_GITHUB_SECRET: getStatus(process.env.AUTH_GITHUB_SECRET),
    AUTH_GOOGLE_ID: getStatus(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET: getStatus(process.env.AUTH_GOOGLE_SECRET),
    DATABASE_URL: getStatus(process.env.DATABASE_URL),
    NODE_ENV: process.env.NODE_ENV || "not_set",
  });
}
