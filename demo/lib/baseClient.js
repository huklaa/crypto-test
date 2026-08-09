import { createPublicClient, erc20Abi, formatEther, formatUnits, http, isAddress } from "viem";
import { base } from "viem/chains";
import { BASE_CHAIN_ID, BASE_RPC_URL, BASE_TOKENS } from "./baseConfig.js";

export function createBaseClient(rpcUrl = BASE_RPC_URL) {
  return createPublicClient({ chain: base, transport: http(rpcUrl) });
}

export function createBasePortfolioReader(client = createBaseClient()) {
  async function getNetworkStatus() {
    const [chainId, blockNumber] = await Promise.all([client.getChainId(), client.getBlockNumber()]);
    if (chainId !== BASE_CHAIN_ID) throw new Error(`Expected Base mainnet (${BASE_CHAIN_ID}), received ${chainId}`);
    return { chainId, blockNumber };
  }

  async function readPortfolio(address, tokens = BASE_TOKENS) {
    if (!isAddress(address)) throw new TypeError("Enter a valid EVM wallet address");

    const [nativeBalance, tokenBalances] = await Promise.all([
      client.getBalance({ address }),
      Promise.all(tokens.map(async (token) => {
        const balance = await client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address]
        });
        return { ...token, amount: Number(formatUnits(balance, token.decimals)) };
      }))
    ]);

    return [
      { symbol: "ETH", name: "Ether", amount: Number(formatEther(nativeBalance)), native: true },
      ...tokenBalances
    ];
  }

  return { getNetworkStatus, readPortfolio };
}
