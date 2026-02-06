import { ICON_BASE } from "../constants.js";
import { escapeXml } from "../ui/render.js";

export function setCurrencyIcon(imgEl, symbol) {
  imgEl.alt = `${symbol} icon`;
  imgEl.src = `${ICON_BASE}${encodeURIComponent(symbol)}.svg`;

  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = makeBadge(symbol);
  };
}

function makeBadge(symbol) {
  const text = String(symbol).slice(0, 4);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2fe08a" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#2aa7ff" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#g)"/>
    <rect x="6" y="6" width="52" height="52" rx="14"
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.20)"/>
    <text x="32" y="38" text-anchor="middle"
      font-family="ui-monospace, Menlo, Monaco, Consolas"
      font-size="16" fill="rgba(255,255,255,0.92)">${escapeXml(text)}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
