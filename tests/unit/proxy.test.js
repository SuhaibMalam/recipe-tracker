import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { AUTH_COOKIE_PREFIX } from "@/lib/site";

const visit = (path, cookie) =>
  proxy(
    new NextRequest(new URL(path, "http://localhost:3000"), {
      headers: cookie ? { cookie } : {},
    }),
  );

describe("proxy", () => {
  it("sends visitors without a session cookie to login, remembering where they were going", () => {
    const res = visit("/recipes/abc?tab=method");
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location"));
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/recipes/abc?tab=method");
  });

  it("lets requests with a session cookie through", () => {
    const res = visit("/dashboard", `${AUTH_COOKIE_PREFIX}.session_token=abc`);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("ignores cookies from other apps", () => {
    const res = visit("/dashboard", "better-auth.session_token=abc");
    expect(res.status).toBe(307);
  });
});
