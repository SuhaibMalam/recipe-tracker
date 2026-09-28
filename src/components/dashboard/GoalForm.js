"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import { describeFailure, sendJson } from "@/lib/send-json";
import { formatNumber } from "@/lib/format";

export default function GoalForm({ goal }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goal ? String(goal) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(calorieGoal) {
    setSaving(true);
    setError("");
    const res = await sendJson("/api/me", "PATCH", { calorieGoal });
    setSaving(false);
    if (!res.ok) {
      setError(res.body?.fieldErrors?.calorieGoal ?? describeFailure(res));
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <p className="text-sm text-ink-muted">
        {goal ? <>Daily goal {formatNumber(goal)} kcal · </> : "No daily goal yet · "}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta-deep"
        >
          {goal ? "Change" : "Set one"}
        </button>
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(value);
      }}
      className="flex flex-wrap items-start gap-2"
    >
      <div>
        <label htmlFor="calorie-goal" className="sr-only">
          Daily calorie goal
        </label>
        <input
          id="calorie-goal"
          inputMode="numeric"
          autoFocus
          placeholder="2000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "calorie-goal-error" : undefined}
          className={`${inputClasses} w-28`}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
      {goal && (
        <Button variant="ghost" onClick={() => save(null)} disabled={saving}>
          Remove goal
        </Button>
      )}
      <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
        Cancel
      </Button>
      {error && (
        <p id="calorie-goal-error" className="w-full text-sm text-terracotta-dark">
          {error}
        </p>
      )}
    </form>
  );
}
