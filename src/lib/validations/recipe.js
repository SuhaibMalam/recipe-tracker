import * as z from "zod";
import { blankToNull } from "@/lib/validations/errors";

// RecipeIngredient.unit is a plain String column, so this list is the only
// thing keeping the form's <select> and the API check in agreement.
export const RECIPE_UNITS = ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece", "oz", "lb"];

const optionalNumber = (schema) => z.preprocess(blankToNull, schema.nullable());

const optionalText = (max, message) =>
  z.preprocess(
    (v) => blankToNull(typeof v === "string" ? v.trim() : v),
    z.string().max(max, message).nullable(),
  );

export const recipeIngredientSchema = z.object({
  // Normalised here so "Egg" and "egg " resolve to the same Ingredient row.
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Name the ingredient")
    .max(100, "Keep it under 100 characters"),
  quantity: z.coerce
    .number("Enter an amount")
    .positive("Must be more than 0")
    .max(100000, "That's a lot — check the amount"),
  unit: z.enum(RECIPE_UNITS, "Pick a unit"),
});

export const recipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the recipe a name")
    .max(200, "Keep the name under 200 characters"),
  description: optionalText(2000, "Keep the description under 2000 characters"),
  servings: z.coerce
    .number("Enter how many servings")
    .int("Use a whole number")
    .min(1, "At least 1 serving")
    .max(100, "At most 100 servings"),
  steps: z
    .string()
    .trim()
    .min(1, "Add at least one step")
    .max(10000, "Keep the method under 10,000 characters"),
  calories: optionalNumber(
    z.coerce
      .number()
      .int("Use a whole number")
      .min(0, "Can't be negative")
      .max(10000, "Too high for one serving"),
  ),
  protein: optionalNumber(
    z.coerce.number().min(0, "Can't be negative").max(1000, "Too high for one serving"),
  ),
  carbs: optionalNumber(
    z.coerce.number().min(0, "Can't be negative").max(1000, "Too high for one serving"),
  ),
  fat: optionalNumber(
    z.coerce.number().min(0, "Can't be negative").max(1000, "Too high for one serving"),
  ),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "Add at least one ingredient")
    .max(50, "A recipe can have at most 50 ingredients")
    // (recipeId, ingredientId) is unique in the DB, so catch repeats here with a useful message.
    .superRefine((rows, ctx) => {
      const seen = new Set();
      rows.forEach((row, i) => {
        if (seen.has(row.name)) {
          ctx.addIssue({
            code: "custom",
            path: [i, "name"],
            message: "Already listed — combine the amounts",
          });
        }
        seen.add(row.name);
      });
    }),
});
