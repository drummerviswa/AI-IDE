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
          const obj: any = {};
          Object.getOwnPropertyNames(err).forEach(key => {
            const val = err[key];
            if (key === "cause") {
              obj[key] = serializeError(val);
            } else if (val && typeof val === "object") {
              try {
                obj[key] = JSON.parse(JSON.stringify(val));
              } catch (e) {
                obj[key] = String(val);
              }
            } else {
              obj[key] = val;
            }
          });
          return obj;
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