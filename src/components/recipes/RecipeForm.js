"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RECIPE_UNITS, recipeSchema } from "@/lib/validations/recipe";
import { toFieldErrors } from "@/lib/validations/errors";
import { describeFailure, sendJson } from "@/lib/send-json";
import Button, { buttonClasses } from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";

const newRow = () => ({ key: crypto.randomUUID(), name: "", quantity: "", unit: "g" });
// Blank rows are UI scaffolding, not ingredients, and are never sent.
const isFilled = (row) => Boolean(row.name.trim() || row.quantity.trim());
const str = (v) => (v === null || v === undefined ? "" : String(v));

function initialState(recipe) {
  if (!recipe) {
    return {
      fields: {
        title: "",
        description: "",
        servings: "2",
        steps: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      },
      rows: [newRow(), newRow()],
    };
  }
  return {
    fields: {
      title: recipe.title,
      description: str(recipe.description),
      servings: str(recipe.servings),
      steps: recipe.steps,
      calories: str(recipe.calories),
      protein: str(recipe.protein),
      carbs: str(recipe.carbs),
      fat: str(recipe.fat),
    },
    rows: recipe.recipeIngredients.map((ri) => ({
      key: ri.id,
      name: ri.ingredient.name,
      quantity: str(ri.quantity),
      unit: ri.unit,
    })),
  };
}

function Section({ title, description, children }) {
  return (
    <section className="grid gap-6 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr]">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export default function RecipeForm({ recipe }) {
  const router = useRouter();
  const [{ fields, rows }, setState] = useState(() => initialState(recipe));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [focusKey, setFocusKey] = useState(null);

  const setField = (e) =>
    setState((s) => ({ ...s, fields: { ...s.fields, [e.target.name]: e.target.value } }));

  const setRow = (key, patch) =>
    setState((s) => ({ ...s, rows: s.rows.map((r) => (r.key === key ? { ...r, ...patch } : r)) }));

  function addRow() {
    const row = newRow();
    setFocusKey(row.key);
    setState((s) => ({ ...s, rows: [...s.rows, row] }));
  }

  const removeRow = (key) => setState((s) => ({ ...s, rows: s.rows.filter((r) => r.key !== key) }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const ingredients = rows
      .filter(isFilled)
      .map(({ name, quantity, unit }) => ({ name, quantity, unit }));
    const payload = { ...fields, ingredients };

    const form = e.currentTarget;
    // After React paints the error state, move keyboard/screen-reader focus to the first problem.
    const focusFirstError = () =>
      requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus());

    const parsed = recipeSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setFormError("A few things need fixing before this can be saved.");
      focusFirstError();
      return;
    }

    setErrors({});
    setSaving(true);
    const res = await sendJson(
      recipe ? `/api/recipes/${recipe.id}` : "/api/recipes",
      recipe ? "PUT" : "POST",
      payload,
    );

    if (res.ok) {
      router.push(`/recipes/${res.body.recipe.id}`);
      router.refresh();
      return;
    }

    setSaving(false);
    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setErrors(res.body?.fieldErrors ?? {});
    focusFirstError();
    setFormError(res.status === 404 ? "This recipe no longer exists." : describeFailure(res));
  }

  // Error keys like "ingredients.2.name" index the filtered list that was sent, not `rows`.
  const sentIndex = new Map(rows.filter(isFilled).map((r, i) => [r.key, i]));

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
      {formError && (
        <div className="mb-8">
          <Alert>{formError}</Alert>
        </div>
      )}

      <Section title="The basics" description="What it is and how many it feeds.">
        <Field
          label="Recipe name"
          name="title"
          value={fields.title}
          onChange={setField}
          error={errors.title}
          placeholder="Tuesday lentil soup"
        />
        <Field
          as="textarea"
          label="Description"
          name="description"
          rows={3}
          value={fields.description}
          onChange={setField}
          error={errors.description}
          hint="Optional. A line or two about when you make it."
        />
        <Field
          label="Servings"
          name="servings"
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          className="max-w-32"
          value={fields.servings}
          onChange={setField}
          error={errors.servings}
        />
      </Section>

      <Section title="Ingredients" description="Blank rows are skipped.">
        {errors.ingredients && <p className="text-sm text-terracotta-dark">{errors.ingredients}</p>}
        <ul className="flex flex-col gap-3">
          {rows.map((row, i) => {
            const err = (f) =>
              sentIndex.has(row.key)
                ? errors[`ingredients.${sentIndex.get(row.key)}.${f}`]
                : undefined;
            const rowErrors = [err("quantity"), err("unit"), err("name")].filter(Boolean);
            const errorId = `ingredient-${row.key}-error`;
            // Points an input that has a problem at the row's error message, for screen readers.
            const describedBy = (f) => (err(f) ? errorId : undefined);
            const n = i + 1;

            return (
              <li key={row.key}>
                {/* Phones: amount + unit on one line, name full-width below. */}
                <div className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 sm:grid-cols-[5.5rem_6rem_1fr_auto]">
                  <input
                    aria-label={`Amount for ingredient ${n}`}
                    inputMode="decimal"
                    placeholder="200"
                    className={inputClasses}
                    aria-invalid={err("quantity") ? true : undefined}
                    aria-describedby={describedBy("quantity")}
                    value={row.quantity}
                    onChange={(e) => setRow(row.key, { quantity: e.target.value })}
                  />
                  <select
                    aria-label={`Unit for ingredient ${n}`}
                    className={inputClasses}
                    aria-invalid={err("unit") ? true : undefined}
                    aria-describedby={describedBy("unit")}
                    value={row.unit}
                    onChange={(e) => setRow(row.key, { unit: e.target.value })}
                  >
                    {RECIPE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Ingredient ${n}`}
                    placeholder="red lentils"
                    className={`${inputClasses} col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto`}
                    aria-invalid={err("name") ? true : undefined}
                    aria-describedby={describedBy("name")}
                    autoFocus={row.key === focusKey}
                    value={row.name}
                    onChange={(e) => setRow(row.key, { name: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                    aria-label={`Remove ingredient ${n}`}
                    className="col-start-3 row-start-1 grid size-10 place-items-center rounded-lg sm:col-start-auto sm:row-start-auto text-ink-muted transition-colors hover:bg-cream-dark hover:text-terracotta-dark disabled:invisible"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  </button>
                </div>
                {rowErrors.length > 0 && (
                  <p id={errorId} className="mt-1 text-sm text-terracotta-dark">
                    {rowErrors.join(" · ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div>
          <Button variant="secondary" onClick={addRow} disabled={rows.length >= 50}>
            + Add ingredient
          </Button>
        </div>
      </Section>

      <Section title="Method" description="One step per line — they'll be numbered for you.">
        <Field
          as="textarea"
          label="Steps"
          name="steps"
          rows={8}
          value={fields.steps}
          onChange={setField}
          error={errors.steps}
          placeholder={
            "Soften the onion in olive oil.\nAdd lentils, cumin and stock.\nSimmer 20 minutes, then blend half."
          }
        />
      </Section>

      <Section
        title="Nutrition"
        description="Per serving, all optional. Fill these in to track what you eat."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["calories", "Calories", "kcal"],
            ["protein", "Protein", "g"],
            ["carbs", "Carbs", "g"],
            ["fat", "Fat", "g"],
          ].map(([name, label, unit]) => (
            <Field
              key={name}
              label={`${label} (${unit})`}
              name={name}
              inputMode="decimal"
              value={fields[name]}
              onChange={setField}
              error={errors[name]}
            />
          ))}
        </div>
      </Section>

      <div className="flex justify-end gap-3 border-t border-line pt-6">
        <Link
          href={recipe ? `/recipes/${recipe.id}` : "/recipes"}
          className={buttonClasses("ghost")}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : recipe ? "Save changes" : "Save recipe"}
        </Button>
      </div>
    </form>
  );
}
