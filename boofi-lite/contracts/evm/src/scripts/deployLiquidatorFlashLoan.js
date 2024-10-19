// npx hardhat run src/scripts/deployLiquidatorFlashLoan.js --network base-sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying LiquidatorFlashLoan with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters from environment variables
  const hub = process.env.HUB_CONTRACT_ADDRESS;
  const pool = process.env.FUJI_AAVE_POOL_ADDRESS;
  const uniswapRouter = process.env.FUJI_UNISWAP_ROUTER_ADDRESS;
  const priceOracle = process.env.BOOFI_PRICE_ORACLE;
  const profitToken = process.env.PROFIT_TOKEN_ADDRESS;
  const profitReceiver = process.env.PROFIT_RECEIVER_ADDRESS;
  const initialLiquidators = process.env.INITIAL_LIQUIDATORS ? process.env.INITIAL_LIQUIDATORS.split(",") : [];
  const maxSlippage = parseInt(process.env.MAX_SLIPPAGE, 10) || 100; // Default to 1% if not set

  // Validate required addresses
  if (!hub || !pool || !uniswapRouter || !priceOracle || !profitToken || !profitReceiver) {
    throw new Error("Please set HUB_CONTRACT_ADDRESS, FUJI_AAVE_POOL_ADDRESS, UNISWAP_ROUTER_ADDRESS, BOOFI_PRICE_ORACLE, PROFIT_TOKEN_ADDRESS, and PROFIT_RECEIVER_ADDRESS in the .env file");
  }

  if (initialLiquidators.length === 0) {
    throw new Error("Please set INITIAL_LIQUIDATORS in the .env file as a comma-separated list");
  }

  // Deploy LiquidatorFlashLoan
  const LiquidatorFlashLoan = await hre.ethers.getContractFactory("LiquidatorFlashLoan");
  const liquidatorFlashLoan = await LiquidatorFlashLoan.deploy(
    hub,
    pool,
    uniswapRouter,
    priceOracle,
    profitToken,
    profitReceiver,
    initialLiquidators,
    maxSlippage
  );

  await liquidatorFlashLoan.deployed();
  console.log("LiquidatorFlashLoan deployed to:", liquidatorFlashLoan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying LiquidatorFlashLoan:", error);
    process.exit(1);
  });
