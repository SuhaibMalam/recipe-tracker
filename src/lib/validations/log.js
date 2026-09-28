import * as z from "zod";
import { addDays, dateToDay } from "@/lib/day";

// Loose bounds without knowing the user's zone: no earlier than 2000, and at
// most one day ahead of UTC (covers everyone east of Greenwich).
const day = z.iso
  .date("Pick a date")
  .refine((d) => d >= "2000-01-01", "That's too far back")
  .refine((d) => d <= addDays(dateToDay(new Date()), 1), "That's in the future");

const macro = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? 0 : v),
  z.coerce
    .number("Enter a number")
    .min(0, "Can't be negative")
    .max(1000, "That's more than a meal"),
);

export const recipeLogSchema = z.object({
  source: z.literal("recipe"),
  recipeId: z.string().min(1),
  servings: z.coerce
    .number("Enter how many servings")
    .positive("More than 0")
    .max(20, "At most 20 servings"),
  day,
});

export const manualLogSchema = z.object({
  source: z.literal("manual"),
  name: z.string().trim().min(1, "What did you eat?").max(120, "Keep it under 120 characters"),
  calories: z.coerce
    .number("Enter the calories")
    .int("Use a whole number")
    .min(0, "Can't be negative")
    .max(10000, "That's more than a meal"),
  protein: macro,
  carbs: macro,
  fat: macro,
  day,
});

export const logSchema = z.discriminatedUnion("source", [recipeLogSchema, manualLogSchema]);
