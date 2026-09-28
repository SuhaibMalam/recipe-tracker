import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notFound } from "@/lib/api";
import { demoEnabled } from "@/lib/demo";

// POST /api/demo — signs the visitor into the shared demo account.
// The demo credentials stay on the server; the browser only gets the session cookie.
// No rate limit needed: the only thing this can ever grant is the public demo account.
export async function POST(request) {
  if (!demoEnabled()) return notFound();

  // Login CSRF guard: another site could auto-submit a form here and silently
  // sign a visitor into the demo account. Only accept our own origin.
  const appOrigin = new URL(process.env.BETTER_AUTH_URL ?? request.url).origin;
  if (request.headers.get("origin") !== appOrigin) {
    return NextResponse.json({ error: "Cross-site request refused." }, { status: 403 });
  }

  const signIn = await auth.api.signInEmail({
    body: { email: process.env.DEMO_EMAIL, password: process.env.DEMO_PASSWORD },
    headers: request.headers,
    asResponse: true,
  });

  // 303: the browser follows a POST redirect with a GET.
  const target = signIn.ok ? "/dashboard" : "/login?demo=unavailable";
  const response = NextResponse.redirect(new URL(target, appOrigin), 303);
  for (const cookie of signIn.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
