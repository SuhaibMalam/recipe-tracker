import { NextResponse } from "next/server";
import { getApiUser, parseBody, unauthorized } from "@/lib/api";
import { createRecipe, searchRecipes } from "@/lib/recipes";
import { recipeSchema } from "@/lib/validations/recipe";
import { recipeSearchSchema } from "@/lib/validations/search";

// GET /api/recipes?q=lentil&page=2
export async function GET(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const params = recipeSearchSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  return NextResponse.json(await searchRecipes(user.id, params));
}

export async function POST(request) {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const { data, response } = await parseBody(request, recipeSchema);
  if (response) return response;

  const recipe = await createRecipe(user.id, data);
  return NextResponse.json({ recipe }, { status: 201 });
}
