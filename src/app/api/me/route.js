import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, parseBody, unauthorized } from "@/lib/api";
import { goalSchema } from "@/lib/validations/goal";

// PATCH /api/me { calorieGoal: number | null } — null clears the goal.
export async function PATCH(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { data, response } = await parseBody(request, goalSchema);
  if (response) return response;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { calorieGoal: data.calorieGoal },
    select: { calorieGoal: true },
  });
  return NextResponse.json(updated);
}
