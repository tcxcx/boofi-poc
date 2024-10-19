
// npx hardhat run src/scripts/deployHubHelperViews.js --network base-sepolia
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying HubHelperViews with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve the hub address from environment variables
  const hubAddress = process.env.HUB_CONTRACT_ADDRESS;

  if (!hubAddress) {
    throw new Error("Please set HUB_CONTRACT_ADDRESS in the .env file");
  }

  // Deploy HubHelperViews
  const HubHelperViews = await hre.ethers.getContractFactory("HubHelperViews");
  const hubHelperViews = await HubHelperViews.deploy(hubAddress);

  await hubHelperViews.deployed();
  console.log("HubHelperViews deployed to:", hubHelperViews.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying HubHelperViews:", error);
    process.exit(1);
  });
