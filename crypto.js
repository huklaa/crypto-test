const supportedCoins = ["BTC", "ETH", "SOL"];

console.log("Desteklenen coinler:", supportedCoins);const today = new Date();

console.log("Tarih:", today.toLocaleDateString("tr-TR"));console.log("Hello Web3");
// Otomatik crypto commit 1 (Fri Oct  3 00:29:07 TST 2025)
// Otomatik crypto commit 2 (Fri Oct  3 00:29:08 TST 2025)
// Otomatik crypto commit 3 (Fri Oct  3 00:29:09 TST 2025)
// Otomatik crypto commit 4 (Fri Oct  3 00:29:09 TST 2025)
// Otomatik crypto commit 5 (Fri Oct  3 00:29:10 TST 2025)
// Otomatik crypto commit 6 (Fri Oct  3 00:29:10 TST 2025)
// Otomatik crypto commit 7 (Fri Oct  3 00:29:11 TST 2025)
// Otomatik crypto commit 8 (Fri Oct  3 00:29:12 TST 2025)
// Otomatik crypto commit 9 (Fri Oct  3 00:29:12 TST 2025)
// Otomatik crypto commit 10 (Fri Oct  3 00:29:13 TST 2025)
console.log("Mobil commit testi");
function showMessage(message) {
  console.log(message);
}

showMessage("İkinci mobil commit çalıştı");
const cryptoInfo = {
  name: "Bitcoin",
  symbol: "BTC",
  active: true
};

console.log(cryptoInfo);
function getCryptoLabel(crypto) {
  return `${crypto.name} (${crypto.symbol})`;
}

console.log(getCryptoLabel(cryptoInfo));


console.log("Codex bağlantısı aktif");


function normalizeSymbol(symbol) {
  if (typeof symbol !== "string") {
    throw new TypeError("Symbol must be a string");
  }
  return symbol.trim().toUpperCase();
}


function isValidSymbol(symbol) {
  return typeof symbol === "string" && /^[A-Z0-9]{2,10}$/.test(symbol.trim().toUpperCase());
}


function formatCurrency(value, currency = "USD", locale = "en-US") {
  if (!Number.isFinite(value)) throw new TypeError("Value must be finite");
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}


function calculatePercentChange(previous, current) {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || previous === 0) {
    throw new RangeError("Prices must be finite and previous price cannot be zero");
  }
  return ((current - previous) / previous) * 100;
}


function calculateMarketCap(price, circulatingSupply) {
  if (price < 0 || circulatingSupply < 0 || !Number.isFinite(price * circulatingSupply)) {
    throw new RangeError("Price and supply must be non-negative finite numbers");
  }
  return price * circulatingSupply;
}


function calculatePortfolioTotal(holdings) {
  if (!Array.isArray(holdings)) throw new TypeError("Holdings must be an array");
  return holdings.reduce((total, item) => total + item.amount * item.price, 0);
}


function calculateProfitLoss(costBasis, currentValue) {
  if (![costBasis, currentValue].every(Number.isFinite)) throw new TypeError("Values must be finite");
  return { amount: currentValue - costBasis, percentage: costBasis === 0 ? 0 : ((currentValue - costBasis) / costBasis) * 100 };
}


function calculateDcaInvestment(amountPerPeriod, periods, assetPrice) {
  if (amountPerPeriod <= 0 || !Number.isInteger(periods) || periods <= 0 || assetPrice <= 0) throw new RangeError("DCA inputs must be positive");
  return { invested: amountPerPeriod * periods, units: (amountPerPeriod * periods) / assetPrice };
}


function calculateWeightedAveragePrice(purchases) {
  var totals = purchases.reduce((acc, purchase) => ({ cost: acc.cost + purchase.price * purchase.amount, amount: acc.amount + purchase.amount }), { cost: 0, amount: 0 });
  return totals.amount === 0 ? 0 : totals.cost / totals.amount;
}


function calculateHoldingValue(amount, price) {
  if (![amount, price].every(Number.isFinite) || amount < 0 || price < 0) throw new RangeError("Amount and price must be non-negative");
  return amount * price;
}


function searchCoins(coins, query) {
  var needle = String(query).trim().toLowerCase();
  return coins.filter(coin => coin.symbol.toLowerCase().includes(needle) || coin.name.toLowerCase().includes(needle));
}


function filterCoinsByPrice(coins, minimum = 0, maximum = Infinity) {
  return coins.filter(coin => Number.isFinite(coin.price) && coin.price >= minimum && coin.price <= maximum);
}


function filterCoinsByChange(coins, minimumChange) {
  return coins.filter(coin => Number.isFinite(coin.change24h) && coin.change24h >= minimumChange);
}


function sortCoinsByPrice(coins, direction = "desc") {
  var multiplier = direction === "asc" ? 1 : -1;
  return [...coins].sort((a, b) => (a.price - b.price) * multiplier);
}


function sortCoinsByMarketCap(coins, direction = "desc") {
  var multiplier = direction === "asc" ? 1 : -1;
  return [...coins].sort((a, b) => (a.marketCap - b.marketCap) * multiplier);
}


function formatCryptoDate(value, locale = "en-US") {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid date");
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}


function formatCompactNumber(value, locale = "en-US") {
  if (!Number.isFinite(value)) throw new TypeError("Value must be finite");
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(value);
}


function formatCryptoAmount(amount, maximumFractionDigits = 8) {
  if (!Number.isFinite(amount)) throw new TypeError("Amount must be finite");
  return new Intl.NumberFormat("en-US", { maximumFractionDigits, useGrouping: true }).format(amount);
}


function toUnixTimestamp(value) {
  var milliseconds = new Date(value).getTime();
  if (Number.isNaN(milliseconds)) throw new RangeError("Invalid date");
  return Math.floor(milliseconds / 1000);
}


function fromUnixTimestamp(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError("Timestamp must be finite");
  return new Date(seconds * 1000);
}


function assertPositiveNumber(value, fieldName = "value") {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(fieldName + " must be a positive finite number");
  return value;
}


function validateCoin(coin) {
  if (!coin || typeof coin !== "object") throw new TypeError("Coin must be an object");
  var symbol = normalizeSymbol(coin.symbol);
  if (!isValidSymbol(symbol) || typeof coin.name !== "string" || !Number.isFinite(coin.price)) throw new TypeError("Coin data is invalid");
  return { ...coin, symbol, name: coin.name.trim() };
}


function validateHolding(holding) {
  if (!holding || typeof holding !== "object") throw new TypeError("Holding must be an object");
  return { symbol: normalizeSymbol(holding.symbol), amount: assertPositiveNumber(holding.amount, "amount"), price: assertPositiveNumber(holding.price, "price") };
}


function isValidCurrencyCode(code) {
  if (typeof code !== "string" || !/^[A-Z]{3}$/.test(code.toUpperCase())) return false;
  try { new Intl.NumberFormat("en", { style: "currency", currency: code.toUpperCase() }); return true; } catch { return false; }
}


function ensureNonEmptyArray(value, fieldName = "items") {
  if (!Array.isArray(value) || value.length === 0) throw new TypeError(fieldName + " must be a non-empty array");
  return value;
}


function calculateCirculatingRatio(circulatingSupply, maxSupply) {
  if (circulatingSupply < 0 || maxSupply <= 0 || circulatingSupply > maxSupply) throw new RangeError("Supply values are inconsistent");
  return (circulatingSupply / maxSupply) * 100;
}


function calculateFullyDilutedValuation(price, maxSupply) {
  return assertPositiveNumber(price, "price") * assertPositiveNumber(maxSupply, "maxSupply");
}


function calculateTradeFee(amount, feeRatePercent) {
  if (amount < 0 || feeRatePercent < 0) throw new RangeError("Trade amount and fee rate cannot be negative");
  return amount * (feeRatePercent / 100);
}


function calculateNetTradeAmount(amount, feeRatePercent) {
  return amount - calculateTradeFee(amount, feeRatePercent);
}


function calculateBreakEvenPrice(totalCost, assetAmount) {
  if (totalCost < 0 || assetAmount <= 0) throw new RangeError("Cost must be non-negative and amount positive");
  return totalCost / assetAmount;
}


function arithmeticMean(values) {
  ensureNonEmptyArray(values, "values");
  if (!values.every(Number.isFinite)) throw new TypeError("All values must be finite");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}


function median(values) {
  ensureNonEmptyArray(values, "values");
  var sorted = [...values].sort((a, b) => a - b);
  var middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}


function priceRange(prices) {
  ensureNonEmptyArray(prices, "prices");
  return { low: Math.min(...prices), high: Math.max(...prices), spread: Math.max(...prices) - Math.min(...prices) };
}


function calculateVolatility(returns) {
  ensureNonEmptyArray(returns, "returns");
  var mean = arithmeticMean(returns);
  return Math.sqrt(arithmeticMean(returns.map(value => (value - mean) ** 2)));
}


function calculateSimpleMovingAverage(values, period) {
  if (!Number.isInteger(period) || period <= 0 || period > values.length) throw new RangeError("Invalid moving average period");
  return values.slice(-period).reduce((sum, value) => sum + value, 0) / period;
}


function calculateExponentialMovingAverage(values, period) {
  if (!Number.isInteger(period) || period <= 0 || values.length < period) throw new RangeError("Invalid EMA period");
  var multiplier = 2 / (period + 1);
  return values.slice(1).reduce((ema, value) => (value - ema) * multiplier + ema, values[0]);
}


function calculateMomentum(prices, lookback = 1) {
  if (!Number.isInteger(lookback) || lookback <= 0 || prices.length <= lookback) throw new RangeError("Invalid momentum lookback");
  return prices.at(-1) - prices.at(-(lookback + 1));
}


function calculateReturn(startPrice, endPrice) {
  return calculatePercentChange(startPrice, endPrice) / 100;
}


function calculateLogReturn(startPrice, endPrice) {
  if (startPrice <= 0 || endPrice <= 0) throw new RangeError("Prices must be positive");
  return Math.log(endPrice / startPrice);
}


function calculateDrawdown(peakValue, currentValue) {
  if (peakValue <= 0 || currentValue < 0) throw new RangeError("Invalid portfolio values");
  return ((currentValue - peakValue) / peakValue) * 100;
}


function calculateAllocationPercentage(holdingValue, portfolioValue) {
  if (holdingValue < 0 || portfolioValue <= 0) throw new RangeError("Portfolio values are invalid");
  return (holdingValue / portfolioValue) * 100;
}


function calculateAllocationMap(holdings) {
  var total = calculatePortfolioTotal(holdings);
  return holdings.map(item => ({ symbol: normalizeSymbol(item.symbol), percentage: calculateAllocationPercentage(item.amount * item.price, total) }));
}


function findLargestHolding(holdings) {
  ensureNonEmptyArray(holdings, "holdings");
  return holdings.reduce((largest, item) => item.amount * item.price > largest.amount * largest.price ? item : largest);
}


function calculateRiskReward(entryPrice, stopPrice, targetPrice) {
  var risk = Math.abs(entryPrice - stopPrice);
  var reward = Math.abs(targetPrice - entryPrice);
  if (risk === 0) throw new RangeError("Risk cannot be zero");
  return reward / risk;
}


function calculatePositionSize(accountValue, riskPercent, entryPrice, stopPrice) {
  var riskPerUnit = Math.abs(entryPrice - stopPrice);
  if (accountValue <= 0 || riskPercent <= 0 || riskPerUnit === 0) throw new RangeError("Position inputs are invalid");
  return (accountValue * riskPercent / 100) / riskPerUnit;
}
