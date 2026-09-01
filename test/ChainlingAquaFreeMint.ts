import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { zeroAddress } from "viem";

describe("ChainlingAquaFreeMint", async function () {
  const { viem, networkHelpers } = await network.create({
    network: "hardhatOp",
    chainType: "op",
  });

  async function deployCollection() {
    const [owner, collector, other] = await viem.getWalletClients();
    const collection = await viem.deployContract("ChainlingAquaFreeMint", [
      owner.account.address,
      "https://chainling.xyz/free-mint/6.json",
    ]);
    return { collection, collector, other, owner };
  }

  it("mints Aqua Kingfisher for free with a fixed 8,888 cap", async function () {
    const { collection, collector } = await networkHelpers.loadFixture(deployCollection);

    await viem.assertions.emitWithArgs(
      collection.write.mint({ account: collector.account }),
      collection,
      "TransferSingle",
      [collector.account.address, zeroAddress, collector.account.address, 6n, 1n],
    );

    assert.equal(await collection.read.minted(), 1n);
    assert.equal(await collection.read.balanceOf([collector.account.address, 6n]), 1n);
    assert.equal(await collection.read.claimed([collector.account.address]), true);
    assert.equal(await collection.read.MAX_SUPPLY(), 8_888n);
  });

  it("limits each wallet to one free claim", async function () {
    const { collection, collector } = await networkHelpers.loadFixture(deployCollection);
    await collection.write.mint({ account: collector.account });

    await viem.assertions.revertWithCustomError(
      collection.write.mint({ account: collector.account }),
      collection,
      "AlreadyClaimed",
    );
  });

  it("lets only the owner pause the campaign", async function () {
    const { collection, collector, other } = await networkHelpers.loadFixture(deployCollection);

    await viem.assertions.revertWithCustomError(
      collection.write.setPaused([true], { account: other.account }),
      collection,
      "NotAuthorized",
    );
    await collection.write.setPaused([true]);
    await viem.assertions.revertWithCustomError(
      collection.write.mint({ account: collector.account }),
      collection,
      "MintPaused",
    );
  });
});
