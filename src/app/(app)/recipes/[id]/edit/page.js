import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getRecipe } from "@/lib/recipes";
import RecipeForm from "@/components/recipes/RecipeForm";

export const metadata = { title: "Edit recipe" };

export default async function EditRecipePage({ params }) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  const recipe = await getRecipe(user.id, id);
  if (!recipe) notFound();

  return (
    <>
      <Link href={`/recipes/${recipe.id}`} className="text-sm text-ink-muted hover:text-ink">
        ← {recipe.title}
      </Link>
      <h1 className="mt-3 mb-8 text-3xl font-semibold">Edit recipe</h1>
      <RecipeForm recipe={recipe} />
    </>
  );
}
