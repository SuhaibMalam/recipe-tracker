import Link from "next/link";
import RecipeForm from "@/components/recipes/RecipeForm";

export const metadata = { title: "New recipe" };

export default function NewRecipePage() {
  return (
    <>
      <Link href="/recipes" className="text-sm text-ink-muted hover:text-ink">
        ← Recipes
      </Link>
      <h1 className="mt-3 mb-8 text-3xl font-semibold">New recipe</h1>
      <RecipeForm />
    </>
  );
}
