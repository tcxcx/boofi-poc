// npx hardhat run src/scripts/deployPythBooFiPriceSource.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying PythBooFiPriceSource with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const pythAddress = process.env.PYTH_ADDRESS_AVAX_FUJI_CONTRACT;
  const outputAsset = process.env.OUTPUT_ASSET || "USD";

  if (!pythAddress) {
    throw new Error("Please set PYTH_ADDRESS_AVAX_FUJI_CONTRACT in the .env file");
  }

  // Deploy PythBooFiPriceSource
  const PythBooFiPriceSource = await hre.ethers.getContractFactory("PythBooFiPriceSource");
  const pythBooFiPriceSource = await PythBooFiPriceSource.deploy(
    pythAddress,
    outputAsset
  );

  await pythBooFiPriceSource.deployed();
  console.log("PythBooFiPriceSource deployed to:", pythBooFiPriceSource.address);

  // Define assets to set price sources for
  const assets = [
    {
      name: "USDC",
      address: process.env.BASE_SEPOLIA_USDC_ADDRESS,
      pythId: process.env.USDC_PYTH_ID_BASE_SEPOLIA,
    },
    {
      name: "WETH",
      address: process.env.WETH_ADDRESS,
      pythId: process.env.WETH_PYTH_ID_BASE_SEPOLIA,
    },
    // Add more assets as needed
  ];

  for (const asset of assets) {
    if (!asset.address || !asset.pythId) {
      console.log(`Skipping ${asset.name} as address or Pyth ID is not set.`);
      continue;
    }

    // Set price source in PythBooFiPriceSource
    const tx = await pythBooFiPriceSource.setPriceSource(
      asset.address,
      asset.pythId
    );
    await tx.wait();
    console.log(`Set ${asset.name} price source to ${asset.pythId}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying PythBooFiPriceSource:", error);
    process.exit(1);
  });
