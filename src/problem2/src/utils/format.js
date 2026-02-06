export const fmt = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 8,
});

export const fmtMoney = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtUsd(n) {
  if (!Number.isFinite(n)) return "—";
  return `$${fmt.format(n)}`;
}
