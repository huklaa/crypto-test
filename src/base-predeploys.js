const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

const COMMON_PREDEPLOYS = Object.freeze({
  WETH9: "0x4200000000000000000000000000000000000006",
  L2CrossDomainMessenger: "0x4200000000000000000000000000000000000007",
  GasPriceOracle: "0x420000000000000000000000000000000000000f",
  L2StandardBridge: "0x4200000000000000000000000000000000000010",
  SequencerFeeVault: "0x4200000000000000000000000000000000000011",
  L2ERC721Bridge: "0x4200000000000000000000000000000000000014",
  L1Block: "0x4200000000000000000000000000000000000015",
  L2ToL1MessagePasser: "0x4200000000000000000000000000000000000016",
  OptimismMintableERC721Factory: "0x4200000000000000000000000000000000000017",
  ProxyAdmin: "0x4200000000000000000000000000000000000018",
  BaseFeeVault: "0x4200000000000000000000000000000000000019",
  L1FeeVault: "0x420000000000000000000000000000000000001a",
  OperatorFeeVault: "0x420000000000000000000000000000000000001b",
  EASSchemaRegistry: "0x4200000000000000000000000000000000000020",
  EAS: "0x4200000000000000000000000000000000000021",
});

export const BASE_PREDEPLOYS = Object.freeze({
  mainnet: Object.freeze({
    ...COMMON_PREDEPLOYS,
    OptimismMintableERC20Factory: "0xf10122d428b4bc8a9d050d06a2037259b4c4b83b",
  }),
  sepolia: Object.freeze({
    ...COMMON_PREDEPLOYS,
    OptimismMintableERC20Factory: "0x4200000000000000000000000000000000000012",
  }),
});

function assertNetwork(network) {
  if (!Object.hasOwn(BASE_PREDEPLOYS, network)) {
    throw new RangeError(`unsupported Base network: ${network}`);
  }
}

export function normalizeBaseAddress(address) {
  if (typeof address !== "string" || !ADDRESS_RE.test(address)) {
    throw new TypeError("address must be a 20-byte 0x-prefixed hex string");
  }
  return address.toLowerCase();
}

export function getBasePredeploy(name, { network = "mainnet" } = {}) {
  assertNetwork(network);
  if (typeof name !== "string" || !Object.hasOwn(BASE_PREDEPLOYS[network], name)) {
    throw new RangeError(`unknown Base predeploy: ${name}`);
  }
  return BASE_PREDEPLOYS[network][name];
}

export function identifyBasePredeploy(address, { network = "mainnet" } = {}) {
  assertNetwork(network);
  const normalized = normalizeBaseAddress(address);
  for (const [name, candidate] of Object.entries(BASE_PREDEPLOYS[network])) {
    if (candidate === normalized) return name;
  }
  return null;
}

export function isBasePredeploy(address, options) {
  return identifyBasePredeploy(address, options) !== null;
}
