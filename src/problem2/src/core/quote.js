import { FEE_RATE, SAFETY_BUFFER } from "../constants.js";

export function quote(amount, fromUsd, toUsd) {
  if (!(amount > 0) || !(fromUsd > 0) || !(toUsd > 0)) {
    return { output: 0, fee: 0, min: 0, rate: 0 };
  }

  const output = (amount * fromUsd) / toUsd;
  const fee = output * FEE_RATE;
  const min = output * (1 - SAFETY_BUFFER);
  const rate = fromUsd / toUsd;

  return { output, fee, min, rate };
}
