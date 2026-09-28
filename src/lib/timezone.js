import "server-only";
import { cookies } from "next/headers";
import { todayIn } from "@/lib/day";

export const TZ_COOKIE = "tz";

// The browser reports its IANA zone via a cookie (TimezoneSync). Until the first
// request that carries it, "today" is computed in UTC.
// ponytail: cookie-based tz; store it on the user row if logs ever need server-side jobs (e.g. reminders).
export async function getUserTimeZone() {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC"; // unknown zone string — don't trust it
  }
}

export async function getUserToday() {
  return todayIn(await getUserTimeZone());
}
