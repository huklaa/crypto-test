import test from "node:test";
import assert from "node:assert/strict";
import { fetchUsdPrices } from "../demo/lib/priceClient.js";

test("price client maps CoinGecko USD prices and pins USDC to one dollar", async () => {
  let requestedUrl;
  const prices = await fetchUsdPrices(async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      json: async () => ({
        ethereum: { usd: 2000 },
        weth: { usd: 1999 },
        "coinbase-wrapped-staked-eth": { usd: 2200 },
        "coinbase-wrapped-btc": { usd: 65000 }
      })
    };
  });

  assert.match(requestedUrl, /vs_currencies=usd/);
  assert.deepEqual(prices, { ETH: 2000, WETH: 1999, cbETH: 2200, cbBTC: 65000, USDC: 1 });
});

test("price client rejects unsuccessful requests and ignores invalid values", async () => {
  await assert.rejects(() => fetchUsdPrices(async () => ({ ok: false, status: 429 })), /failed \(429\)/);
  const prices = await fetchUsdPrices(async () => ({
    ok: true,
    json: async () => ({ ethereum: { usd: 2000 }, weth: { usd: null } })
  }));
  assert.deepEqual(prices, { ETH: 2000, USDC: 1 });
});
