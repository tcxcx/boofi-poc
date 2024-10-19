// npx hardhat run src/scripts/deployAggregatorV3BooFiPriceSource.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AggregatorV3BooFiPriceSource with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const outputAsset = process.env.OUTPUT_ASSET || "USD";

  // Deploy AggregatorV3BooFiPriceSource
  const AggregatorV3BooFiPriceSource = await hre.ethers.getContractFactory("AggregatorV3BooFiPriceSource");
  const aggregatorV3PriceSource = await AggregatorV3BooFiPriceSource.deploy(outputAsset);

  await aggregatorV3PriceSource.deployed();
  console.log("AggregatorV3BooFiPriceSource deployed to:", aggregatorV3PriceSource.address);

  // Define assets to set price sources for
  const assets = [
    {
      name: "USDC",
      address: process.env.AVALANCHE_FUJI_USDC_ADDRESS,
      aggregator: process.env.USDC_CHAINLINK_AGGREGATOR_BASE_SEPOLIA,
    },
    {
      name: "WETH",
      address: process.env.WETH_ADDRESS_BASE_SEPOLIA,
      aggregator: process.env.ETH_CHAINLINK_AGGREGATOR_BASE_SEPOLIA,
    },
    // Add more assets as needed
  ];

  for (const asset of assets) {
    if (!asset.address || !asset.aggregator) {
      console.log(`Skipping ${asset.name} as address or aggregator is not set.`);
      continue;
    }

    // Set price source in AggregatorV3BooFiPriceSource
    const tx = await aggregatorV3PriceSource.setPriceSource(
      asset.address,
      asset.aggregator
    );
    await tx.wait();
    console.log(`Set ${asset.name} price source to ${asset.aggregator}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying AggregatorV3BooFiPriceSource:", error);
    process.exit(1);
  });
