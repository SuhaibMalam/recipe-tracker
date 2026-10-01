"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";
import { manualLogSchema } from "@/lib/validations/log";
import { toFieldErrors } from "@/lib/validations/errors";
import { describeFailure, sendJson } from "@/lib/send-json";
import { formatDay } from "@/lib/day";
import { formatNumber } from "@/lib/format";

const empty = { name: "", calories: "", protein: "", carbs: "", fat: "" };

export default function ManualLogForm({ today }) {
  const router = useRouter();
  const [fields, setFields] = useState({ ...empty, day: today });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState("");

  const setField = (e) => setFields((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setAdded("");
    const payload = { source: "manual", ...fields };

    const parsed = manualLogSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSaving(true);
    const res = await sendJson("/api/logs", "POST", payload);
    setSaving(false);

    if (res.ok) {
      const { log } = res.body;
      setAdded(
        `Added ${log.name} · ${formatNumber(log.calories)} kcal for ${formatDay(fields.day, today).toLowerCase()}.`,
      );
      setFields((f) => ({ ...empty, day: f.day }));
      router.refresh();
      return;
    }
    setErrors(res.body?.fieldErrors ?? {});
    setFormError(describeFailure(res));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">Add something else</h2>
        <p className="mt-1 text-sm text-ink-muted">
          A snack, a meal out — anything not in your recipes.
        </p>
      </div>
      {formError && <Alert>{formError}</Alert>}

      <Field
        label="What was it?"
        name="name"
        value={fields.name}
        onChange={setField}
        error={errors.name}
        placeholder="Flat white"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Calories"
          name="calories"
          inputMode="numeric"
          value={fields.calories}
          onChange={setField}
          error={errors.calories}
        />
        <Field
          label="Day"
          name="day"
          type="date"
          max={today}
          value={fields.day}
          onChange={setField}
          error={errors.day}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Protein g"
          name="protein"
          inputMode="decimal"
          value={fields.protein}
          onChange={setField}
          error={errors.protein}
        />
        <Field
          label="Carbs g"
          name="carbs"
          inputMode="decimal"
          value={fields.carbs}
          onChange={setField}
          error={errors.carbs}
        />
        <Field
          label="Fat g"
          name="fat"
          inputMode="decimal"
          value={fields.fat}
          onChange={setField}
          error={errors.fat}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add to log"}
      </Button>
      <p aria-live="polite" className="-mt-1 min-h-5 text-sm text-sage-deep">
        {added}
      </p>
    </form>
  );
}
