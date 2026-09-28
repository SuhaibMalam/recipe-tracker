import * as z from "zod";
import { blankToNull } from "@/lib/validations/errors";

export const goalSchema = z.object({
  calorieGoal: z.preprocess(
    blankToNull,
    z.coerce
      .number("Enter a number")
      .int("Use a whole number")
      .min(800, "Goals under 800 kcal aren't safe to track here")
      .max(6000, "Keep it under 6,000 kcal")
      .nullable(),
  ),
});
