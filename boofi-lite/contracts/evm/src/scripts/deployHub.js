const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Hub with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters for Hub on Base Sepolia from environment variables, with explicit fallback to AddressZero
  const wormholeRelayer = process.env.BASE_SEPOLIA_WORMHOLE_ADDRESS || '0x79A1027a6A159502049F10906D333EC57E95F083';
  const tokenBridge = process.env.BASE_SEPOLIA_TOKEN_BRIDGE_ADDRESS || '0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE';
  const wormhole = process.env.BASE_SEPOLIA_WORMHOLE_RELAYER_ADDRESS || '0x86F55A04690fd7815A3D802bD587e83eA888B239';
  const circleMessageTransmitter = process.env.BASE_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER || hre.ethers.constants.AddressZero;
  const circleTokenMessenger = process.env.BASE_SEPOLIA_CIRCLE_TOKEN_MESSENGER || hre.ethers.constants.AddressZero;
  const USDC = process.env.BASE_SEPOLIA_USDC_ADDRESS || hre.ethers.constants.AddressZero;
  
  // Ensure the BigNumber values are valid and properly logged
  const interestAccrualIndexPrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18
  const liquidationFee = hre.ethers.utils.parseUnits("0.05", 18); // 5%
  const liquidationFeePrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18
  
  // Log the values to ensure they are correctly set
  console.log("wormholeRelayer:", wormholeRelayer);
  console.log("tokenBridge:", tokenBridge);
  console.log("wormhole:", wormhole);
  console.log("circleMessageTransmitter:", circleMessageTransmitter);
  console.log("circleTokenMessenger:", circleTokenMessenger);
  console.log("USDC:", USDC);
  console.log("interestAccrualIndexPrecision:", interestAccrualIndexPrecision.toString());
  console.log("liquidationFee:", liquidationFee.toString());
  console.log("liquidationFeePrecision:", liquidationFeePrecision.toString());

  // Ensure all values are valid before initialization
  if (!wormholeRelayer || !tokenBridge || !wormhole || !interestAccrualIndexPrecision || !liquidationFee || !liquidationFeePrecision) {
    throw new Error("Invalid or missing parameters for Hub initialization");
  }

  // Deploy the TokenBridgeUtilities library
  const TokenBridgeUtilities = await hre.ethers.getContractFactory("TokenBridgeUtilities");
  const tokenBridgeUtilities = await TokenBridgeUtilities.deploy();
  await tokenBridgeUtilities.deployed();
  console.log("TokenBridgeUtilities deployed to:", tokenBridgeUtilities.address);

  // Link the TokenBridgeUtilities library to the Hub contract
  const Hub = await hre.ethers.getContractFactory("Hub", {
    libraries: {
      TokenBridgeUtilities: tokenBridgeUtilities.address,
    },
  });

  // Deploy the Hub contract
  const hub = await Hub.deploy();
  await hub.deployed();
  console.log("Hub deployed to:", hub.address);

  // Log the initialization parameters right before calling the initialize function
  console.log("Initializing Hub with the following parameters:");
  console.log({
    wormholeRelayer,
    tokenBridge,
    wormhole,
    circleMessageTransmitter,
    circleTokenMessenger,
    USDC,
    interestAccrualIndexPrecision: interestAccrualIndexPrecision.toString(),
    liquidationFee: liquidationFee.toString(),
    liquidationFeePrecision: liquidationFeePrecision.toString(),
  });

  // Initialize Hub with validated constructor parameters
  const initializeTx = await hub.initialize({
    wormholeRelayer,
    tokenBridge,
    wormhole,
    circleMessageTransmitter,
    circleTokenMessenger,
    USDC,
    interestAccrualIndexPrecision,
    liquidationFee,
    liquidationFeePrecision,
  });
  await initializeTx.wait();
  console.log("Hub initialized successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying Hub:", error);
    process.exit(1);
  });
