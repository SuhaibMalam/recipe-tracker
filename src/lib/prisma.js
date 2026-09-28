import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Prisma's defaults (2s to get a connection, 5s per transaction) are tight for a
// serverless Postgres that may be waking from a cold start.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ transactionOptions: { maxWait: 5_000, timeout: 10_000 } });

// Reuse one client across dev hot-reloads instead of opening a new pool each time.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
