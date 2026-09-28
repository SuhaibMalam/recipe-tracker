const ruledPaper = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgb(195 111 78 / 0.22) 27px, rgb(195 111 78 / 0.22) 28px)",
};

const sampleMacros = [
  ["412", "kcal"],
  ["24g", "protein"],
  ["58g", "carbs"],
  ["9g", "fat"],
];

// Decorative index card (plus a mustard card peeking out behind it). Purely visual.
export default function RecipeCardIllustration({ className = "" }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-8 bottom-[-2.5rem] translate-x-8 rotate-6 rounded-xl bg-mustard" />
      <div className="relative -rotate-2 rounded-xl bg-paper p-7 text-ink shadow-warm-lg">
        <p className="text-[11px] font-medium tracking-[0.18em] text-terracotta-deep uppercase">
          Recipe card · No. 14
        </p>
        <p className="mt-2 font-serif text-2xl leading-7">Tuesday lentil soup</p>
        <ul className="mt-4 text-sm leading-7 text-ink/80" style={ruledPaper}>
          <li>200 g red lentils</li>
          <li>1 onion, diced</li>
          <li>2 tsp cumin</li>
          <li>1 l vegetable stock</li>
        </ul>
        <dl className="mt-5 grid grid-cols-4 border-t border-line pt-4 text-center">
          {sampleMacros.map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-[11px] tracking-wider text-ink-muted uppercase">{label}</dt>
              <dd className="font-serif text-lg">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
