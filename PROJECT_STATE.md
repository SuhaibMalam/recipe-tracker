# PROJECT_STATE.md

## Current Focus

Recipe ingredients are now normalized (`Ingredient` / `RecipeIngredient` join model, migrated) and the authenticated dashboard shell exists. Recipe create/edit forms still write against the old model shape and need to be wired up to the new relation. `schema.prisma` also has an **unmigrated** change adding a `recipeId`/`recipe` relation to `NutritionLog` — run `prisma migrate dev` for that before building anything that depends on it.

The register page duplicate-`router.push` bug flagged on 2026-07-07 is still unfixed, and got worse: it now fires `router.push("/login")` followed immediately by `router.push("/login?registered=1")`, and the real `error.message` from Better Auth is swallowed in favor of a generic string (`error.message` is commented out).

---

## Next Task

1. Run `prisma migrate dev` to pick up the new `NutritionLog.recipeId` relation.
2. Fix the register page: remove the redundant unconditional `router.push("/login")` (keep only the `?registered=1` variant), and restore surfacing `error.message` instead of the hardcoded generic string.
3. Wire up recipe create/edit forms to the `RecipeIngredient` relation.

---

# Development History

## 2026-07-14

### Summary

Reviewed uncommitted working-tree changes (nothing new committed). Prettier-style formatting pass on `schema.prisma`, plus a new `NutritionLog.recipeId` relation to `Recipe` that has not been migrated yet. `auth.js`/login/register/dashboard/SignOutButton from 2026-07-07 are still uncommitted.

### Bugs Found

- Register page now has two consecutive `router.push` calls (`/login` then `/login?registered=1`) — the first was supposed to be removed, not left alongside the new one.
- Register page error handling now shows a generic hardcoded message instead of `error.message` (the real message is commented out) — hides validation/auth errors from the user during development.

### Next Task

See "Next Task" above.

---

## 2026-07-09

### Summary

Fixed the `RecipeIngredient` schema syntax errors and ran the Prisma migration
(`20260709082135_fix_recipe_ingredient_syntax`), completing the schema side of the
ingredient normalization started on 2026-07-07.

### Code & Database Changes

- `prisma/schema.prisma`: fixed `displayOrder` field name and the composite unique
  constraint (`@@unique([recipeId, ingredientId])`).
- Ran `prisma migrate dev` — dropped `Recipe.ingredients` (string), created
  `Ingredient` and `RecipeIngredient` tables. No backfill of old data (dev database,
  no real user data to preserve).

### Next Task

Wire up recipe create/edit forms to the new `RecipeIngredient` relation.

Full write-up: `docs/09-Daily-Notes/2026-07-09.md` and
`docs/07-Decisions/ADR/ADR-001-Normalized-Ingredient-Model.md`.

---

## 2026-07-07

### Summary

Auth flow polish (post-registration UX, auto sign-in) and first pass at normalizing recipe ingredients in the schema. Added a minimal authenticated dashboard page with sign-out.

### Features Completed

- Dashboard route (`src/app/dashboard/page.js`) — server-rendered, redirects to `/login` if no session, greets user by name/email.
- `SignOutButton` client component — calls `signOut()` then redirects to `/login`.
- Login page shows a "Account created — sign in below" success message after registration via `?registered=1` query param (wrapped in `Suspense` since it uses `useSearchParams`).

### Code & Database Changes

- `prisma/schema.prisma`: replaced `Recipe.ingredients` (String) with a `recipeIngredients RecipeIngredient[]` relation; added new `Ingredient` and `RecipeIngredient` models. **Not yet migrated** — schema currently has syntax errors (see Next Task).
- `src/lib/auth.js`: enabled `autoSignIn: true` on Better Auth's `emailAndPassword` config.

### Architecture Decisions

- Moving from a free-text `ingredients` string to a normalized `Ingredient` + `RecipeIngredient` join table so ingredients can be shared/queried across recipes (e.g. for nutrition aggregation later) instead of being trapped in unstructured text per recipe.

### Bugs Fixed

- None (register page currently has two consecutive `router.push` calls to `/login` — the redirect-with-`registered=1` was added but the original unconditional push above it wasn't removed; low-impact but should be cleaned up next session).

### Next Task

Fix schema syntax errors in `RecipeIngredient`/`Ingredient` models, run `prisma migrate dev`, then wire up recipe create/edit forms to the new ingredient relation.
