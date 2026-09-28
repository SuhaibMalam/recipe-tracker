import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SITE_NAME } from "@/lib/site";
import RecipeCardIllustration from "@/components/RecipeCardIllustration";

export default async function AuthLayout({ children }) {
  // A real session lookup (not proxy's cookie peek), so a stale cookie can't cause a redirect loop.
  if (await getSession()) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-cream lg:flex">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
          {SITE_NAME}
        </Link>

        <RecipeCardIllustration className="mx-auto w-full max-w-md" />

        <p className="max-w-sm font-serif text-xl leading-snug text-cream/90">
          Every recipe you cook, and exactly what it adds up to.
        </p>
      </aside>

      <main className="flex flex-col px-6 py-10 sm:px-12">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-ink lg:hidden"
        >
          {SITE_NAME}
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
