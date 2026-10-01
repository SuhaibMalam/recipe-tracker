import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { AUTH_COOKIE_PREFIX } from "@/lib/site";

// Optimistic check only: is there a session cookie at all? It can't tell an
// expired or revoked session from a live one (that needs a DB hit, which
// proxy should avoid). requireUser() in the (app) layout is the real check.
//
// Deliberately no "logged in → bounce away from /login" rule here: with a
// stale cookie that would loop /login → /dashboard → /login.
export function proxy(request) {
  if (getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX })) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/recipes/:path*", "/log/:path*", "/settings/:path*"],
};
