import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// Brings the test schema up to date and empties it before the run.
// Deliberately never uses `migrate reset`/DROP: the test schema can live in the
// same database as real data, so it only ever truncates tables it names itself.
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error("TEST_DATABASE_URL is not set. Integration tests need a disposable database.");
  }
  if (url === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must not equal DATABASE_URL — the test setup empties it.");
  }
  const schema = new URL(url).searchParams.get("schema") ?? "public";
  if (schema === "public" && !process.env.CI) {
    throw new Error('Locally, TEST_DATABASE_URL needs its own schema (e.g. "?schema=test").');
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables
      WHERE schemaname = ${schema} AND tablename <> '_prisma_migrations'`;
    if (tables.length) {
      const list = tables.map((t) => `"${schema}"."${t.tablename}"`).join(", ");
      await prisma.$executeRawUnsafe(`TRUNCATE ${list} CASCADE`);
    }
  } finally {
    await prisma.$disconnect();
  }
}
