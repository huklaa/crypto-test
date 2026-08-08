import { assertNonNegativeNumber } from "./validation.js";

export function calculateHoldingValue(amount, price) {
  return assertNonNegativeNumber(amount, "amount") * assertNonNegativeNumber(price, "price");
}

export function calculatePortfolioTotal(holdings) {
  if (!Array.isArray(holdings)) throw new TypeError("Holdings must be an array");
  return holdings.reduce((total, holding) => total + calculateHoldingValue(holding.amount, holding.price), 0);
}

export function calculateProfitLoss(costBasis, currentValue) {
  if (![costBasis, currentValue].every(Number.isFinite) || costBasis < 0 || currentValue < 0) {
    throw new RangeError("Values must be non-negative and finite");
  }
  return {
    amount: currentValue - costBasis,
    percentage: costBasis === 0 ? 0 : ((currentValue - costBasis) / costBasis) * 100
  };
}

export function calculateDcaInvestment(amountPerPeriod, periods, assetPrice) {
  if (amountPerPeriod <= 0 || !Number.isInteger(periods) || periods <= 0 || assetPrice <= 0) {
    throw new RangeError("DCA inputs must be positive");
  }
  const invested = amountPerPeriod * periods;
  return { invested, units: invested / assetPrice };
}

export function calculateWeightedAveragePrice(purchases) {
  const totals = purchases.reduce((result, purchase) => ({
    cost: result.cost + purchase.price * purchase.amount,
    amount: result.amount + purchase.amount
  }), { cost: 0, amount: 0 });
  return totals.amount === 0 ? 0 : totals.cost / totals.amount;
}

export function calculateAllocationPercentage(holdingValue, portfolioValue) {
  if (holdingValue < 0 || portfolioValue <= 0) throw new RangeError("Portfolio values are invalid");
  return (holdingValue / portfolioValue) * 100;
}

export function calculateRebalanceTrade(currentValue, targetPercentage, portfolioValue) {
  if (portfolioValue <= 0 || targetPercentage < 0 || targetPercentage > 100) {
    throw new RangeError("Rebalance inputs are invalid");
  }
  return (portfolioValue * targetPercentage) / 100 - currentValue;
}

export function calculateDrawdown(peakValue, currentValue) {
  if (peakValue <= 0 || currentValue < 0) throw new RangeError("Invalid portfolio values");
  return ((currentValue - peakValue) / peakValue) * 100;
}
