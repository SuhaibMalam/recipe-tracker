import { NextResponse } from "next/server";
import * as z from "zod";
import { getApiUser, jsonError, notFound, parseBody, unauthorized } from "@/lib/api";
import { createLog, listLogs } from "@/lib/logs";
import { logSchema } from "@/lib/validations/log";
import { addDays } from "@/lib/day";
import { getUserToday } from "@/lib/timezone";

const rangeSchema = z
  .object({ from: z.iso.date().optional(), to: z.iso.date().optional() })
  .refine(({ from, to }) => !from || !to || from <= to, "from must be on or before to");

// GET /api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD — defaults to the last 7 days.
export async function GET(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const range = rangeSchema.safeParse(params);
  if (!range.success) return jsonError(400, "Use from/to as YYYY-MM-DD, with from ≤ to.");

  const to = range.data.to ?? (await getUserToday());
  const from = range.data.from ?? addDays(to, -6);
  if (addDays(from, 366) < to) return jsonError(400, "Ask for at most a year at a time.");

  return NextResponse.json({ from, to, logs: await listLogs(user.id, { from, to }) });
}

export async function POST(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { data, response } = await parseBody(request, logSchema);
  if (response) return response;

  const { log, error } = await createLog(user.id, data);
  if (error === "not_found") return notFound();
  if (error === "no_nutrition") {
    return jsonError(422, "Add calories to this recipe before logging it.");
  }
  return NextResponse.json({ log }, { status: 201 });
}
