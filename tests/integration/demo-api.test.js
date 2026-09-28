import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/demo/route";
import { request } from "./helpers";

const origin = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000").origin;
const demo = {
  name: "Demo Cook",
  email: `demo-${process.pid}-${Date.now()}@test.local`,
  password: "demo-password-123",
};

const post = (headers = {}) => {
  const req = request("/api/demo", "POST");
  for (const [k, v] of Object.entries(headers)) req.headers.set(k, v);
  return POST(req);
};

beforeAll(async () => {
  // Real sign-up through Better Auth: also proves the Account schema matches
  // the installed better-auth version.
  await auth.api.signUpEmail({ body: demo });
});

// Start every test with the demo off, whatever the local .env says.
beforeEach(() => {
  delete process.env.DEMO_EMAIL;
  delete process.env.DEMO_PASSWORD;
});

const enableDemo = () => {
  process.env.DEMO_EMAIL = demo.email;
  process.env.DEMO_PASSWORD = demo.password;
};

describe("POST /api/demo", () => {
  it("is a 404 when the demo isn't configured", async () => {
    expect((await post({ origin })).status).toBe(404);
  });

  it("refuses cross-site requests (login CSRF)", async () => {
    enableDemo();
    expect((await post({ origin: "https://evil.example" })).status).toBe(403);
    expect((await post()).status).toBe(403); // no Origin header at all
  });

  it("signs a same-origin visitor into the demo account", async () => {
    enableDemo();
    const res = await post({ origin });

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${origin}/dashboard`);
    expect(res.headers.getSetCookie().some((c) => c.includes("session_token="))).toBe(true);
  });

  it("sends visitors to login if the demo account is missing", async () => {
    process.env.DEMO_EMAIL = "nobody@test.local";
    process.env.DEMO_PASSWORD = "wrong-password-123";
    const res = await post({ origin });

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${origin}/login?demo=unavailable`);
  });
});
