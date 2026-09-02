import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OWNER = "0x5A0598f78184AE2632F8ee6ead6fC4E4b66ce5D0";
const TOKEN_URI = "https://chainling.xyz/free-mint/6.json";

export default buildModule("ChainlingVerifiedAquaMintModule", (module) => {
  const signer = module.getParameter<string>("signer");
  const collection = module.contract("ChainlingVerifiedAquaMint", [OWNER, signer, TOKEN_URI]);
  return { collection };
});
