// npx hardhat run src/scripts/deployChainedPriceSource.js --network base-sepolia


const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ChainedPriceSource with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Define ChainedSource structs from environment variables
  // Example: CHAINED_SOURCES=source1,inputAsset1,outputAsset1,maxPriceAge1;source2,inputAsset2,outputAsset2,maxPriceAge2
  const chainedSourcesEnv = process.env.CHAINED_SOURCES;
  if (!chainedSourcesEnv) {
    throw new Error("Please set CHAINED_SOURCES in the .env file as a semicolon-separated list");
  }

  const chainedSources = chainedSourcesEnv.split(";").map(sourceStr => {
    const [source, inputAsset, outputAsset, maxPriceAge] = sourceStr.split(",");
    return {
      source,
      inputAsset,
      outputAsset,
      maxPriceAge: parseInt(maxPriceAge, 10),
    };
  });

  // Validate each ChainedSource
  for (const cs of chainedSources) {
    if (!cs.source || !cs.inputAsset || !cs.outputAsset || !cs.maxPriceAge) {
      throw new Error("Each ChainedSource must have source, inputAsset, outputAsset, and maxPriceAge");
    }
  }

  // Deploy ChainedPriceSource
  const ChainedPriceSource = await hre.ethers.getContractFactory("ChainedPriceSource");
  const chainedPriceSource = await ChainedPriceSource.deploy(chainedSources);

  await chainedPriceSource.deployed();
  console.log("ChainedPriceSource deployed to:", chainedPriceSource.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying ChainedPriceSource:", error);
    process.exit(1);
  });
