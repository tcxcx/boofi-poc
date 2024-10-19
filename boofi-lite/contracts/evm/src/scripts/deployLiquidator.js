// npx hardhat run src/scripts/deployLiquidator.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Liquidator with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const hubAddress = process.env.HUB_CONTRACT_ADDRESS;
  const initialLiquidators = process.env.INITIAL_LIQUIDATORS ? process.env.INITIAL_LIQUIDATORS.split(",") : [];

  if (!hubAddress) {
    throw new Error("Please set HUB_CONTRACT_ADDRESS in the .env file");
  }

  if (initialLiquidators.length === 0) {
    throw new Error("Please set INITIAL_LIQUIDATORS in the .env file as a comma-separated list");
  }

  // Deploy Liquidator
  const Liquidator = await hre.ethers.getContractFactory("Liquidator");
  const liquidator = await Liquidator.deploy(
    hubAddress,
    initialLiquidators
  );

  await liquidator.deployed();
  console.log("Liquidator deployed to:", liquidator.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying Liquidator:", error);
    process.exit(1);
  });
