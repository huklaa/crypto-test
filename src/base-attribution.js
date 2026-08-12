const ERC8021_MARKER_HEX = "8021".repeat(8);

function normalizeHexBytes(value, name = "hex bytes") {
  if (typeof value !== "string" || !/^0x(?:[0-9a-f]{2})*$/i.test(value)) {
    throw new TypeError(`${name} must be a 0x-prefixed, byte-aligned hex string`);
  }
  return value.toLowerCase();
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

export function supportsDataSuffixCapability(capabilities, chainId = "0x2105") {
  if (capabilities === null || typeof capabilities !== "object" || Array.isArray(capabilities)) {
    throw new TypeError("capabilities must be an object");
  }
  if (typeof chainId !== "string" || !/^0x[0-9a-f]+$/i.test(chainId)) {
    throw new TypeError("chainId must be a 0x-prefixed hexadecimal chain id");
  }

  const chainCapabilities = capabilities[chainId] ?? capabilities[chainId.toLowerCase()];
  if (chainCapabilities === null || typeof chainCapabilities !== "object" || Array.isArray(chainCapabilities)) {
    return false;
  }

  return chainCapabilities.dataSuffix?.supported === true;
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

export { ERC8021_MARKER_HEX };
