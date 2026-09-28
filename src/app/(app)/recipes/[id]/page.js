import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getRecipe } from "@/lib/recipes";
import { formatAmount, formatNumber } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import DeleteRecipeButton from "@/components/recipes/DeleteRecipeButton";
import LogRecipeForm from "@/components/log/LogRecipeForm";
import { getUserToday } from "@/lib/timezone";

async function loadRecipe(params) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  return getRecipe(user.id, id);
}

export async function generateMetadata({ params }) {
  const recipe = await loadRecipe(params);
  return { title: recipe?.title ?? "Recipe not found" };
}

export default async function RecipePage({ params }) {
  const [recipe, today] = await Promise.all([loadRecipe(params), getUserToday()]);
  if (!recipe) notFound();

  const steps = recipe.steps
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const nutrition = [
    ["Calories", recipe.calories, "kcal"],
    ["Protein", recipe.protein, "g"],
    ["Carbs", recipe.carbs, "g"],
    ["Fat", recipe.fat, "g"],
  ];
  const hasNutrition = nutrition.some(([, value]) => value !== null);

  return (
    <article>
      <Link href="/recipes" className="text-sm text-ink-muted hover:text-ink">
        ← Recipes
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-3 text-lg text-ink-muted">{recipe.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/recipes/${recipe.id}/edit`} className={buttonClasses("secondary")}>
            Edit
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </header>

      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-line py-5">
        <div className="flex flex-col-reverse">
          <dt className="text-xs font-medium uppercase tracking-wider text-ink-muted">Serves</dt>
          <dd className="font-serif text-2xl">{recipe.servings}</dd>
        </div>
        {hasNutrition &&
          nutrition.map(([label, value, unit]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                {label} <span className="normal-case tracking-normal">/ serving</span>
              </dt>
              <dd className="font-serif text-2xl">
                {value === null ? "—" : formatNumber(value)}
                {value !== null && <span className="ml-0.5 text-base text-ink-muted">{unit}</span>}
              </dd>
            </div>
          ))}
      </dl>

      <div className="mt-10 grid gap-10 md:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-6">
          {recipe.calories !== null ? (
            <LogRecipeForm recipeId={recipe.id} today={today} />
          ) : (
            <p className="card p-5 text-sm text-ink-muted">
              Add calories to this recipe to log it.{" "}
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="font-medium text-terracotta-deep underline underline-offset-2"
              >
                Edit nutrition
              </Link>
            </p>
          )}
          <section aria-labelledby="ingredients-heading" className="card h-fit p-6">
            <h2
              id="ingredients-heading"
              className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-terracotta-deep"
            >
              Ingredients
            </h2>
            <ul className="mt-4 divide-y divide-line text-sm">
              {recipe.recipeIngredients.map((ri) => (
                <li key={ri.id} className="flex gap-3 py-2.5">
                  <span className="w-20 shrink-0 font-medium tabular-nums">
                    {formatAmount(ri.quantity, ri.unit)}
                  </span>
                  <span className="inline-block first-letter:uppercase">{ri.ingredient.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="method-heading">
          <h2 id="method-heading" className="text-2xl font-semibold">
            Method
          </h2>
          <ol className="mt-5 space-y-5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 font-serif text-2xl leading-none text-terracotta"
                >
                  {i + 1}
                </span>
                <p className="leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
