import Link from "next/link";
import { requireUser } from "@/lib/session";
import { searchRecipes } from "@/lib/recipes";
import { recipeSearchSchema } from "@/lib/validations/search";
import { plural } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import RecipeCard from "@/components/recipes/RecipeCard";

export const metadata = { title: "Recipes" };

function pageHref(q, page) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/recipes?${qs}` : "/recipes";
}

export default async function RecipesPage({ searchParams }) {
  const user = await requireUser();
  const { q, page } = recipeSearchSchema.parse(await searchParams);
  const { recipes, total, pageCount } = await searchRecipes(user.id, { q, page });

  let summary = total ? `${plural(total, "recipe")} in your box.` : "Nothing saved yet.";
  if (q) summary = `${plural(total, "match", "matches")} for “${q}”.`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Recipes</h1>
          <p className="mt-2 text-ink-muted" aria-live="polite">
            {summary}
          </p>
        </div>
        <Link href="/recipes/new" className={buttonClasses("primary")}>
          New recipe
        </Link>
      </div>

      {/* A plain GET form: works before JS loads and gives shareable URLs. */}
      <form role="search" action="/recipes" className="mt-6 flex gap-2">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes by name or ingredient
        </label>
        <input
          id="recipe-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or ingredient"
          className={`${inputClasses} max-w-sm`}
        />
        <button type="submit" className={buttonClasses("secondary")}>
          Search
        </button>
        {q && (
          <Link href="/recipes" className={buttonClasses("ghost")}>
            Clear
          </Link>
        )}
      </form>

      <div className="mt-8">
        {recipes.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ul>
        ) : q || page > 1 ? (
          <EmptyState title="No matches">
            Nothing in your box matches that. Try an ingredient, like &ldquo;garlic&rdquo;.
          </EmptyState>
        ) : (
          <EmptyState
            title="Your recipe box is empty"
            action={
              <Link href="/recipes/new" className={buttonClasses("primary")}>
                Add your first recipe
              </Link>
            }
          >
            Start with something you cook every week — it&apos;s the one you&apos;ll log most.
          </EmptyState>
        )}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={pageHref(q, page - 1)} className={buttonClasses("secondary")} rel="prev">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-ink-muted">
            Page {page} of {pageCount}
          </p>
          {page < pageCount ? (
            <Link href={pageHref(q, page + 1)} className={buttonClasses("secondary")} rel="next">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
