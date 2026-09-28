import { formatNumber } from "@/lib/format";
import { formatDay, formatWeekday } from "@/lib/day";

// Round axis: ≤4 steps of 250/500/1000/2000 kcal.
function niceScale(maxValue) {
  const max = Math.max(maxValue, 1);
  const step = [250, 500, 1000, 2000].find((s) => max / s <= 4) ?? 2000;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

const pct = (value, top) => `${(value / top) * 100}%`;

export default function CalorieChart({ days, goal, today }) {
  const { top, ticks } = niceScale(Math.max(goal ?? 0, ...days.map((d) => d.calories)));

  return (
    <figure className="card p-5 sm:p-6">
      <figcaption>
        <h2 className="text-lg font-semibold">Calories, last 7 days</h2>
        <p className="text-sm text-ink-muted">
          {goal ? `Line marks your ${formatNumber(goal)} kcal goal.` : "Set a goal to see it here."}
        </p>
      </figcaption>

      <div className="mt-6 flex gap-3">
        {/* y-axis */}
        <div
          aria-hidden="true"
          className="relative h-48 w-10 shrink-0 text-right text-xs text-ink-muted tabular-nums"
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: pct(t, top) }}
            >
              {formatNumber(t)}
            </span>
          ))}
        </div>

        <div className="relative h-48 flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-line"
              style={{ bottom: pct(t, top) }}
            />
          ))}

          {goal && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 z-10 border-t border-ink/60"
              style={{ bottom: pct(goal, top) }}
            >
              <span className="absolute -top-5 right-0 bg-paper px-1 text-xs font-medium text-ink">
                Goal
              </span>
            </div>
          )}

          <ol className="absolute inset-0 flex">
            {days.map(({ day, calories }) => {
              const isToday = day === today;
              const label = `${formatDay(day, today)}: ${formatNumber(calories)} kcal`;
              return (
                <li
                  key={day}
                  tabIndex={0}
                  aria-label={label}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
                >
                  <div
                    className={`w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-85 ${
                      isToday ? "bg-terracotta-deep" : "bg-terracotta"
                    } ${calories > 0 ? "min-h-0.5" : ""}`}
                    style={{ height: pct(calories, top) }}
                  />
                  {isToday && calories > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute text-xs font-semibold text-ink group-hover:invisible group-focus-visible:invisible"
                      style={{ bottom: `calc(${pct(calories, top)} + 4px)` }}
                    >
                      {formatNumber(calories)}
                    </span>
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none invisible absolute z-20 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs text-cream shadow-warm group-hover:visible group-focus-visible:visible"
                    style={{ bottom: `calc(${pct(calories, top)} + 8px)` }}
                  >
                    {label}
                  </span>
                  {/* hit target is the whole column, and it gets a visible focus ring */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-md group-focus-visible:outline-2 group-focus-visible:outline-terracotta-deep"
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <ol aria-hidden="true" className="mt-2 ml-13 flex text-xs text-ink-muted">
        {days.map(({ day }) => (
          <li
            key={day}
            className={`flex-1 text-center ${day === today ? "font-semibold text-ink" : ""}`}
          >
            {day === today ? "Today" : formatWeekday(day)}
          </li>
        ))}
      </ol>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-ink-muted hover:text-ink">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-line text-ink-muted">
              <th scope="col" className="py-1.5 font-medium">
                Day
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Calories
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {days.map(({ day, calories }) => (
              <tr key={day} className="border-b border-line/60">
                <td className="py-1.5">{formatDay(day, today)}</td>
                <td className="py-1.5 text-right">{formatNumber(calories)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
