import {
  calculateAllocationPercentage,
  calculatePortfolioTotal,
  calculateProfitLoss,
  calculateRebalanceTrade,
  validateHolding
} from "../../src/index.js";

export function analyzePortfolio(holdings) {
  const priced = holdings.map((holding) => {
    const price = Number(holding.price) || 0;
    const normalized = validateHolding({ ...holding, price });
    return { ...holding, ...normalized, value: normalized.amount * price };
  });
  const total = calculatePortfolioTotal(priced);

  return {
    total,
    holdings: priced.map((holding) => {
      const allocation = total > 0 ? calculateAllocationPercentage(holding.value, total) : 0;
      const target = Number(holding.targetAllocation);
      const costBasis = Number(holding.costBasis);
      return {
        ...holding,
        allocation,
        profitLoss: Number.isFinite(costBasis) && costBasis >= 0
          ? calculateProfitLoss(costBasis, holding.value)
          : null,
        rebalance: Number.isFinite(target) && target >= 0 && target <= 100 && total > 0
          ? calculateRebalanceTrade(holding.value, target, total)
          : null
      };
    })
  };
}
