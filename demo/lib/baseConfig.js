export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = import.meta.env?.VITE_BASE_RPC_URL || "https://mainnet.base.org";
export const BASE_EXPLORER_URL = "https://base.blockscout.com";
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC_URL = import.meta.env?.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
export const BASE_SEPOLIA_EXPLORER_URL = "https://base-sepolia.blockscout.com";
export const SNAPSHOT_REGISTRY_ADDRESS = import.meta.env?.VITE_SNAPSHOT_REGISTRY_ADDRESS || "";


export const BASE_TOKENS = Object.freeze([
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    defaultPrice: 1
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18
  },
  {
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    decimals: 18
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    decimals: 8
  }
]);
