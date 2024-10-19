const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AssetRegistry with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  const collateralizationRatioPrecision = hre.ethers.utils.parseUnits("1", 18);
  const maxLiquidationPortionPrecision = hre.ethers.utils.parseUnits("1", 18);

  const WETH_ADDRESS = process.env.WETH_ADDRESS_FUJI;
  if (!WETH_ADDRESS) {
    throw new Error("Please set your WETH_ADDRESS in the .env file");
  }

  const weth = await hre.ethers.getContractAt("IWETH", WETH_ADDRESS);

  const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
  const assetRegistry = await AssetRegistry.deploy(
    collateralizationRatioPrecision,
    maxLiquidationPortionPrecision,
    weth.address,
    { gasLimit: 6000000 }
  );

  await assetRegistry.deployed();
  console.log("AssetRegistry deployed to:", assetRegistry.address);

  const USDC_ADDRESS = process.env.AVALANCHE_FUJI_USDC_ADDRESS;
  const INTEREST_RATE_CALCULATOR_ADDRESS = process.env.INTEREST_RATE_CALCULATOR_ADDRESS_FUJI;
  
  if (!USDC_ADDRESS) {
    throw new Error("Please set your USDC_ADDRESS in the .env file");
  }

  if (!INTEREST_RATE_CALCULATOR_ADDRESS) {
    throw new Error("Please set your INTEREST_RATE_CALCULATOR_ADDRESS in the .env file");
  }

  const collateralizationRatioDeposit = hre.ethers.utils.parseUnits("1.1", 18); // Simpler ratio for testing
  const collateralizationRatioBorrow = hre.ethers.utils.parseUnits("0.9", 18);  // Simpler ratio for testing
  const maxLiquidationPortion = hre.ethers.utils.parseUnits("0.2", 18);         // Simpler values
  const maxLiquidationBonus = hre.ethers.utils.parseUnits("0.05", 18);          // Simpler values

  try {
    console.log("Attempting to register USDC...");
    const tx = await assetRegistry.registerAsset(
      USDC_ADDRESS,
      collateralizationRatioDeposit,
      collateralizationRatioBorrow,
      INTEREST_RATE_CALCULATOR_ADDRESS,
      maxLiquidationPortion,
      maxLiquidationBonus,
      { gasLimit: 6000000 }
    );
    await tx.wait();
    console.log("USDC registered in AssetRegistry");
  } catch (error) {
    console.error("Error registering USDC:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying AssetRegistry:", error);
    process.exit(1);
  });
