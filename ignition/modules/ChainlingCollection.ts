import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const TREASURY = "0x5A0598f78184AE2632F8ee6ead6fC4E4b66ce5D0";
const BASE_URI = "https://chainling.xyz/metadata/";

export default buildModule("ChainlingCollectionModule", (module) => {
  const collection = module.contract("ChainlingCollection", [USDG, TREASURY, BASE_URI]);
  return { collection };
});
