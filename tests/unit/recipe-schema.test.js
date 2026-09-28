import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/lib/validations/recipe";
import { toFieldErrors } from "@/lib/validations/errors";

const valid = {
  title: "Soup",
  servings: "4",
  steps: "Boil.",
  ingredients: [{ name: "Egg", quantity: "2", unit: "piece" }],
};

const errorsFor = (input) => toFieldErrors(recipeSchema.safeParse(input).error);

describe("recipeSchema", () => {
  it("normalises ingredient names so 'Egg ' and 'egg' are one Ingredient", () => {
    const data = recipeSchema.parse({
      ...valid,
      ingredients: [{ name: "  Red Lentils ", quantity: "200", unit: "g" }],
    });
    expect(data.ingredients[0]).toEqual({ name: "red lentils", quantity: 200, unit: "g" });
  });

  it("turns blank optional fields into null so an edit can clear them", () => {
    const data = recipeSchema.parse({ ...valid, description: "   ", calories: "", protein: "" });
    expect(data.description).toBeNull();
    expect(data.calories).toBeNull();
    expect(data.protein).toBeNull();
  });

  it("coerces numeric strings from form inputs", () => {
    const data = recipeSchema.parse({ ...valid, calories: "412", fat: "9.5" });
    expect(data.servings).toBe(4);
    expect(data.calories).toBe(412);
    expect(data.fat).toBe(9.5);
  });

  it("rejects the same ingredient twice, pointing at the repeat", () => {
    const errors = errorsFor({
      ...valid,
      ingredients: [
        { name: "Egg", quantity: 1, unit: "piece" },
        { name: "egg ", quantity: 1, unit: "piece" },
      ],
    });
    expect(errors["ingredients.1.name"]).toMatch(/already listed/i);
  });

  it.each([
    ["servings", 0],
    ["servings", 1.5],
    ["servings", 101],
    ["calories", -1],
    ["calories", 10.5],
  ])("rejects %s = %s", (field, value) => {
    expect(errorsFor({ ...valid, [field]: value })[field]).toBeDefined();
  });

  it("only accepts units from the fixed list", () => {
    const errors = errorsFor({
      ...valid,
      ingredients: [{ name: "x", quantity: 1, unit: "handful" }],
    });
    expect(errors["ingredients.0.unit"]).toBeDefined();
  });

  it("requires at least one ingredient and caps at 50", () => {
    expect(errorsFor({ ...valid, ingredients: [] }).ingredients).toBeDefined();
    const many = Array.from({ length: 51 }, (_, i) => ({ name: `i${i}`, quantity: 1, unit: "g" }));
    expect(errorsFor({ ...valid, ingredients: many }).ingredients).toBeDefined();
  });
});
