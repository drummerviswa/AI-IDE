import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const getStatus = (val: string | undefined) => {
    if (!val) return "MISSING";
    if (val.trim() === "") return "EMPTY_STRING";
    return `PRESENT (Length: ${val.length}, Preview: ${val.substring(0, 4)}...)`;
  };

  const getFullValueOrMissing = (val: string | undefined) => {
    return val || "MISSING";
  };

  const getSafeDbUrl = (val: string | undefined) => {
    if (!val) return "MISSING";
    // Expose up to the database hostname/port, hiding credentials
    return val.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  };

  const headersObj: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  return NextResponse.json({
    AUTH_SECRET: getStatus(process.env.AUTH_SECRET),
    AUTH_URL: getFullValueOrMissing(process.env.AUTH_URL),
    NEXTAUTH_URL: getFullValueOrMissing(process.env.NEXTAUTH_URL),
    AUTH_GITHUB_ID: getStatus(process.env.AUTH_GITHUB_ID),
    AUTH_GOOGLE_ID: getStatus(process.env.AUTH_GOOGLE_ID),
    DATABASE_URL: getSafeDbUrl(process.env.DATABASE_URL),
    NODE_ENV: process.env.NODE_ENV || "not_set",
    REQUEST_HEADERS: {
      host: headersObj["host"] || "not_found",
      "x-forwarded-host": headersObj["x-forwarded-host"] || "not_found",
      "x-forwarded-proto": headersObj["x-forwarded-proto"] || "not_found",
    }
  });
}
