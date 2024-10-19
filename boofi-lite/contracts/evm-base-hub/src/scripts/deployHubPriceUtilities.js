const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying HubPriceUtilities with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const hubAddress = process.env.HUB_CONTRACT_ADDRESS;
  const priceOracleAddress = process.env.BOOFI_PRICE_ORACLE;
  const priceStandardDeviations = process.env.PRICE_STANDARD_DEVIATIONS;
  const priceStandardDeviationsPrecision = process.env.PRICE_STANDARD_DEVIATIONS_PRECISION;
  const hubTokenUtilitiesAddress = process.env.HUB_TOKEN_UTILITIES; // Add this for the library linking

  if (!hubAddress || !priceOracleAddress || !hubTokenUtilitiesAddress) {
    throw new Error("Please set HUB_CONTRACT_ADDRESS, PRICE_ORACLE_ADDRESS, and HUB_TOKEN_UTILITIES in the .env file");
  }

  // Link the TokenBridgeUtilities library
  const HubPriceUtilities = await hre.ethers.getContractFactory("HubPriceUtilities", {
    libraries: {
      TokenBridgeUtilities: hubTokenUtilitiesAddress
    }
  });

  // Deploy HubPriceUtilities
  const hubPriceUtilities = await HubPriceUtilities.deploy(
    hubAddress,
    priceOracleAddress,
    priceStandardDeviations,
    priceStandardDeviationsPrecision
  );

  await hubPriceUtilities.deployed();
  console.log("HubPriceUtilities deployed to:", hubPriceUtilities.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying HubPriceUtilities:", error);
    process.exit(1);
  });
