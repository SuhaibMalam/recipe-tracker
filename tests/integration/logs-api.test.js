import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDays, dateToDay } from "@/lib/day";
import * as logs from "@/app/api/logs/route";
import * as logItem from "@/app/api/logs/[id]/route";
import { createUser, params, request, soup } from "./helpers";

vi.mock("@/lib/session", () => ({ getSession: vi.fn(), requireUser: vi.fn() }));
// The real version reads a request cookie; tests pin "today" to the machine's date.
vi.mock("@/lib/timezone", () => ({ getUserToday: vi.fn(async () => dateToDay(new Date())) }));

const today = dateToDay(new Date());
const signInAs = (user) => getSession.mockResolvedValue({ user });

const recipeFor = (user, overrides = {}) =>
  prisma.recipe.create({
    data: {
      userId: user.id,
      title: soup.title,
      steps: soup.steps,
      servings: 4,
      calories: 412,
      protein: 24,
      carbs: 58,
      fat: 9.5,
      ...overrides,
    },
  });

const postLog = async (body) => {
  const res = await logs.POST(request("/api/logs", "POST", body));
  return { status: res.status, body: await res.json() };
};

let alice, bob;
beforeEach(async () => {
  [alice, bob] = await Promise.all([createUser("Alice"), createUser("Bob")]);
  signInAs(alice);
});

describe("POST /api/logs", () => {
  it("scales a recipe's per-serving macros by servings eaten", async () => {
    const recipe = await recipeFor(alice);
    const { status, body } = await postLog({
      source: "recipe",
      recipeId: recipe.id,
      servings: 1.5,
      day: today,
    });

    expect(status).toBe(201);
    expect(body.log).toMatchObject({
      name: soup.title,
      calories: 618,
      protein: 36,
      carbs: 87,
      fat: 14.3,
    });
  });

  it("stores a snapshot — editing the recipe later doesn't rewrite history", async () => {
    const recipe = await recipeFor(alice);
    const { body } = await postLog({
      source: "recipe",
      recipeId: recipe.id,
      servings: 1,
      day: today,
    });

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { calories: 999, title: "Renamed" },
    });

    const log = await prisma.nutritionLog.findUnique({ where: { id: body.log.id } });
    expect(log).toMatchObject({ calories: 412, name: soup.title });
  });

  it("refuses to log a recipe that has no calories (422)", async () => {
    const recipe = await recipeFor(alice, { calories: null });
    const { status } = await postLog({
      source: "recipe",
      recipeId: recipe.id,
      servings: 1,
      day: today,
    });
    expect(status).toBe(422);
  });

  it("can't log someone else's recipe (404)", async () => {
    const recipe = await recipeFor(bob);
    const { status } = await postLog({
      source: "recipe",
      recipeId: recipe.id,
      servings: 1,
      day: today,
    });
    expect(status).toBe(404);
  });
});

describe("GET /api/logs", () => {
  it("defaults to the last 7 days and only returns the caller's entries", async () => {
    const entry = (user, day, name) =>
      prisma.nutritionLog.create({
        data: {
          userId: user.id,
          day: new Date(`${day}T00:00:00Z`),
          name,
          calories: 100,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      });
    await Promise.all([
      entry(alice, today, "today"),
      entry(alice, addDays(today, -6), "six days ago"),
      entry(alice, addDays(today, -7), "a week ago"),
      entry(bob, today, "bob's"),
    ]);

    const body = await (await logs.GET(request("/api/logs"))).json();
    expect(body.logs.map((l) => l.name).sort()).toEqual(["six days ago", "today"]);
  });

  it("rejects a reversed range", async () => {
    const res = await logs.GET(request("/api/logs?from=2026-09-10&to=2026-09-01"));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/logs/:id", () => {
  it("only deletes the caller's own entries", async () => {
    const log = await prisma.nutritionLog.create({
      data: {
        userId: bob.id,
        day: new Date(`${today}T00:00:00Z`),
        name: "x",
        calories: 1,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    });
    const res = await logItem.DELETE(request(`/api/logs/${log.id}`, "DELETE"), params(log.id));
    expect(res.status).toBe(404);
    expect(await prisma.nutritionLog.count({ where: { id: log.id } })).toBe(1);
  });
});
