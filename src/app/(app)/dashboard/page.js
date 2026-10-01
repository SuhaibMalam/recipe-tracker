import Link from "next/link";
import { getCalorieGoal } from "@/lib/profile";
import { requireUser } from "@/lib/session";
import { countRecipes, listRecipes } from "@/lib/recipes";
import { dailyTotals, mostLoggedRecipes } from "@/lib/logs";
import { getUserToday } from "@/lib/timezone";
import { addDays, dateToDay } from "@/lib/day";
import { formatNumber, plural } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import TodaySummary from "@/components/dashboard/TodaySummary";
import CalorieChart from "@/components/dashboard/CalorieChart";

export const metadata = { title: "Overview" };

const ZERO = { calories: 0, protein: 0, carbs: 0, fat: 0 };

function RecipeList({ title, items, empty, meta }) {
  return (
    <section aria-label={title} className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {items.map((r) => (
            <li key={r.id} className="flex items-baseline justify-between gap-4 py-2.5">
              <Link
                href={`/recipes/${r.id}`}
                className="truncate font-medium hover:text-terracotta-dark hover:underline"
              >
                {r.title}
              </Link>
              <span className="shrink-0 text-sm text-ink-muted">{meta(r)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const today = await getUserToday();
  const from = addDays(today, -6);

  const [totals, recent, recipeCount, regulars, calorieGoal] = await Promise.all([
    dailyTotals(user.id, { from, to: today }),
    listRecipes(user.id, { take: 4 }),
    countRecipes(user.id),
    mostLoggedRecipes(user.id, { from: addDays(today, -29), take: 4 }),
    getCalorieGoal(user.id),
  ]);

  const byDay = new Map(totals.map((t) => [dateToDay(t.day), t]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(from, i);
    return { day, calories: byDay.get(day)?.calories ?? 0 };
  });
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Hi, {firstName}.</h1>
          <p className="mt-2 text-ink-muted">Here&apos;s what&apos;s cooking.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/log" className={buttonClasses("secondary")}>
            Log food
          </Link>
          <Link href="/recipes/new" className={buttonClasses("primary")}>
            New recipe
          </Link>
        </div>
      </div>

      {recipeCount === 0 && totals.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your recipe box is empty"
            action={
              <Link href="/recipes/new" className={buttonClasses("primary")}>
                Add your first recipe
              </Link>
            }
          >
            Add a recipe you make often. Once it&apos;s in, you can log it in one tap and watch your
            week add up.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
            <TodaySummary totals={byDay.get(today) ?? ZERO} goal={calorieGoal} />
            <CalorieChart days={days} goal={calorieGoal} today={today} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <RecipeList
              title="Your regulars"
              items={regulars}
              empty="Recipes you log most over the past month will show up here."
              meta={(r) => `logged ${plural(r.timesLogged, "time")}`}
            />
            <RecipeList
              title="Recently added"
              items={recent}
              empty="Nothing yet."
              meta={(r) => (r.calories !== null ? `${formatNumber(r.calories)} kcal` : "")}
            />
          </div>
        </div>
      )}
    </>
  );
}
