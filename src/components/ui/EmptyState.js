export default function EmptyState({ title, children, action }) {
  return (
    <section className="card flex flex-col items-center px-6 py-14 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
