import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { demoEnabled } from "@/lib/demo";
import { REPO_URL, SITE_NAME } from "@/lib/site";
import { buttonClasses } from "@/components/ui/Button";
import RecipeCardIllustration from "@/components/RecipeCardIllustration";
import dashboardShot from "../../public/screenshots/dashboard.png";
import recipeShot from "../../public/screenshots/recipe.png";
import logShot from "../../public/screenshots/log.png";

const steps = [
  {
    title: "Write it down once",
    body: "Ingredients, method and nutrition per serving — the recipes you actually make, not a feed of ones you won't.",
    image: recipeShot,
    alt: "A recipe page showing nutrition per serving, an 'Ate this?' logging card and numbered method steps.",
  },
  {
    title: "Log it when you eat it",
    body: "Pick the recipe and how many servings. Had something else? Add it by hand. Every day adds itself up.",
    image: logShot,
    alt: "The food log, grouped by day with calorie and macro totals for each day.",
  },
];

function Screenshot({ src, alt, priority = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-warm-lg">
      <Image
        src={src}
        alt={alt}
        priority={priority}
        placeholder="blur"
        sizes="(min-width: 1024px) 960px, 100vw"
      />
    </div>
  );
}

export default async function Home() {
  if (await getSession()) redirect("/dashboard");
  const showDemo = demoEnabled();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-serif text-xl font-semibold tracking-tight">{SITE_NAME}</span>
        <Link href="/login" className={buttonClasses("ghost")}>
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div>
            <h1 className="text-4xl leading-[1.1] font-semibold sm:text-5xl">
              Every recipe you cook, and exactly what it adds up to.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              Save the dishes you actually make, log them in a tap, and see your week&apos;s
              calories and macros — without weighing every meal from scratch.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {showDemo && (
                <form method="post" action="/api/demo">
                  <button type="submit" className={buttonClasses("primary", "px-5 py-3")}>
                    Try the demo
                  </button>
                </form>
              )}
              <Link
                href="/register"
                className={buttonClasses(showDemo ? "secondary" : "primary", "px-5 py-3")}
              >
                Create an account
              </Link>
            </div>
            {showDemo && (
              <p className="mt-3 text-sm text-ink-muted">
                The demo is a shared account with two weeks of meals already logged. No sign-up.
              </p>
            )}
          </div>
          <RecipeCardIllustration className="mx-auto hidden w-full max-w-sm lg:block" />
        </section>

        <section aria-label="The overview" className="mx-auto max-w-5xl px-4 sm:px-6">
          <Screenshot
            src={dashboardShot}
            priority
            alt="The overview: today's calories against a 2,100 kcal goal, protein, carbs and fat, a seven-day calorie chart and the most-logged recipes."
          />
        </section>

        <section aria-labelledby="how-heading" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <h2 id="how-heading" className="text-3xl font-semibold">
            How it works
          </h2>
          <ol className="mt-10 flex flex-col gap-16">
            {steps.map((step, i) => (
              <li key={step.title} className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
                <div className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="font-serif text-4xl leading-none text-terracotta"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-ink-muted">{step.body}</p>
                  </div>
                </div>
                <Screenshot src={step.image} alt={step.alt} />
              </li>
            ))}
            <li className="flex gap-4 lg:max-w-[18rem]">
              <span aria-hidden="true" className="font-serif text-4xl leading-none text-terracotta">
                3
              </span>
              <div>
                <h3 className="text-xl font-semibold">See the week</h3>
                <p className="mt-2 text-ink-muted">
                  The overview above: today against your goal, the last seven days, and the recipes
                  you keep coming back to.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:px-6">
          <p>Built with Next.js, PostgreSQL, Prisma and Better Auth.</p>
          <a href={REPO_URL} className="font-medium text-ink underline-offset-4 hover:underline">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
