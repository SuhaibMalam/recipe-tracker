import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Every query is scoped by userId. A recipe that exists but belongs to someone
// else is indistinguishable from one that doesn't exist (callers return 404),
// so ids can't be probed.

const detailInclude = {
  recipeIngredients: {
    orderBy: { displayOrder: "asc" },
    include: { ingredient: { select: { name: true } } },
  },
};

const summarySelect = {
  id: true,
  title: true,
  description: true,
  servings: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  createdAt: true,
  _count: { select: { recipeIngredients: true } },
};

export function listRecipes(userId, { take } = {}) {
  return prisma.recipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: summarySelect,
    take,
  });
}

export const PAGE_SIZE = 12;

// Matches the title or any ingredient. ILIKE '%q%' can't use a B-tree index, so
// this scans the user's recipes — fine at hundreds per user.
// ponytail: seq scan per user; add a pg_trgm GIN index on title if recipe counts reach the tens of thousands.
export async function searchRecipes(userId, { q = "", page = 1 } = {}) {
  const term = q.trim();
  const where = {
    userId,
    ...(term && {
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        {
          recipeIngredients: {
            some: { ingredient: { name: { contains: term.toLowerCase() } } },
          },
        },
      ],
    }),
  };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: summarySelect,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);
  return { recipes, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function countRecipes(userId) {
  return prisma.recipe.count({ where: { userId } });
}

// cache(): generateMetadata and the page both ask for the same recipe per request.
export const getRecipe = cache((userId, id) =>
  prisma.recipe.findFirst({ where: { id, userId }, include: detailInclude }),
);

// Ingredient is a shared catalogue keyed by name. createMany+skipDuplicates is
// INSERT ... ON CONFLICT DO NOTHING, so two users adding "garlic" at the same
// moment can't collide, and it's 2 queries instead of one upsert per row.
async function ingredientRows(tx, ingredients) {
  const names = ingredients.map((i) => i.name);
  await tx.ingredient.createMany({
    data: names.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const found = await tx.ingredient.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  });
  const idByName = new Map(found.map((i) => [i.name, i.id]));

  return ingredients.map((row, index) => ({
    ingredientId: idByName.get(row.name),
    quantity: row.quantity,
    unit: row.unit,
    displayOrder: index,
  }));
}

function recipeFields({ ingredients: _ingredients, ...fields }) {
  return fields;
}

export function createRecipe(userId, data) {
  return prisma.$transaction(async (tx) => {
    const rows = await ingredientRows(tx, data.ingredients);
    return tx.recipe.create({
      data: {
        ...recipeFields(data),
        userId,
        recipeIngredients: { createMany: { data: rows } },
      },
      include: detailInclude,
    });
  });
}

// Replace semantics: the ingredient list is rewritten wholesale. Diffing rows
// would save a few writes but adds ordering/rename edge cases for no real gain
// at <=50 rows.
export function updateRecipe(userId, id, data) {
  return prisma.$transaction(async (tx) => {
    const owned = await tx.recipe.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return null;

    const rows = await ingredientRows(tx, data.ingredients);
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    return tx.recipe.update({
      where: { id },
      data: {
        ...recipeFields(data),
        recipeIngredients: { createMany: { data: rows } },
      },
      include: detailInclude,
    });
  });
}

export async function deleteRecipe(userId, id) {
  const { count } = await prisma.recipe.deleteMany({ where: { id, userId } });
  return count > 0;
}
