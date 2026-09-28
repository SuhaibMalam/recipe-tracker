const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-terracotta-deep text-cream hover:bg-terracotta-dark",
  secondary: "border border-line bg-paper text-ink hover:border-ink-muted/40 hover:bg-cream-dark",
  ghost: "text-ink-muted hover:bg-cream-dark hover:text-ink",
  danger:
    "border border-terracotta-deep/30 text-terracotta-dark hover:bg-terracotta-deep hover:text-cream",
};

// Exported separately so a <Link> can look like a button without nesting <a><button>.
export function buttonClasses(variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export default function Button({ variant = "primary", className = "", type = "button", ...props }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
