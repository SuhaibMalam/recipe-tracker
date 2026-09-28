import "dotenv/config";
import path from "node:path";
import { defineConfig } from "vitest/config";

const resolve = {
  alias: {
    "@": path.resolve("src"),
    // Next resolves "server-only" internally; outside Next it's just a marker.
    "server-only": path.resolve("tests/stubs/server-only.js"),
  },
};

export default defineConfig({
  resolve,
  test: {
    projects: [
      {
        resolve,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.js"],
        },
      },
      {
        resolve,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.js"],
          globalSetup: ["tests/integration/global-setup.js"],
          // Point Prisma at the disposable test database, never the real one.
          env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? "" },
          // One shared database: run files one after another.
          fileParallelism: false,
          // A remote dev database adds ~250ms per round trip; CI's local Postgres is far faster.
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
