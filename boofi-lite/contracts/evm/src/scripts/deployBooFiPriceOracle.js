// npx hardhat run src/scripts/deployBooFiPriceOracle.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying BooFiPriceOracle with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const outputAsset = process.env.OUTPUT_ASSET || "USD";
  const sequencerUptimeFeed = process.env.SEQUENCER_UPTIME_FEED;
  const sequencerGracePeriod = parseInt(process.env.SEQUENCER_GRACE_PERIOD, 10) || 3600; // Default to 1 hour

  if (!sequencerUptimeFeed) {
    throw new Error("Please set SEQUENCER_UPTIME_FEED in the .env file");
  }

  // Deploy BooFiPriceOracle
  const BooFiPriceOracle = await hre.ethers.getContractFactory("BooFiPriceOracle");
  const booFiPriceOracle = await BooFiPriceOracle.deploy(
    outputAsset,
    sequencerUptimeFeed,
    sequencerGracePeriod
  );

  await booFiPriceOracle.deployed();
  console.log("BooFiPriceOracle deployed to:", booFiPriceOracle.address);

  // Define price sources to set
  const priceSources = [
    {
      asset: process.env.AVALANCHE_FUJI_USDC_ADDRESS,
      priceSource: process.env.AGGREGATORV3_PRICE_SOURCE_ADDRESS, // AggregatorV3BooFiPriceSource address
      maxPriceAge: 300, // Example: 300 seconds
    },
    // Add more assets as needed
  ];

  for (const ps of priceSources) {
    if (!ps.asset || !ps.priceSource) {
      console.log(`Skipping asset as address or priceSource is not set: ${ps.asset}`);
      continue;
    }

    // Set price source in BooFiPriceOracle
    const tx = await booFiPriceOracle.setPriceSource(
      ps.asset,
      {
        priceSource: ps.priceSource,
        maxPriceAge: ps.maxPriceAge,
      }
    );
    await tx.wait();
    console.log(`Set price source for asset ${ps.asset} to ${ps.priceSource}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying BooFiPriceOracle:", error);
    process.exit(1);
  });
