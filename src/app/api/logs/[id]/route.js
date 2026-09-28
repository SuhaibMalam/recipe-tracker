import { NextResponse } from "next/server";
import { getApiUser, notFound, unauthorized } from "@/lib/api";
import { deleteLog } from "@/lib/logs";

export async function DELETE(_request, { params }) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { id } = await params;
  return (await deleteLog(user.id, id)) ? new NextResponse(null, { status: 204 }) : notFound();
}
