import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// cache() dedupes within one request, so layout + page share a single lookup.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

// The authoritative auth check for pages. proxy.js only looks for a cookie.
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
