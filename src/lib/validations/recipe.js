import * as z from "zod";

/**
 * Fixed set of units for RecipeIngredient.unit.
 *
 * There's no Prisma enum backing this — `unit` is a plain String column.
 * This array is the single source of truth: RecipeForm's <select> will
 * render its options from this same list, so the UI and the server check
 * can never drift apart.
 */
export const RECIPE_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "piece",
  "oz",
  "lb",
];

/**
 * One row of a recipe's ingredient list.
 *
 * `name` is trimmed and lowercased here, not at the Prisma call site, so
 * every caller gets an already-normalized value back from `.parse()` /
 * `.safeParse()` — this is what keeps "Egg" and "egg" from becoming two
 * different Ingredient rows.
 */
export const recipeIngredientSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Ingredient name is required")
    .max(100, "Ingredient name is too long"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.enum(RECIPE_UNITS, "Select a valid unit"),
});

/**
 * Full recipe payload. Shared by the create (POST) and edit (PATCH) API
 * routes and by RecipeForm's client-side validation.
 */
export const recipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be under 2000 characters")
    .optional()
    .transform((val) => (val ? val : undefined)),
  steps: z
    .string()
    .trim()
    .min(1, "Steps are required")
    .max(10000, "Steps are too long"),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "Add at least one ingredient")
    .max(50, "A recipe can have at most 50 ingredients"),
});
