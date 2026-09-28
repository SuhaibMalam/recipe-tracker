const tones = {
  error: "border-terracotta-deep/25 bg-terracotta/10 text-terracotta-dark",
  success: "border-sage-deep/25 bg-sage/20 text-sage-deep",
};

export default function Alert({ tone = "error", children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-3 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
