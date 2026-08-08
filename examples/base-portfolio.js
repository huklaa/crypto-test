import {
  calculateAllocationPercentage,
  calculatePortfolioTotal,
  calculateProfitLoss,
  calculateRebalanceTrade,
  formatCurrency,
  normalizeSymbol,
  validateHolding
} from "../src/index.js";

// Illustrative snapshot only: no wallet, RPC, or transaction is involved.
const positions = [
  { symbol: "eth", amount: 1.35, price: 3_420, averageCost: 2_950, targetAllocation: 55 },
  { symbol: "usdc", amount: 2_750, price: 1, averageCost: 1, targetAllocation: 25 },
  { symbol: "aero", amount: 1_800, price: 1.12, averageCost: 0.84, targetAllocation: 20 }
].map((position) => ({ ...position, ...validateHolding(position), symbol: normalizeSymbol(position.symbol) }));

const portfolioTotal = calculatePortfolioTotal(positions);

console.log("Base ecosystem portfolio snapshot");
console.log(`Total: ${formatCurrency(portfolioTotal)}`);

for (const position of positions) {
  const currentValue = position.amount * position.price;
  const costBasis = position.amount * position.averageCost;
  const allocation = calculateAllocationPercentage(currentValue, portfolioTotal);
  const profitLoss = calculateProfitLoss(costBasis, currentValue);
  const rebalance = calculateRebalanceTrade(currentValue, position.targetAllocation, portfolioTotal);

  console.log(`\n${position.symbol}`);
  console.log(`  Value: ${formatCurrency(currentValue)}`);
  console.log(`  Allocation: ${allocation.toFixed(2)}% (target ${position.targetAllocation}%)`);
  console.log(`  P/L: ${formatCurrency(profitLoss.amount)} (${profitLoss.percentage.toFixed(2)}%)`);
  console.log(`  Rebalance: ${rebalance >= 0 ? "buy" : "sell"} ${formatCurrency(Math.abs(rebalance))}`);
}
