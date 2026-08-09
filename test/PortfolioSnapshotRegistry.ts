import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { keccak256, stringToHex, zeroHash } from "viem";

type SnapshotTuple = readonly [`0x${string}`, bigint, number, bigint];

describe("PortfolioSnapshotRegistry", async function () {
  const { viem, networkHelpers } = await network.create({
    network: "hardhatOp",
    chainType: "op",
  });

  async function deployRegistry() {
    const registry = await viem.deployContract("PortfolioSnapshotRegistry");
    const [owner] = await viem.getWalletClients();
    return { owner, registry };
  }

  it("records a caller-owned portfolio snapshot and emits its audit event", async function () {
    const { owner, registry } = await networkHelpers.loadFixture(deployRegistry);
    const portfolioHash = keccak256(stringToHex("base-portfolio-snapshot"));

    await viem.assertions.emitWithArgs(
      registry.write.recordSnapshot([portfolioHash, 125_050n, 4]),
      registry,
      "PortfolioSnapshotRecorded",
      [owner.account.address, portfolioHash, 125_050n, 4n, (recordedAt: bigint) => recordedAt > 0n],
    );

    const snapshot = await registry.read.latestSnapshots([owner.account.address]) as SnapshotTuple;
    assert.equal(snapshot[0], portfolioHash);
    assert.equal(snapshot[1], 125_050n);
    assert.equal(snapshot[2], 4);
    assert.ok(snapshot[3] > 0n);
    assert.equal(await registry.read.snapshotCount([owner.account.address]), 1n);
    assert.equal(await registry.read.version(), "1.0.0");
  });

  it("keeps snapshots isolated by caller", async function () {
    const { registry } = await networkHelpers.loadFixture(deployRegistry);
    const [, other] = await viem.getWalletClients();
    const portfolioHash = keccak256(stringToHex("another-portfolio"));

    await registry.write.recordSnapshot([portfolioHash, 42_000n, 2], {
      account: other.account,
    });

    const snapshot = await registry.read.latestSnapshots([other.account.address]) as SnapshotTuple;
    assert.equal(snapshot[0], portfolioHash);
    assert.equal(await registry.read.snapshotCount([other.account.address]), 1n);
  });

  it("rejects empty or invalid snapshot data", async function () {
    const { registry } = await networkHelpers.loadFixture(deployRegistry);
    const portfolioHash = keccak256(stringToHex("valid-hash"));

    await viem.assertions.revertWithCustomError(
      registry.write.recordSnapshot([zeroHash, 1n, 1]),
      registry,
      "EmptyPortfolioHash",
    );
    await viem.assertions.revertWithCustomError(
      registry.write.recordSnapshot([portfolioHash, 1n, 0]),
      registry,
      "EmptyPortfolio",
    );
    await viem.assertions.revertWithCustomError(
      registry.write.recordSnapshot([portfolioHash, 2n ** 128n, 1]),
      registry,
      "TotalValueTooLarge",
    );
  });
});
