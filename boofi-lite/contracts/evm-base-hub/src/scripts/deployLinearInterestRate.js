// npx hardhat run src/scripts/deployLinearInterestRate.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying LinearInterestRate with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Define constructor parameters
  const ratePrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18
  const rateIntercept = hre.ethers.utils.parseUnits("0.05", 18); // 5%
  const rateCoefficient = hre.ethers.utils.parseUnits("0.02", 18); // 2%
  const reserveFactor = hre.ethers.utils.parseUnits("0.1", 18); // 10%
  const reservePrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18

  // Deploy LinearInterestRate
  const LinearInterestRate = await hre.ethers.getContractFactory("LinearInterestRate");
  const linearInterestRate = await LinearInterestRate.deploy(
    ratePrecision,
    rateIntercept,
    rateCoefficient,
    reserveFactor,
    reservePrecision
  );

  await linearInterestRate.deployed();
  console.log("LinearInterestRate deployed to:", linearInterestRate.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying LinearInterestRate:", error);
    process.exit(1);
  });
