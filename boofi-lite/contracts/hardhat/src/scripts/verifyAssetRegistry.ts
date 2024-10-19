// npx hardhat run scripts/verifyAssetRegistry.ts --network <network>

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const assetRegistryAddress = process.env.ASSET_REGISTRY_ADDRESS!;
  if (!assetRegistryAddress) {
    throw new Error("Please set your ASSET_REGISTRY_ADDRESS in the .env file");
  }

  const USDC_ADDRESS = process.env.USDC_ADDRESS!;
  if (!USDC_ADDRESS) {
    throw new Error("Please set your USDC_ADDRESS in the .env file");
  }

  const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
  const assetRegistry = AssetRegistry.attach(assetRegistryAddress);

  const usdcInfo = await assetRegistry.getAssetInfo(USDC_ADDRESS);
  console.log("USDC Asset Info:", usdcInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error verifying AssetRegistry:", error);
    process.exit(1);
  });
