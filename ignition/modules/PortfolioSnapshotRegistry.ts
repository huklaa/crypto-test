import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PortfolioSnapshotRegistryModule", (module) => {
  const registry = module.contract("PortfolioSnapshotRegistry");

  return { registry };
});
