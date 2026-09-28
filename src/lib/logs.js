import "server-only";
import { prisma } from "@/lib/prisma";
import { dayToDate } from "@/lib/day";

const round1 = (n) => Math.round(n * 10) / 10;

export function listLogs(userId, { from, to }) {
  return prisma.nutritionLog.findMany({
    where: { userId, day: { gte: dayToDate(from), lte: dayToDate(to) } },
    orderBy: [{ day: "desc" }, { loggedAt: "desc" }],
    select: {
      id: true,
      day: true,
      name: true,
      servings: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      recipeId: true,
    },
  });
}

// Sums per day, done in Postgres rather than by summing rows in JS.
export async function dailyTotals(userId, { from, to }) {
  const rows = await prisma.nutritionLog.groupBy({
    by: ["day"],
    where: { userId, day: { gte: dayToDate(from), lte: dayToDate(to) } },
    _sum: { calories: true, protein: true, carbs: true, fat: true },
    orderBy: { day: "asc" },
  });
  return rows.map((r) => ({ day: r.day, ...r._sum }));
}

// "Favourites" are derived from behaviour — what's actually logged most — instead
// of a separate star flag the user has to maintain.
export async function mostLoggedRecipes(userId, { from, take }) {
  const counts = await prisma.nutritionLog.groupBy({
    by: ["recipeId"],
    where: { userId, recipeId: { not: null }, day: { gte: dayToDate(from) } },
    _count: { _all: true },
    orderBy: { _count: { recipeId: "desc" } },
    take,
  });
  if (counts.length === 0) return [];

  const recipes = await prisma.recipe.findMany({
    where: { userId, id: { in: counts.map((c) => c.recipeId) } },
    select: { id: true, title: true, calories: true },
  });
  const byId = new Map(recipes.map((r) => [r.id, r]));
  return counts
    .filter((c) => byId.has(c.recipeId))
    .map((c) => ({ ...byId.get(c.recipeId), timesLogged: c._count._all }));
}

// Returns { log } or { error: "not_found" | "no_nutrition" }.
export async function createLog(userId, input) {
  if (input.source === "manual") {
    const { source: _source, day, ...fields } = input;
    const log = await prisma.nutritionLog.create({
      data: { ...fields, day: dayToDate(day), userId },
    });
    return { log };
  }

  const recipe = await prisma.recipe.findFirst({
    where: { id: input.recipeId, userId },
    select: { id: true, title: true, calories: true, protein: true, carbs: true, fat: true },
  });
  if (!recipe) return { error: "not_found" };
  if (recipe.calories === null) return { error: "no_nutrition" };

  const s = input.servings;
  const log = await prisma.nutritionLog.create({
    data: {
      userId,
      recipeId: recipe.id,
      name: recipe.title,
      day: dayToDate(input.day),
      servings: s,
      calories: Math.round(recipe.calories * s),
      protein: round1((recipe.protein ?? 0) * s),
      carbs: round1((recipe.carbs ?? 0) * s),
      fat: round1((recipe.fat ?? 0) * s),
    },
  });
  return { log };
}

export async function deleteLog(userId, id) {
  const { count } = await prisma.nutritionLog.deleteMany({ where: { id, userId } });
  return count > 0;
}
