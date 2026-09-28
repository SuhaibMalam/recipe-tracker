import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as collection from "@/app/api/recipes/route";
import * as item from "@/app/api/recipes/[id]/route";
import { createUser, params, request, soup } from "./helpers";

vi.mock("@/lib/session", () => ({ getSession: vi.fn(), requireUser: vi.fn() }));

const signInAs = (user) => getSession.mockResolvedValue(user ? { user } : null);

async function createRecipe(body = soup) {
  const res = await collection.POST(request("/api/recipes", "POST", body));
  return { res, recipe: (await res.json()).recipe };
}

let alice, bob;
beforeEach(async () => {
  [alice, bob] = await Promise.all([createUser("Alice"), createUser("Bob")]);
  signInAs(alice);
});

describe("authentication", () => {
  it("returns 401 on every endpoint without a session", async () => {
    signInAs(null);
    const responses = await Promise.all([
      collection.GET(request("/api/recipes")),
      collection.POST(request("/api/recipes", "POST", soup)),
      item.GET(request("/api/recipes/x"), params("x")),
      item.PUT(request("/api/recipes/x", "PUT", soup), params("x")),
      item.DELETE(request("/api/recipes/x", "DELETE"), params("x")),
    ]);
    expect(responses.map((r) => r.status)).toEqual([401, 401, 401, 401, 401]);
  });
});

describe("POST /api/recipes", () => {
  it("creates the recipe with normalised, ordered ingredients", async () => {
    const { res, recipe } = await createRecipe();
    expect(res.status).toBe(201);
    expect(recipe.userId).toBe(alice.id);
    expect(recipe.recipeIngredients.map((ri) => [ri.ingredient.name, ri.displayOrder])).toEqual([
      ["red lentils", 0],
      ["onion", 1],
    ]);
  });

  it("shares one Ingredient row between users instead of duplicating it", async () => {
    const garlic = { ...soup, ingredients: [{ name: "Garlic", quantity: 2, unit: "piece" }] };
    await createRecipe(garlic);
    signInAs(bob);
    await createRecipe({
      ...garlic,
      ingredients: [{ name: "garlic ", quantity: 1, unit: "piece" }],
    });
    expect(await prisma.ingredient.count({ where: { name: "garlic" } })).toBe(1);
  });

  it("returns 400 with per-field errors for invalid input", async () => {
    const res = await collection.POST(
      request("/api/recipes", "POST", { title: "", servings: 0, steps: "x", ingredients: [] }),
    );
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).fieldErrors)).toEqual(
      expect.arrayContaining(["title", "servings", "ingredients"]),
    );
  });

  it("returns 400 for a body that isn't JSON", async () => {
    const res = await collection.POST(request("/api/recipes", "POST", "{nope"));
    expect(res.status).toBe(400);
  });
});

describe("authorization", () => {
  it("hides another user's recipe as 404 and leaves it untouched", async () => {
    const { recipe } = await createRecipe();
    signInAs(bob);

    const [get, put, del] = await Promise.all([
      item.GET(request(`/api/recipes/${recipe.id}`), params(recipe.id)),
      item.PUT(
        request(`/api/recipes/${recipe.id}`, "PUT", { ...soup, title: "Mine now" }),
        params(recipe.id),
      ),
      item.DELETE(request(`/api/recipes/${recipe.id}`, "DELETE"), params(recipe.id)),
    ]);
    expect([get.status, put.status, del.status]).toEqual([404, 404, 404]);

    const stored = await prisma.recipe.findUnique({ where: { id: recipe.id } });
    expect(stored.title).toBe(soup.title);
  });

  it("never lists another user's recipes", async () => {
    await createRecipe();
    signInAs(bob);
    const body = await (await collection.GET(request("/api/recipes"))).json();
    expect(body.total).toBe(0);
  });
});

describe("PUT /api/recipes/:id", () => {
  it("replaces the ingredient list and can clear optional fields", async () => {
    const { recipe } = await createRecipe();
    const res = await item.PUT(
      request(`/api/recipes/${recipe.id}`, "PUT", {
        ...soup,
        calories: "",
        ingredients: [{ name: "Water", quantity: 1, unit: "l" }],
      }),
      params(recipe.id),
    );
    const updated = (await res.json()).recipe;
    expect(res.status).toBe(200);
    expect(updated.calories).toBeNull();
    expect(updated.recipeIngredients.map((ri) => ri.ingredient.name)).toEqual(["water"]);
  });
});

describe("DELETE /api/recipes/:id", () => {
  it("deletes the recipe but keeps food-log history as a snapshot", async () => {
    const { recipe } = await createRecipe();
    const log = await prisma.nutritionLog.create({
      data: {
        userId: alice.id,
        recipeId: recipe.id,
        name: recipe.title,
        day: new Date("2026-09-20T00:00:00Z"),
        calories: 412,
        protein: 24,
        carbs: 58,
        fat: 9.5,
      },
    });

    const res = await item.DELETE(
      request(`/api/recipes/${recipe.id}`, "DELETE"),
      params(recipe.id),
    );
    expect(res.status).toBe(204);

    const kept = await prisma.nutritionLog.findUnique({ where: { id: log.id } });
    expect(kept).toMatchObject({ recipeId: null, name: soup.title, calories: 412 });
  });
});

describe("GET /api/recipes search", () => {
  it("matches on ingredient names as well as titles", async () => {
    await createRecipe();
    await createRecipe({
      ...soup,
      title: "Garlic noodles",
      ingredients: [{ name: "Garlic", quantity: 3, unit: "piece" }],
    });

    const byIngredient = await (await collection.GET(request("/api/recipes?q=LENTIL"))).json();
    expect(byIngredient.recipes.map((r) => r.title)).toEqual([soup.title]);

    const junkPage = await collection.GET(request("/api/recipes?page=banana"));
    expect(junkPage.status).toBe(200);
  });
});
