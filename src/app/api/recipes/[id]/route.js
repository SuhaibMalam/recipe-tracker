import { NextResponse } from "next/server";
import { getApiUser, notFound, parseBody, unauthorized } from "@/lib/api";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/recipes";
import { recipeSchema } from "@/lib/validations/recipe";

export async function GET(_request, { params }) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const recipe = await getRecipe(user.id, id);
  return recipe ? NextResponse.json({ recipe }) : notFound();
}

// PUT, not PATCH: the body is the whole recipe and replaces the stored one.
export async function PUT(request, { params }) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { data, response } = await parseBody(request, recipeSchema);
  if (response) return response;

  const { id } = await params;
  const recipe = await updateRecipe(user.id, id, data);
  return recipe ? NextResponse.json({ recipe }) : notFound();
}

export async function DELETE(_request, { params }) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { id } = await params;
  return (await deleteRecipe(user.id, id)) ? new NextResponse(null, { status: 204 }) : notFound();
}
