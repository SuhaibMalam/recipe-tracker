import { describe, expect, it } from "vitest";
import { logSchema } from "@/lib/validations/log";
import { addDays, dateToDay } from "@/lib/day";

const today = dateToDay(new Date());

describe("logSchema", () => {
  it("accepts a recipe log and coerces servings", () => {
    const data = logSchema.parse({ source: "recipe", recipeId: "r1", servings: "1.5", day: today });
    expect(data.servings).toBe(1.5);
  });

  it("defaults blank manual macros to 0 (calories stay required)", () => {
    const data = logSchema.parse({
      source: "manual",
      name: " Banana ",
      calories: "105",
      carbs: "",
      day: today,
    });
    expect(data).toMatchObject({ name: "Banana", calories: 105, protein: 0, carbs: 0, fat: 0 });
    expect(logSchema.safeParse({ source: "manual", name: "x", day: today }).success).toBe(false);
  });

  it("rejects an unknown source instead of guessing", () => {
    expect(logSchema.safeParse({ source: "other", day: today }).success).toBe(false);
  });

  it("allows tomorrow (UTC) for users ahead of UTC, but not further", () => {
    const base = { source: "manual", name: "x", calories: 1 };
    expect(logSchema.safeParse({ ...base, day: addDays(today, 1) }).success).toBe(true);
    expect(logSchema.safeParse({ ...base, day: addDays(today, 2) }).success).toBe(false);
  });

  it("rejects malformed dates", () => {
    const base = { source: "manual", name: "x", calories: 1 };
    for (const day of ["2026-02-30", "24/09/2026", ""]) {
      expect(logSchema.safeParse({ ...base, day }).success).toBe(false);
    }
  });
});
