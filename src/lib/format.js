const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export const formatNumber = (n) => oneDecimal.format(n);

// "3 piece garlic" → "3 garlic"; "2 cup" → "2 cups". Metric abbreviations don't pluralise.
export function formatAmount(quantity, unit) {
  const n = formatNumber(quantity);
  if (unit === "piece") return n;
  if (unit === "cup" && quantity !== 1) return `${n} cups`;
  return `${n} ${unit}`;
}

export const plural = (count, one, many = `${one}s`) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`;
