import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { zeroAddress } from "viem";

describe("ChainlingVerifiedAquaMint", async function () {
  const { viem, networkHelpers } = await network.create({
    network: "hardhatOp",
    chainType: "op",
  });

  async function deployCollection() {
    const [owner, signer, collector, other] = await viem.getWalletClients();
    const collection = await viem.deployContract("ChainlingVerifiedAquaMint", [
      owner.account.address,
      signer.account.address,
      "https://chainling.xyz/free-mint/6.json",
    ]);
    return { collection, collector, other, owner, signer };
  }

  async function permit(
    collection: Awaited<ReturnType<typeof deployCollection>>["collection"],
    signer: Awaited<ReturnType<typeof deployCollection>>["signer"],
    account: `0x${string}`,
    xUserHash: `0x${string}`,
    deadline: bigint,
  ) {
    const hash = await collection.read.mintPermitHash([account, xUserHash, deadline]);
    return signer.signMessage({ message: { raw: hash } });
  }

  const xUserHash = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;

  it("mints only with a signer-issued wallet permit", async function () {
    const { collection, collector, signer } = await networkHelpers.loadFixture(deployCollection);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
    const signature = await permit(collection, signer, collector.account.address, xUserHash, deadline);

    await viem.assertions.emitWithArgs(
      collection.write.mint([xUserHash, deadline, signature], { account: collector.account }),
      collection,
      "TransferSingle",
      [collector.account.address, zeroAddress, collector.account.address, 6n, 1n],
    );

    assert.equal(await collection.read.minted(), 1n);
    assert.equal(await collection.read.balanceOf([collector.account.address, 6n]), 1n);
    assert.equal(await collection.read.claimed([collector.account.address]), true);
    assert.equal(await collection.read.MAX_SUPPLY(), 8_888n);
  });

  it("rejects a permit issued for another wallet", async function () {
    const { collection, collector, other, signer } = await networkHelpers.loadFixture(deployCollection);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
    const signature = await permit(collection, signer, other.account.address, xUserHash, deadline);

    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, deadline, signature], { account: collector.account }),
      collection,
      "InvalidPermit",
    );
  });

  it("rejects expired permits and duplicate claims", async function () {
    const { collection, collector, signer } = await networkHelpers.loadFixture(deployCollection);
    const expired = 1n;
    const expiredSignature = await permit(collection, signer, collector.account.address, xUserHash, expired);
    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, expired, expiredSignature], { account: collector.account }),
      collection,
      "ExpiredPermit",
    );

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
    const signature = await permit(collection, signer, collector.account.address, xUserHash, deadline);
    await collection.write.mint([xUserHash, deadline, signature], { account: collector.account });
    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, deadline, signature], { account: collector.account }),
      collection,
      "AlreadyClaimed",
    );
  });

  it("lets the owner pause minting and rotate the signer", async function () {
    const { collection, collector, other, owner, signer } = await networkHelpers.loadFixture(deployCollection);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
    const signature = await permit(collection, signer, collector.account.address, xUserHash, deadline);

    await viem.assertions.revertWithCustomError(
      collection.write.setSigner([other.account.address], { account: collector.account }),
      collection,
      "NotAuthorized",
    );
    await collection.write.setSigner([other.account.address], { account: owner.account });
    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, deadline, signature], { account: collector.account }),
      collection,
      "InvalidPermit",
    );

    const newSignature = await permit(collection, other, collector.account.address, xUserHash, deadline);
    await collection.write.setPaused([true], { account: owner.account });
    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, deadline, newSignature], { account: collector.account }),
      collection,
      "MintPaused",
    );
  });

  it("allows only one mint per verified X account across wallets", async function () {
    const { collection, collector, other, signer } = await networkHelpers.loadFixture(deployCollection);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
    const collectorSignature = await permit(collection, signer, collector.account.address, xUserHash, deadline);
    await collection.write.mint([xUserHash, deadline, collectorSignature], { account: collector.account });

    const otherSignature = await permit(collection, signer, other.account.address, xUserHash, deadline);
    await viem.assertions.revertWithCustomError(
      collection.write.mint([xUserHash, deadline, otherSignature], { account: other.account }),
      collection,
      "XAccountClaimed",
    );
  });
});
