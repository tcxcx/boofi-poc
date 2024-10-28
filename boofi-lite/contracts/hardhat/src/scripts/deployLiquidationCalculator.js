import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying LiquidationCalculator with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Retrieve constructor parameters from .env
  const hubAddress = process.env.HUB_ADDRESS;
  const maxHealthFactor = process.env.MAX_HEALTH_FACTOR
    ? ethers.BigNumber.from(process.env.MAX_HEALTH_FACTOR)
    : ethers.BigNumber.from("105"); // Example: 105%
  const maxHealthFactorPrecision = process.env.MAX_HEALTH_FACTOR_PRECISION
    ? ethers.BigNumber.from(process.env.MAX_HEALTH_FACTOR_PRECISION)
    : ethers.BigNumber.from("100"); // Example: Precision factor 100

  if (!hubAddress) {
    throw new Error("Please set HUB_ADDRESS in your .env file");
  }

  // Get the contract factory
  const LiquidationCalculator = await ethers.getContractFactory(
    "LiquidationCalculator"
  );

  // Deploy the contract
  const liquidationCalculator = await LiquidationCalculator.deploy(
    hubAddress,
    maxHealthFactor,
    maxHealthFactorPrecision
  );

  await liquidationCalculator.deployed();

  console.log(
    "LiquidationCalculator deployed to:",
    liquidationCalculator.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying LiquidationCalculator:", error);
    process.exit(1);
  });
