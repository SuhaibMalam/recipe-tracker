import { formatNumber } from "@/lib/format";
import GoalForm from "@/components/dashboard/GoalForm";

export default function TodaySummary({ totals, goal }) {
  const { calories, protein, carbs, fat } = totals;
  const over = goal ? calories - goal : 0;
  const fill = goal ? Math.min(calories / goal, 1) : 0;

  return (
    <section aria-labelledby="today-heading" className="card flex flex-col p-5 sm:p-6">
      <h2 id="today-heading" className="text-lg font-semibold">
        Today
      </h2>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-sans text-5xl font-semibold tracking-tight">
          {formatNumber(calories)}
        </span>
        <span className="text-ink-muted">kcal</span>
      </p>

      {goal ? (
        <div className="mt-4">
          <div
            role="meter"
            aria-label="Calories against daily goal"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={calories}
            className="h-2 overflow-hidden rounded-full bg-terracotta/15"
          >
            <div
              className={`h-full rounded-full ${over > 0 ? "bg-mustard-deep" : "bg-terracotta-deep"}`}
              style={{ width: `${fill * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {over > 0
              ? `${formatNumber(over)} kcal over your goal`
              : `${formatNumber(goal - calories)} kcal left of ${formatNumber(goal)}`}
          </p>
        </div>
      ) : null}

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        {[
          ["Protein", protein],
          ["Carbs", carbs],
          ["Fat", fat],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="text-xl font-semibold">
              {formatNumber(value)}
              <span className="ml-0.5 text-sm font-normal text-ink-muted">g</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-5">
        <GoalForm goal={goal} />
      </div>
    </section>
  );
}
