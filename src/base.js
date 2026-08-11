const BASE_CHAIN_IDS = Object.freeze({
  mainnet: 8453,
  sepolia: 84532,
});

export function normalizeRpcChainId(value) {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError("chain id must be a non-negative safe integer");
    }
    return value;
  }

  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("chain id must be a number or non-empty string");
  }

  const normalized = value.trim();
  if (!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(normalized)) {
    throw new TypeError("chain id must be a decimal or 0x-prefixed hexadecimal integer");
  }

  const parsed = Number.parseInt(normalized, normalized.toLowerCase().startsWith("0x") ? 16 : 10);
  if (!Number.isSafeInteger(parsed)) {
    throw new RangeError("chain id exceeds JavaScript safe integer range");
  }

  return parsed;
}

export function isBaseChainId(value) {
  const chainId = normalizeRpcChainId(value);
  return chainId === BASE_CHAIN_IDS.mainnet || chainId === BASE_CHAIN_IDS.sepolia;
}

export function assertBaseChainId(value, { network } = {}) {
  const chainId = normalizeRpcChainId(value);

  if (network !== undefined && network !== "mainnet" && network !== "sepolia") {
    throw new TypeError("network must be 'mainnet' or 'sepolia'");
  }

  const expected = network === undefined ? null : BASE_CHAIN_IDS[network];
  if (expected !== null && chainId !== expected) {
    throw new Error(`unexpected Base chain id: expected ${expected}, received ${chainId}`);
  }

  if (!isBaseChainId(chainId)) {
    throw new Error(`unsupported Base chain id: ${chainId}`);
  }

  return chainId;
}

export function validateBaseEthChainIdResponse(response, options) {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new TypeError("JSON-RPC response must be an object");
  }

  if (response.error !== undefined) {
    throw new Error("JSON-RPC response contains an error");
  }

  if (!("result" in response)) {
    throw new TypeError("JSON-RPC response is missing result");
  }

  return assertBaseChainId(response.result, options);
}

export { BASE_CHAIN_IDS };
