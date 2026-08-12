const ERC8021_MARKER_HEX = "8021".repeat(8);
const BASE_MAINNET_CHAIN_ID_HEX = "0x2105";
const BASE_ACCOUNT_CAPABILITY_NAMES = Object.freeze([
  "atomic",
  "paymasterService",
  "flowControl",
  "datacallback",
  "dataSuffix",
  "gasLimitOverride",
]);

function normalizeHexBytes(value, name = "hex bytes") {
  if (typeof value !== "string" || !/^0x(?:[0-9a-f]{2})*$/i.test(value)) {
    throw new TypeError(`${name} must be a 0x-prefixed, byte-aligned hex string`);
  }
  return value.toLowerCase();
}

function assertCapabilitiesObject(capabilities) {
  if (capabilities === null || typeof capabilities !== "object" || Array.isArray(capabilities)) {
    throw new TypeError("capabilities must be an object");
  }
}

function normalizeChainId(chainId) {
  if (typeof chainId !== "string" || !/^0x[0-9a-f]+$/i.test(chainId)) {
    throw new TypeError("chainId must be a 0x-prefixed hexadecimal chain id");
  }

  return `0x${BigInt(chainId).toString(16)}`;
}

export function appendDataSuffix(data, suffix) {
  const normalizedData = normalizeHexBytes(data, "data");
  const normalizedSuffix = normalizeHexBytes(suffix, "data suffix");
  return `${normalizedData}${normalizedSuffix.slice(2)}`;
}

export function applyDataSuffixToTransaction(transaction, suffix) {
  if (transaction === null || typeof transaction !== "object" || Array.isArray(transaction)) {
    throw new TypeError("transaction must be an object");
  }

  const data = transaction.data ?? "0x";
  return {
    ...transaction,
    data: appendDataSuffix(data, suffix),
  };
}

export function applyDataSuffixToUserOperation(userOperation, suffix) {
  if (userOperation === null || typeof userOperation !== "object" || Array.isArray(userOperation)) {
    throw new TypeError("user operation must be an object");
  }
  if (userOperation.callData === undefined) {
    throw new TypeError("user operation must include callData");
  }

  return {
    ...userOperation,
    callData: appendDataSuffix(userOperation.callData, suffix),
  };
}

export function buildDataSuffixCapability(suffix, { optional = false } = {}) {
  if (typeof optional !== "boolean") {
    throw new TypeError("optional must be a boolean");
  }

  return {
    dataSuffix: {
      value: assertErc8021DataSuffix(suffix),
      optional,
    },
  };
}

export function getChainCapabilities(capabilities, chainId = BASE_MAINNET_CHAIN_ID_HEX) {
  assertCapabilitiesObject(capabilities);
  const normalizedChainId = normalizeChainId(chainId);

  for (const [candidateChainId, chainCapabilities] of Object.entries(capabilities)) {
    let normalizedCandidate;
    try {
      normalizedCandidate = normalizeChainId(candidateChainId);
    } catch {
      continue;
    }

    if (normalizedCandidate !== normalizedChainId) {
      continue;
    }

    if (chainCapabilities === null || typeof chainCapabilities !== "object" || Array.isArray(chainCapabilities)) {
      return null;
    }

    return chainCapabilities;
  }

  return null;
}

export function supportsWalletCapability(capabilities, capability, chainId = BASE_MAINNET_CHAIN_ID_HEX) {
  if (typeof capability !== "string" || capability.length === 0) {
    throw new TypeError("capability must be a non-empty string");
  }

  return getChainCapabilities(capabilities, chainId)?.[capability]?.supported === true;
}

export function getBaseCapabilitySummary(capabilities) {
  return Object.fromEntries(
    BASE_ACCOUNT_CAPABILITY_NAMES.map((capability) => [
      capability,
      supportsWalletCapability(capabilities, capability, BASE_MAINNET_CHAIN_ID_HEX),
    ]),
  );
}

export function supportsDataSuffixCapability(capabilities, chainId = BASE_MAINNET_CHAIN_ID_HEX) {
  return supportsWalletCapability(capabilities, "dataSuffix", chainId);
}

export function hasErc8021Marker(suffix) {
  const normalizedSuffix = normalizeHexBytes(suffix, "data suffix");
  return normalizedSuffix.endsWith(ERC8021_MARKER_HEX);
}

export function assertErc8021DataSuffix(suffix) {
  const normalizedSuffix = normalizeHexBytes(suffix, "data suffix");
  if (!normalizedSuffix.endsWith(ERC8021_MARKER_HEX)) {
    throw new Error("data suffix is missing the ERC-8021 marker");
  }
  return normalizedSuffix;
}

export { BASE_ACCOUNT_CAPABILITY_NAMES, BASE_MAINNET_CHAIN_ID_HEX, ERC8021_MARKER_HEX };
