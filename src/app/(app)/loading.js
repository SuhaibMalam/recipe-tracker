export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading…</span>
      <div className="h-9 w-48 rounded-md bg-cream-dark" />
      <div className="mt-3 h-4 w-64 rounded bg-cream-dark" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-[0.875rem] bg-cream-dark" />
        ))}
      </div>
    </div>
  );
}
