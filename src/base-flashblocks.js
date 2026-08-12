const BASE_FLASHBLOCK_ENDPOINTS = Object.freeze({
  mainnet: Object.freeze({
    http: "https://mainnet-preconf.base.org",
    websocket: "wss://mainnet-preconf.base.org",
  }),
  sepolia: Object.freeze({
    http: "https://sepolia-preconf.base.org",
    websocket: "wss://sepolia-preconf.base.org",
  }),
});

function assertNetwork(network) {
  if (network !== "mainnet" && network !== "sepolia") {
    throw new TypeError("network must be 'mainnet' or 'sepolia'");
  }
  return network;
}

function assertTransport(transport) {
  if (transport !== "http" && transport !== "websocket") {
    throw new TypeError("transport must be 'http' or 'websocket'");
  }
  return transport;
}

export function getBaseFlashblocksEndpoint({ network = "mainnet", transport = "http" } = {}) {
  return BASE_FLASHBLOCK_ENDPOINTS[assertNetwork(network)][assertTransport(transport)];
}

export function assertTransactionHash(transactionHash) {
  if (typeof transactionHash !== "string" || !/^0x[0-9a-f]{64}$/i.test(transactionHash)) {
    throw new TypeError("transactionHash must be a 32-byte 0x-prefixed hex string");
  }
  return transactionHash;
}

export function createBaseTransactionStatusRequest(transactionHash, id = 1) {
  if (!(typeof id === "string" || (Number.isSafeInteger(id) && id >= 0))) {
    throw new TypeError("JSON-RPC id must be a non-negative safe integer or string");
  }

  return {
    jsonrpc: "2.0",
    method: "base_transactionStatus",
    params: [assertTransactionHash(transactionHash)],
    id,
  };
}

export function parseBaseTransactionStatusResponse(response) {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new TypeError("JSON-RPC response must be an object");
  }

  if (response.error !== undefined) {
    const message = response.error?.message;
    throw new Error(typeof message === "string" && message.length > 0
      ? `base_transactionStatus failed: ${message}`
      : "base_transactionStatus failed");
  }

  if (response.result === null || typeof response.result !== "object" || Array.isArray(response.result)) {
    throw new TypeError("base_transactionStatus response must contain an object result");
  }

  const { status } = response.result;
  if (status !== "Known" && status !== "Unknown") {
    throw new TypeError("base_transactionStatus result.status must be 'Known' or 'Unknown'");
  }

  return status;
}

export function isBaseTransactionKnown(response) {
  return parseBaseTransactionStatusResponse(response) === "Known";
}

export { BASE_FLASHBLOCK_ENDPOINTS };
