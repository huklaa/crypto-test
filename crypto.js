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
