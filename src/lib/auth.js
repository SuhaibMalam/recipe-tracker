import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_PREFIX } from "@/lib/site";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache session in cookie for 5 minutes
    },
  },
  // On by default only in production. Stored in Postgres so every instance
  // shares one counter; stricter on the endpoints that take a password.
  rateLimit: {
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 10, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: AUTH_COOKIE_PREFIX,
  },
});
