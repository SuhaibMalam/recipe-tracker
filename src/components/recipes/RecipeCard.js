import Link from "next/link";
import { formatNumber, plural } from "@/lib/format";

export default function RecipeCard({ recipe }) {
  const hasMacros = recipe.calories !== null;

  return (
    <li>
      <Link
        href={`/recipes/${recipe.id}`}
        className="card group flex h-full flex-col p-5 transition-[border-color,box-shadow] hover:border-terracotta/50 hover:shadow-warm-lg"
      >
        <h2 className="text-lg font-semibold leading-snug text-ink group-hover:text-terracotta-dark">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{recipe.description}</p>
        )}
        <p className="mt-auto pt-4 text-xs font-medium uppercase tracking-wider text-ink-muted">
          Serves {recipe.servings} · {plural(recipe._count.recipeIngredients, "ingredient")}
        </p>
        {hasMacros && (
          <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-ink">
            <span className="font-semibold text-terracotta-deep">{recipe.calories} kcal</span>
            {recipe.protein !== null && <span>{formatNumber(recipe.protein)}g protein</span>}
          </p>
        )}
      </Link>
    </li>
  );
}
