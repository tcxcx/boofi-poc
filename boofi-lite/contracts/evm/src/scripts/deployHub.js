const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Hub with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters
  const wormholeRelayer = process.env.BASE_SEPOLIA_WORMHOLE_ADDRESS || '0x79A1027a6A159502049F10906D333EC57E95F083';
  const tokenBridge = process.env.BASE_SEPOLIA_TOKEN_BRIDGE_ADDRESS || '0x86F55A04690fd7815A3D802bD587e83eA888B239';
  const wormhole = process.env.BASE_SEPOLIA_WORMHOLE_RELAYER_ADDRESS || '0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE';
  const circleMessageTransmitter = process.env.BASE_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER || hre.ethers.constants.AddressZero;
  const circleTokenMessenger = process.env.BASE_SEPOLIA_CIRCLE_TOKEN_MESSENGER || hre.ethers.constants.AddressZero;
  const USDC = process.env.BASE_SEPOLIA_USDC_ADDRESS || hre.ethers.constants.AddressZero;

  const interestAccrualIndexPrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18
  const liquidationFee = hre.ethers.utils.parseUnits("0.05", 18); // 5%
  const liquidationFeePrecision = hre.ethers.utils.parseUnits("1", 18); // 1e18

  const consistencyLevel = '200';

  const constructorArgs = {
    wormhole,
    tokenBridge,
    wormholeRelayer,
    consistencyLevel,
    interestAccrualIndexPrecision,
    liquidationFee,
    liquidationFeePrecision,
    circleMessageTransmitter,
    circleTokenMessenger,
    USDC,
  };

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

  // Deploy the Hub contract with constructor arguments
  const hub = await Hub.deploy(constructorArgs, { gasLimit: 8000000 });
  await hub.deployed();
  console.log("Hub deployed to:", hub.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying Hub:", error);
    process.exit(1);
  });
