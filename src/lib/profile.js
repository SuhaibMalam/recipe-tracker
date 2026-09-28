import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCalorieGoal(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calorieGoal: true },
  });
  return user?.calorieGoal ?? null;
}

// null clears the goal.
export async function setCalorieGoal(userId, calorieGoal) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { calorieGoal },
    select: { calorieGoal: true },
  });
  return user.calorieGoal;
}
