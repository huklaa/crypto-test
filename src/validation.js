export function normalizeSymbol(symbol) {
  if (typeof symbol !== "string") throw new TypeError("Symbol must be a string");
  return symbol.trim().toUpperCase();
}

export function isValidSymbol(symbol) {
  return typeof symbol === "string" && /^[A-Z0-9]{2,10}$/.test(normalizeSymbol(symbol));
}

export function assertPositiveNumber(value, fieldName = "value") {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a positive finite number`);
  }
  return value;
}

export function assertNonNegativeNumber(value, fieldName = "value") {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative finite number`);
  }
  return value;
}

export function ensureNonEmptyArray(value, fieldName = "items") {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty array`);
  }
  return value;
}

export function validateCoin(coin) {
  if (!coin || typeof coin !== "object") throw new TypeError("Coin must be an object");
  const symbol = normalizeSymbol(coin.symbol);
  if (!isValidSymbol(symbol) || typeof coin.name !== "string" || !coin.name.trim()) {
    throw new TypeError("Coin identity is invalid");
  }
  assertNonNegativeNumber(coin.price, "price");
  return { ...coin, symbol, name: coin.name.trim() };
}

export function validateHolding(holding) {
  if (!holding || typeof holding !== "object") throw new TypeError("Holding must be an object");
  return {
    ...holding,
    symbol: normalizeSymbol(holding.symbol),
    amount: assertNonNegativeNumber(holding.amount, "amount"),
    price: assertNonNegativeNumber(holding.price, "price")
  };
}

export function isValidCurrencyCode(code) {
  if (typeof code !== "string" || !/^[A-Z]{3}$/.test(code.toUpperCase())) return false;
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: code.toUpperCase() });
    return true;
  } catch {
    return false;
  }
}
