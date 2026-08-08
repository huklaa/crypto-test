import { ensureNonEmptyArray } from "./validation.js";

/**
 * Calculates the percentage change between two prices.
 * @param {number} previous - The original price. Must be non-zero.
 * @param {number} current - The current price.
 * @returns {number} The signed percentage change.
 * @throws {RangeError} If either price is not finite or `previous` is zero.
 */
export function calculatePercentChange(previous, current) {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || previous === 0) {
    throw new RangeError("Prices must be finite and previous price cannot be zero");
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculates market capitalization from price and circulating supply.
 * @param {number} price - Current unit price.
 * @param {number} circulatingSupply - Number of circulating units.
 * @returns {number} The market capitalization.
 * @throws {RangeError} If an input is negative or not finite.
 */
export function calculateMarketCap(price, circulatingSupply) {
  if (![price, circulatingSupply].every(Number.isFinite) || price < 0 || circulatingSupply < 0) {
    throw new RangeError("Price and supply must be non-negative finite numbers");
  }
  return price * circulatingSupply;
}

export function calculateFullyDilutedValuation(price, maxSupply) {
  if (![price, maxSupply].every(Number.isFinite) || price < 0 || maxSupply < 0) {
    throw new RangeError("Price and max supply must be non-negative finite numbers");
  }
  return price * maxSupply;
}

export function arithmeticMean(values) {
  ensureNonEmptyArray(values, "values");
  if (!values.every(Number.isFinite)) throw new TypeError("All values must be finite");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values) {
  ensureNonEmptyArray(values, "values");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Calculates population standard deviation for a series of returns.
 * @param {number[]} returns - Finite periodic returns, expressed consistently.
 * @returns {number} Population volatility in the input's units.
 */
export function calculateVolatility(returns) {
  ensureNonEmptyArray(returns, "returns");
  const mean = arithmeticMean(returns);
  return Math.sqrt(arithmeticMean(returns.map((value) => (value - mean) ** 2)));
}

export function calculateSimpleMovingAverage(values, period) {
  if (!Number.isInteger(period) || period <= 0 || period > values.length) {
    throw new RangeError("Invalid moving average period");
  }
  return values.slice(-period).reduce((sum, value) => sum + value, 0) / period;
}

export function calculateExponentialMovingAverage(values, period) {
  if (!Number.isInteger(period) || period <= 0 || values.length < period) {
    throw new RangeError("Invalid EMA period");
  }
  const multiplier = 2 / (period + 1);
  return values.slice(1).reduce((ema, value) => (value - ema) * multiplier + ema, values[0]);
}

export function searchCoins(coins, query) {
  const needle = String(query).trim().toLowerCase();
  return coins.filter((coin) => coin.symbol.toLowerCase().includes(needle) || coin.name.toLowerCase().includes(needle));
}

export function sortCoinsByMarketCap(coins, direction = "desc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...coins].sort((a, b) => (a.marketCap - b.marketCap) * multiplier);
}

export function getTopGainers(coins, limit = 5) {
  return [...coins].filter((coin) => Number.isFinite(coin.change24h)).sort((a, b) => b.change24h - a.change24h).slice(0, limit);
}

export function calculateTotalMarketCap(coins) {
  return coins.reduce((total, coin) => total + (Number.isFinite(coin.marketCap) ? coin.marketCap : 0), 0);
}
