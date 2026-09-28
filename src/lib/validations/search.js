import * as z from "zod";

// Query strings are untrusted too: clamp instead of erroring so a hand-edited
// URL like ?page=abc just falls back to page 1.
export const recipeSearchSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});
