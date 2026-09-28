// Only same-origin paths: "//evil.com" and "/\evil.com" are protocol-relative
// URLs that browsers resolve to another host, so a bare startsWith("/") isn't enough.
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
