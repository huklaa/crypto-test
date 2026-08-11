import test from "node:test";
import assert from "node:assert/strict";

import {
  getBasePredeploy,
  identifyBasePredeploy,
  isBasePredeploy,
  normalizeBaseAddress,
} from "../src/base-predeploys.js";

test("resolves stable Base system predeploys", () => {
  assert.equal(
    getBasePredeploy("GasPriceOracle"),
    "0x420000000000000000000000000000000000000f",
  );
  assert.equal(
    getBasePredeploy("OperatorFeeVault"),
    "0x420000000000000000000000000000000000001b",
  );
});

test("handles the network-specific ERC20 factory", () => {
  assert.equal(
    getBasePredeploy("OptimismMintableERC20Factory", { network: "mainnet" }),
    "0xf10122d428b4bc8a9d050d06a2037259b4c4b83b",
  );
  assert.equal(
    getBasePredeploy("OptimismMintableERC20Factory", { network: "sepolia" }),
    "0x4200000000000000000000000000000000000012",
  );
});

test("identifies predeploys case-insensitively", () => {
  assert.equal(
    identifyBasePredeploy("0x4200000000000000000000000000000000000015"),
    "L1Block",
  );
  assert.equal(
    normalizeBaseAddress("0xF10122D428B4bc8A9d050D06a2037259b4c4B83B"),
    "0xf10122d428b4bc8a9d050d06a2037259b4c4b83b",
  );
});

test("distinguishes unknown contracts from system predeploys", () => {
  assert.equal(isBasePredeploy("0x0000000000000000000000000000000000000001"), false);
  assert.equal(
    isBasePredeploy("0x4200000000000000000000000000000000000021", { network: "sepolia" }),
    true,
  );
});

test("rejects malformed inputs and unsupported networks", () => {
  assert.throws(() => normalizeBaseAddress("0x1234"), TypeError);
  assert.throws(() => getBasePredeploy("NotAContract"), RangeError);
  assert.throws(() => getBasePredeploy("L1Block", { network: "goerli" }), RangeError);
});
