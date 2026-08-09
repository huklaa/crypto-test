const COINGECKO_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price";

export const COINGECKO_IDS = Object.freeze({
  ETH: "ethereum",
  WETH: "weth",
  cbETH: "coinbase-wrapped-staked-eth",
  cbBTC: "coinbase-wrapped-btc"
});

export async function fetchUsdPrices(fetchImpl = fetch) {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const response = await fetchImpl(`${COINGECKO_PRICE_URL}?ids=${ids}&vs_currencies=usd`);
  if (!response.ok) throw new Error(`Price API request failed (${response.status})`);

  const payload = await response.json();
  const prices = { USDC: 1 };
  for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
    const price = Number(payload[id]?.usd);
    if (Number.isFinite(price) && price > 0) prices[symbol] = price;
  }
  return prices;
}
