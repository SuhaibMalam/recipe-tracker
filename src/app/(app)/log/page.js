import Link from "next/link";
import { requireUser } from "@/lib/session";
import { dailyTotals, listLogs } from "@/lib/logs";
import { getUserToday } from "@/lib/timezone";
import { addDays, dateToDay, formatDay } from "@/lib/day";
import { formatNumber } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import ManualLogForm from "@/components/log/ManualLogForm";
import DeleteLogButton from "@/components/log/DeleteLogButton";

export const metadata = { title: "Food log" };

const HISTORY_DAYS = 14;

function MacroLine({ totals, className = "" }) {
  return (
    <span className={`tabular-nums ${className}`}>
      P {formatNumber(totals.protein)}g · C {formatNumber(totals.carbs)}g · F{" "}
      {formatNumber(totals.fat)}g
    </span>
  );
}

export default async function LogPage() {
  const user = await requireUser();
  const today = await getUserToday();
  const range = { from: addDays(today, -(HISTORY_DAYS - 1)), to: today };
  // Day totals come from the same SQL aggregate the dashboard uses, so both pages always agree.
  const [logs, totals] = await Promise.all([listLogs(user.id, range), dailyTotals(user.id, range)]);

  const byDay = Map.groupBy(logs, (log) => dateToDay(log.day));
  const totalsByDay = new Map(totals.map((t) => [dateToDay(t.day), t]));

  return (
    <>
      <h1 className="text-3xl font-semibold">Food log</h1>
      <p className="mt-2 text-ink-muted">The last two weeks of what you&apos;ve eaten.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          {byDay.size === 0 ? (
            <EmptyState title="Nothing logged yet">
              Open one of your{" "}
              <Link
                href="/recipes"
                className="font-medium text-terracotta-deep underline underline-offset-2"
              >
                recipes
              </Link>{" "}
              and hit &ldquo;Log it&rdquo;, or add something on the right.
            </EmptyState>
          ) : (
            [...byDay].map(([day, entries]) => {
              const totals = totalsByDay.get(day);
              return (
                <section key={day} aria-labelledby={`day-${day}`} className="card overflow-hidden">
                  <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-cream-dark/40 px-5 py-3">
                    <h2 id={`day-${day}`} className="text-lg font-semibold">
                      {formatDay(day, today)}
                    </h2>
                    <p className="text-sm text-ink-muted">
                      <span className="font-semibold text-ink">
                        {formatNumber(totals.calories)} kcal
                      </span>
                      <span aria-hidden="true"> · </span>
                      <MacroLine totals={totals} />
                    </p>
                  </header>
                  <ul className="divide-y divide-line">
                    {entries.map((log) => (
                      <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {log.recipeId ? (
                              <Link
                                href={`/recipes/${log.recipeId}`}
                                className="hover:text-terracotta-dark hover:underline"
                              >
                                {log.name}
                              </Link>
                            ) : (
                              log.name
                            )}
                            {log.servings !== 1 && (
                              <span className="ml-1.5 text-sm font-normal text-ink-muted">
                                × {formatNumber(log.servings)}
                              </span>
                            )}
                          </p>
                          <MacroLine totals={log} className="text-xs text-ink-muted" />
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatNumber(log.calories)} kcal
                        </p>
                        <DeleteLogButton id={log.id} name={log.name} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <ManualLogForm today={today} />
        </aside>
      </div>
    </>
  );
}
