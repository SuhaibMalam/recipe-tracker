import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { toFieldErrors } from "@/lib/validations/errors";

export function jsonError(status, message, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export const unauthorized = () => jsonError(401, "Sign in to continue.");
export const notFound = () => jsonError(404, "Not found.");

export async function getApiUser() {
  return (await getSession())?.user ?? null;
}

// Returns { data } on success or { response } holding the 400 to send back.
export async function parseBody(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    return { response: jsonError(400, "Request body must be valid JSON.") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: jsonError(400, "Some fields need attention.", {
        fieldErrors: toFieldErrors(result.error),
      }),
    };
  }
  return { data: result.data };
}
