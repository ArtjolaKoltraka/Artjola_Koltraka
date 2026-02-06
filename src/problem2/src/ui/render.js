import { fmt, fmtMoney, fmtUsd } from "../utils/format.js";

export function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export function setLoading(els, text) {
  els.statusPill.textContent = text;
}

export function setUpdatedAt(els, date) {
  els.updatedAt.textContent = date ? `Updated: ${date.toLocaleString()}` : "";
}

export function renderAvailable(els, available) {
  els.fromHint.textContent = `Available: ${fmtMoney.format(available)} (demo)`;
}

export function renderPrices(els, fromSym, toSym, fromUsd, toUsd) {
  els.fromPriceLine.textContent = fromUsd
    ? `1 ${fromSym} = ${fmtUsd(fromUsd)}`
    : "—";
  els.toPriceLine.textContent = toUsd ? `1 ${toSym} = ${fmtUsd(toUsd)}` : "—";
}

export function renderQuote(els, fromSym, toSym, q) {
  els.toAmount.value = q.output ? String(q.output) : "";

  els.rateLine.textContent = q.rate
    ? `1 ${fromSym} ≈ ${fmt.format(q.rate)} ${toSym}`
    : "—";
  els.feeLine.textContent = q.output ? `${fmt.format(q.fee)} ${toSym}` : "—";
  els.minLine.textContent = q.output ? `${fmt.format(q.min)} ${toSym}` : "—";
}

export function clearErrors(els) {
  els.fromErr.textContent = "";
  els.toErr.textContent = "";
  els.fromAmount.classList.remove("isInvalid");
  els.fromCurrency.classList.remove("isInvalid");
  els.toCurrency.classList.remove("isInvalid");
}

export function showFieldError(els, field, message) {
  if (field === "amount") {
    els.fromAmount.classList.add("isInvalid");
    els.fromErr.textContent = message;
    return;
  }

  if (field === "fromCurrency") {
    els.fromCurrency.classList.add("isInvalid");
    els.fromErr.textContent = message;
    return;
  }

  if (field === "toCurrency") {
    els.toCurrency.classList.add("isInvalid");
    els.toErr.textContent = message;
    return;
  }

  els.fromErr.textContent = message;
}

export function setBusy(els, on) {
  els.swapBtn.classList.toggle("isLoading", on);
  els.swapBtn.querySelector(".btnText").textContent = on
    ? "Placing order…"
    : "Swap";
}

export function toast(els, msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 2400);
}
