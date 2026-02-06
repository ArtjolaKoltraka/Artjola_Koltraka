import { PRICES_URL, AVAILABLE_DEMO } from "./constants.js";
import { debounce, sleep } from "./utils/helpers.js";
import { fmtMoney } from "./utils/format.js";
import { validateSwap } from "./utils/validate.js";

import {
  fetchPrices,
  buildLatestPriceMap,
  getLatestUpdatedAt,
} from "./services/prices.js";
import { setCurrencyIcon } from "./services/icons.js";

import { quote } from "./core/quote.js";
import {
  setLoading,
  setUpdatedAt,
  renderAvailable,
  renderPrices,
  renderQuote,
  clearErrors,
  showFieldError,
  setBusy,
  toast,
} from "./ui/render.js";

const els = {
  statusPill: document.getElementById("statusPill"),
  updatedAt: document.getElementById("updatedAt"),

  fromCurrency: document.getElementById("fromCurrency"),
  toCurrency: document.getElementById("toCurrency"),

  fromIcon: document.getElementById("fromIcon"),
  toIcon: document.getElementById("toIcon"),

  fromAmount: document.getElementById("fromAmount"),
  toAmount: document.getElementById("toAmount"),

  fromPriceLine: document.getElementById("fromPriceLine"),
  toPriceLine: document.getElementById("toPriceLine"),

  rateLine: document.getElementById("rateLine"),
  feeLine: document.getElementById("feeLine"),
  minLine: document.getElementById("minLine"),

  fromErr: document.getElementById("fromErr"),
  toErr: document.getElementById("toErr"),

  flipBtn: document.getElementById("flipBtn"),
  maxBtn: document.getElementById("maxBtn"),

  swapForm: document.getElementById("swapForm"),
  swapBtn: document.getElementById("swapBtn"),
  toast: document.getElementById("toast"),

  fromHint: document.getElementById("fromHint"),
};

const state = {
  pricesByCurrency: new Map(),
  currencies: [],
  available: AVAILABLE_DEMO,
  busy: false,
};

const touched = {
  amount: false,
  fromCurrency: false,
  toCurrency: false,
};

init();

async function init() {
  wire();
  renderAvailable(els, state.available);
  setLoading(els, "Loading prices…");

  try {
    const rows = await fetchPrices(PRICES_URL);
    state.pricesByCurrency = buildLatestPriceMap(rows);
    state.currencies = [...state.pricesByCurrency.keys()].sort((a, b) =>
      a.localeCompare(b),
    );

    fillSelects();
    seedDefaults();

    setUpdatedAt(els, getLatestUpdatedAt(state.pricesByCurrency));
    setLoading(els, "Live prices ready");

    refresh();
  } catch (err) {
    console.error(err);
    setLoading(els, "Couldn’t load prices");
  }
}

function wire() {
  els.fromAmount.addEventListener("blur", () => {
    touched.amount = true;
    refresh();
  });

  els.fromAmount.addEventListener("input", debounce(refresh, 120));

  els.fromCurrency.addEventListener("change", () => {
    touched.fromCurrency = true;
    autoResolveSame("from");
    refresh();
  });

  els.toCurrency.addEventListener("change", () => {
    touched.toCurrency = true;
    autoResolveSame("to");
    refresh();
  });

  els.flipBtn.addEventListener("click", () => {
    const a = els.fromCurrency.value;
    const b = els.toCurrency.value;
    els.fromCurrency.value = b;
    els.toCurrency.value = a;
    touched.fromCurrency = true;
    touched.toCurrency = true;
    refresh();
  });

  els.maxBtn.addEventListener("click", () => {
    els.fromAmount.value = String(state.available);
    touched.amount = true;
    refresh();
  });

  els.swapForm.addEventListener("submit", onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();
  if (state.busy) return;

  touched.amount = true;
  touched.fromCurrency = true;
  touched.toCurrency = true;

  clearErrors(els);

  const snap = getSnapshot();
  const result = validateSwap(snap);

  if (!result.ok) {
    showFieldError(els, result.field, result.message);
    els.swapBtn.disabled = true;
    return;
  }

  state.busy = true;
  setBusy(els, true);
  els.swapBtn.disabled = true;

  try {
    await sleep(900);

    toast(
      els,
      `Order placed : ${fmtMoney.format(snap.amount)} ${snap.fromCurrency} → ${els.toAmount.value} ${snap.toCurrency}`,
    );

    els.fromAmount.value = "";
    touched.amount = false;
    refresh();
  } finally {
    state.busy = false;
    setBusy(els, false);
  }
}

function refresh() {
  clearErrors(els);

  const snap = getSnapshot();

  setCurrencyIcon(els.fromIcon, snap.fromCurrency);
  setCurrencyIcon(els.toIcon, snap.toCurrency);

  renderPrices(
    els,
    snap.fromCurrency,
    snap.toCurrency,
    snap.fromUsd,
    snap.toUsd,
  );

  const q = quote(snap.amount, snap.fromUsd, snap.toUsd);
  renderQuote(els, snap.fromCurrency, snap.toCurrency, q);

  const result = validateSwap(snap);

  if (!state.busy) {
    els.swapBtn.disabled = !result.ok;
    els.swapBtn.querySelector(".btnText").textContent = "Swap";
  }

  if (!result.ok) {
    if (result.field === "amount" && touched.amount) {
      showFieldError(els, "amount", result.message);
    }

    if (result.field === "fromCurrency" && touched.fromCurrency) {
      showFieldError(els, "fromCurrency", result.message);
    }

    if (result.field === "toCurrency" && touched.toCurrency) {
      showFieldError(els, "toCurrency", result.message);
    }
  }
}

function getSnapshot() {
  const fromCurrency = els.fromCurrency.value;
  const toCurrency = els.toCurrency.value;

  const fromUsd = state.pricesByCurrency.get(fromCurrency)?.price ?? 0;
  const toUsd = state.pricesByCurrency.get(toCurrency)?.price ?? 0;

  return {
    fromCurrency,
    toCurrency,
    amount: els.fromAmount.valueAsNumber,
    available: state.available,
    fromUsd,
    toUsd,
  };
}

function fillSelects() {
  const options = state.currencies.map((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    return o;
  });

  els.fromCurrency.replaceChildren(...options.map((n) => n.cloneNode(true)));
  els.toCurrency.replaceChildren(...options.map((n) => n.cloneNode(true)));
}

function seedDefaults() {
  const prefer = ["ETH", "USDC", "USD", "BTC", "WBTC", "BUSD"];
  const pick = (arr) => arr.find((t) => state.pricesByCurrency.has(t));

  const from = pick(prefer) || state.currencies[0];
  const to =
    pick(["USDC", "USD", "BUSD"]) || state.currencies[1] || state.currencies[0];

  els.fromCurrency.value = from;
  els.toCurrency.value =
    to === from ? state.currencies.find((x) => x !== from) : to;
}

function autoResolveSame(changed) {
  if (els.fromCurrency.value !== els.toCurrency.value) return;

  const locked =
    changed === "from" ? els.fromCurrency.value : els.toCurrency.value;
  const candidate = state.currencies.find((c) => c !== locked);

  if (!candidate) return;

  if (changed === "from") els.toCurrency.value = candidate;
  else els.fromCurrency.value = candidate;
}
