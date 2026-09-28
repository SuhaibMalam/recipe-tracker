import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps same-origin paths, including query strings", () => {
    expect(safeRedirectPath("/recipes/abc")).toBe("/recipes/abc");
    expect(safeRedirectPath("/recipes?q=soup")).toBe("/recipes?q=soup");
  });

  it.each([
    ["https://evil.com"],
    ["//evil.com"], // protocol-relative: browsers treat it as another host
    ["/\\evil.com"], // some browsers normalise the backslash to a slash
    ["javascript:alert(1)"],
    [""],
    [null],
  ])("falls back for %j", (value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard");
  });
});
