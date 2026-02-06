export function validateSwap({
  fromCurrency,
  toCurrency,
  amount,
  available,
  fromUsd,
  toUsd,
}) {
  if (!fromCurrency || !toCurrency) {
    return {
      ok: false,
      field: "form",
      message: "Please choose both currencies.",
    };
  }

  if (!Number.isFinite(amount)) {
    return {
      ok: false,
      field: "amount",
      message: "Enter how much you want to send.",
    };
  }

  if (!(amount > 0)) {
    return {
      ok: false,
      field: "amount",
      message: "Please enter a value greater than 0.",
    };
  }

  if (fromCurrency === toCurrency) {
    return {
      ok: false,
      field: "toCurrency",
      message: "Choose a different currency to receive.",
    };
  }

  if (amount > available) {
    return {
      ok: false,
      field: "amount",
      message: "That’s more than your available amount.",
    };
  }

  if (!(fromUsd > 0)) {
    return {
      ok: false,
      field: "fromCurrency",
      message: "Price unavailable for the currency you’re sending.",
    };
  }

  if (!(toUsd > 0)) {
    return {
      ok: false,
      field: "toCurrency",
      message: "Price unavailable for the currency you want to receive.",
    };
  }

  return { ok: true };
}
