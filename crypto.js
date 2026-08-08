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
