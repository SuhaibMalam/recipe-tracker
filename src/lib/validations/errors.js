// Flattens zod issues to { "title": msg, "ingredients.2.quantity": msg }, first error per field.
export function toFieldErrors(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}

// Form inputs send "" for empty. null (not undefined) lets an edit clear a value;
// Prisma reads undefined as "leave unchanged".
export const blankToNull = (v) => (v === "" || v === undefined ? null : v);
