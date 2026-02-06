export async function fetchPrices(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function buildLatestPriceMap(rows) {
  const map = new Map();

  for (const r of rows) {
    if (!r || !r.currency || typeof r.price !== "number" || !r.date) continue;

    const symbol = String(r.currency).trim();
    const date = new Date(r.date);
    if (Number.isNaN(date.getTime())) continue;

    const prev = map.get(symbol);
    if (!prev || date > prev.date) {
      map.set(symbol, { price: r.price, date });
    }
  }

  return map;
}

export function getLatestUpdatedAt(priceMap) {
  let latest = null;
  for (const v of priceMap.values()) {
    if (!latest || v.date > latest) latest = v.date;
  }
  return latest;
}
