export const inputClasses =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/25 aria-[invalid=true]:border-terracotta-deep";

export default function Field({
  label,
  name,
  id = name,
  error,
  hint,
  as = "input",
  className = "",
  ...props
}) {
  const Control = as;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <Control
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-terracotta-dark">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
