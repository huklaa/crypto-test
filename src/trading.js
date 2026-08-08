export function calculateTradeFee(amount, feeRatePercent) {
  if (![amount, feeRatePercent].every(Number.isFinite) || amount < 0 || feeRatePercent < 0) {
    throw new RangeError("Trade amount and fee rate cannot be negative");
  }
  return amount * (feeRatePercent / 100);
}

export function calculateSlippage(expectedPrice, executedPrice) {
  if (![expectedPrice, executedPrice].every(Number.isFinite) || expectedPrice === 0) {
    throw new RangeError("Prices must be finite and expected price cannot be zero");
  }
  return ((executedPrice - expectedPrice) / expectedPrice) * 100;
}

export function applySlippage(price, slippagePercent, side = "buy") {
  if (price <= 0 || slippagePercent < 0 || !["buy", "sell"].includes(side)) {
    throw new RangeError("Slippage inputs are invalid");
  }
  return price * (1 + (side === "buy" ? 1 : -1) * slippagePercent / 100);
}

export function calculatePositionSize(accountValue, riskPercent, entryPrice, stopPrice) {
  const riskPerUnit = Math.abs(entryPrice - stopPrice);
  if (accountValue <= 0 || riskPercent <= 0 || riskPerUnit === 0) {
    throw new RangeError("Position inputs are invalid");
  }
  return ((accountValue * riskPercent) / 100) / riskPerUnit;
}

export function calculateStopLoss(entryPrice, lossPercent) {
  if (entryPrice <= 0 || lossPercent < 0 || lossPercent >= 100) throw new RangeError("Stop loss inputs are invalid");
  return entryPrice * (1 - lossPercent / 100);
}

export function calculateTakeProfit(entryPrice, gainPercent) {
  if (entryPrice <= 0 || gainPercent < 0) throw new RangeError("Take profit inputs are invalid");
  return entryPrice * (1 + gainPercent / 100);
}

export function calculateRiskReward(entryPrice, stopPrice, targetPrice) {
  const risk = Math.abs(entryPrice - stopPrice);
  if (risk === 0) throw new RangeError("Risk cannot be zero");
  return Math.abs(targetPrice - entryPrice) / risk;
}

export function calculateOrderBookSpread(bestBid, bestAsk) {
  if (bestBid <= 0 || bestAsk <= 0 || bestAsk < bestBid) throw new RangeError("Order book prices are invalid");
  return bestAsk - bestBid;
}

export function calculateMidMarketPrice(bestBid, bestAsk) {
  calculateOrderBookSpread(bestBid, bestAsk);
  return (bestBid + bestAsk) / 2;
}
