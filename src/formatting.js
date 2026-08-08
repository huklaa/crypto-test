import { isValidCurrencyCode } from "./validation.js";

export function formatCurrency(value, currency = "USD", locale = "en-US") {
  if (!Number.isFinite(value)) throw new TypeError("Value must be finite");
  if (!isValidCurrencyCode(currency)) throw new RangeError("Invalid currency code");
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatCryptoAmount(amount, maximumFractionDigits = 8, locale = "en-US") {
  if (!Number.isFinite(amount)) throw new TypeError("Amount must be finite");
  return new Intl.NumberFormat(locale, { maximumFractionDigits, useGrouping: true }).format(amount);
}

export function formatCompactNumber(value, locale = "en-US") {
  if (!Number.isFinite(value)) throw new TypeError("Value must be finite");
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function formatCryptoDate(value, locale = "en-US") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid date");
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatCoinPair(base, quote, separator = "/") {
  return `${String(base).trim().toUpperCase()}${separator}${String(quote).trim().toUpperCase()}`;
}

export function roundToDecimals(value, decimals = 2) {
  if (!Number.isFinite(value) || !Number.isInteger(decimals) || decimals < 0 || decimals > 15) {
    throw new RangeError("Rounding inputs are invalid");
  }
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function describePriceChange(changePercent) {
  if (!Number.isFinite(changePercent)) throw new TypeError("Change must be finite");
  if (changePercent > 0) return `up ${roundToDecimals(changePercent)}%`;
  if (changePercent < 0) return `down ${roundToDecimals(Math.abs(changePercent))}%`;
  return "unchanged";
}
