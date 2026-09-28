"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import { describeFailure, sendJson } from "@/lib/send-json";
import { formatDay } from "@/lib/day";
import { formatNumber, plural } from "@/lib/format";

export default function LogRecipeForm({ recipeId, today }) {
  const router = useRouter();
  const [servings, setServings] = useState("1");
  const [day, setDay] = useState(today);
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ tone: "pending", message: "" });
    const res = await sendJson("/api/logs", "POST", { source: "recipe", recipeId, servings, day });

    if (res.ok) {
      const { log } = res.body;
      setStatus({
        tone: "done",
        message: `Logged ${plural(log.servings, "serving")} · ${formatNumber(log.calories)} kcal for ${formatDay(day, today).toLowerCase()}.`,
      });
      router.refresh();
      return;
    }
    const fieldMessage = res.body?.fieldErrors && Object.values(res.body.fieldErrors)[0];
    setStatus({ tone: "error", message: fieldMessage ?? describeFailure(res) });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <h2 className="text-lg font-semibold">Ate this?</h2>
      <p className="mt-1 text-sm text-ink-muted">Add it to your food log.</p>

      <div className="mt-4 grid grid-cols-[6rem_1fr] gap-3">
        <div>
          <label htmlFor="log-servings" className="mb-1.5 block text-sm font-medium">
            Servings
          </label>
          <input
            id="log-servings"
            type="number"
            inputMode="decimal"
            min="0.25"
            max="20"
            step="0.25"
            required
            className={inputClasses}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="log-day" className="mb-1.5 block text-sm font-medium">
            Day
          </label>
          <input
            id="log-day"
            type="date"
            max={today}
            required
            className={inputClasses}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="mt-4 w-full" disabled={status.tone === "pending"}>
        {status.tone === "pending" ? "Logging…" : "Log it"}
      </Button>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm">
        {status.tone === "done" && (
          <span className="text-sage-deep">
            {status.message}{" "}
            <Link href="/log" className="font-medium underline underline-offset-2">
              View log
            </Link>
          </span>
        )}
        {status.tone === "error" && <span className="text-terracotta-dark">{status.message}</span>}
      </p>
    </form>
  );
}
