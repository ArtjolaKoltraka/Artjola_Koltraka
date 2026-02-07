# Problem 3: Messy React — Issues

1. Type mismatch: `WalletBalance` doesn’t include `blockchain`, but code uses `balance.blockchain`.
2. `getPriority(blockchain: any)` uses `any` → kills type safety.
3. Filter logic is inverted: keeps `amount <= 0` instead of positive balances.
4. Bug: `lhsPriority` referenced but never defined (should be `balancePriority`).
5. Sort comparator doesn’t return `0` for equal priorities → unstable ordering.
6. `useMemo` depends on `prices` but doesn’t use it → unnecessary recomputation.
7. `formattedBalances` computed but never used → dead work.
8. `rows` maps `sortedBalances` but types items as `FormattedWalletBalance` → incorrect typing.
9. Uses array index as key while sorting → causes remounts and UI bugs.
10. `prices[balance.currency]` can be undefined → `usdValue` becomes `NaN`.
11. `children` destructured but not rendered.
12. Priority lookup recalculated multiple times per item.

## Refactored code

```tsx
import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface Props extends BoxProps {}

const PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

function getPriority(blockchain: string): number {
  return PRIORITY[blockchain] ?? -99;
}

export const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;

  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .map((b) => ({ ...b, priority: getPriority(b.blockchain) }))
      .filter((b) => b.priority > -99 && b.amount > 0)
      .sort((a, b) => b.priority - a.priority);
  }, [balances]);

  const rows = useMemo(() => {
    return sortedBalances.map((b) => {
      const price = prices[b.currency] ?? 0;
      const usdValue = price * b.amount;

      return (
        <WalletRow
          key={`${b.blockchain}:${b.currency}`}
          amount={b.amount}
          usdValue={usdValue}
          formattedAmount={b.amount.toFixed(2)}
        />
      );
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {children}
      {rows}
    </div>
  );
};
```
