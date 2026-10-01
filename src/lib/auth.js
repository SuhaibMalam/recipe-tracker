import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_PREFIX } from "@/lib/site";
import { isDemoUser } from "@/lib/demo";
import { nameSchema } from "@/lib/validations/account";

const ACCOUNT_CHANGES = new Set(["/update-user", "/change-password", "/delete-user"]);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  // Self-service deletion. Recipes and logs go with the user via onDelete: Cascade.
  user: { deleteUser: { enabled: true } },
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
      "/change-password": { window: 60, max: 5 },
      "/delete-user": { window: 60, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: AUTH_COOKIE_PREFIX,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Visitors share the demo account, so nobody gets to lock the others out.
      if (ACCOUNT_CHANGES.has(ctx.path) && isDemoUser((await getSessionFromCtx(ctx))?.user)) {
        throw new APIError("FORBIDDEN", { message: "The demo account can't be changed." });
      }
      const setsName = ctx.path === "/sign-up/email" || ctx.path === "/update-user";
      if (setsName && ctx.body?.name !== undefined) {
        const name = nameSchema.safeParse(ctx.body.name);
        if (!name.success) {
          throw new APIError("BAD_REQUEST", { message: "Enter a name up to 100 characters." });
        }
        // Store the trimmed name, whatever the client sent.
        return { context: { body: { ...ctx.body, name: name.data } } };
      }
    }),
  },
});
