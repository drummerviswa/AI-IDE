import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { db } from "./lib/db";
import { getUserById } from "@/features/auth/actions";

 

 
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token }) {
      if(!token.sub) return token;
      const existingUser = await getUserById(token.sub)

      if(!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token;
    },

    async session({ session, token }) {
      // Attach the user ID from the token to the session
    if(token.sub  && session.user){
      session.user.id = token.sub
    } 

    if(token.sub && session.user){
      session.user.role = token.role
    }

    return session;
    },
  },
  
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  logger: {
    error(error) {
      try {
        const fs = require("fs");
        const path = require("path");
        const errorLogPath = path.join("/tmp", "auth-error.json");
        const serializeError = (err: any): any => {
          if (!err) return null;
          return {
            name: err.name || "Error",
            message: err.message || String(err),
            stack: err.stack || "",
            code: err.code || "",
            cause: err.cause ? serializeError(err.cause) : undefined,
          };
        };
        fs.writeFileSync(errorLogPath, JSON.stringify({
          error: serializeError(error),
          timestamp: new Date().toISOString()
        }, null, 2));
      } catch (e) {
        // ignore
      }
    }
  },
  ...authConfig,
})