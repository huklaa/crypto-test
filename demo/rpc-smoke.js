import { createBasePortfolioReader } from "./lib/baseClient.js";

const status = await createBasePortfolioReader().getNetworkStatus();
console.log(`Connected to Base mainnet chain ${status.chainId} at block ${status.blockNumber}`);
