import { NextResponse } from "next/server";
import { getApiUser, parseBody, unauthorized } from "@/lib/api";
import { setCalorieGoal } from "@/lib/profile";
import { goalSchema } from "@/lib/validations/goal";

// PATCH /api/me { calorieGoal: number | null } — null clears the goal.
export async function PATCH(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { data, response } = await parseBody(request, goalSchema);
  if (response) return response;

  return NextResponse.json({ calorieGoal: await setCalorieGoal(user.id, data.calorieGoal) });
}
