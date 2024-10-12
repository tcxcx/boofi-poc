const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Spoke with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Dynamically select environment variables based on the network
  const network = hre.network.name;
  let envVariables = {};

  switch (network) {
    case "base-sepolia":
      envVariables = {
        chainId: parseInt(process.env.BASE_SEPOLIA_CHAIN_ID, 10),
        wormhole: process.env.BASE_SEPOLIA_WORMHOLE_ADDRESS,
        tokenBridge: process.env.BASE_SEPOLIA_TOKEN_BRIDGE_ADDRESS,
        relayer: process.env.BASE_SEPOLIA_WORMHOLE_RELAYER_ADDRESS,
        circleMessageTransmitter: process.env.BASE_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER,
        circleTokenMessenger: process.env.BASE_SEPOLIA_CIRCLE_TOKEN_MESSENGER,
        USDC: process.env.BASE_SEPOLIA_USDC_ADDRESS,
      };
      break;
    case "op-sepolia":
      envVariables = {
        chainId: parseInt(process.env.OP_SEPOLIA_CHAIN_ID, 10),
        wormhole: process.env.OP_SEPOLIA_WORMHOLE_ADDRESS,
        tokenBridge: process.env.OP_SEPOLIA_TOKEN_BRIDGE_ADDRESS,
        relayer: process.env.OP_SEPOLIA_WORMHOLE_RELAYER_ADDRESS,
        circleMessageTransmitter: process.env.OP_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER,
        circleTokenMessenger: process.env.OP_SEPOLIA_CIRCLE_TOKEN_MESSENGER,
        USDC: process.env.OP_SEPOLIA_USDC_ADDRESS,
      };
      break;
    case "sepolia":
      envVariables = {
        chainId: parseInt(process.env.ETHEREUM_SEPOLIA_CHAIN_ID, 10),
        wormhole: process.env.ETHEREUM_SEPOLIA_WORMHOLE_ADDRESS,
        tokenBridge: process.env.ETHEREUM_SEPOLIA_TOKEN_BRIDGE_ADDRESS,
        relayer: process.env.ETHEREUM_SEPOLIA_WORMHOLE_RELAYER_ADDRESS,
        circleMessageTransmitter: process.env.ETHEREUM_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER,
        circleTokenMessenger: process.env.ETHEREUM_SEPOLIA_CIRCLE_TOKEN_MESSENGER,
        USDC: process.env.ETHEREUM_SEPOLIA_USDC_ADDRESS,
      };
      break;
    case "arb-sepolia":
      envVariables = {
        chainId: parseInt(process.env.ARB_SEPOLIA_CHAIN_ID, 10),
        wormhole: process.env.ARB_SEPOLIA_WORMHOLE_ADDRESS,
        tokenBridge: process.env.ARB_SEPOLIA_TOKEN_BRIDGE_ADDRESS,
        relayer: process.env.ARB_SEPOLIA_WORMHOLE_RELAYER_ADDRESS,
        circleMessageTransmitter: process.env.ARB_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER,
        circleTokenMessenger: process.env.ARB_SEPOLIA_CIRCLE_TOKEN_MESSENGER,
        USDC: process.env.ARB_SEPOLIA_USDC_ADDRESS,
      };
      break;
    case "avalanche-fuji":
      envVariables = {
        chainId: parseInt(process.env.AVALANCHE_FUJI_CHAIN_ID, 10),
        wormhole: process.env.AVALANCHE_FUJI_WORMHOLE_ADDRESS,
        tokenBridge: process.env.AVALANCHE_FUJI_TOKEN_BRIDGE_ADDRESS,
        relayer: process.env.AVALANCHE_FUJI_WORMHOLE_RELAYER_ADDRESS,
        circleMessageTransmitter: process.env.AVALANCHE_FUJI_CIRCLE_MESSAGE_TRANSMITTER,
        circleTokenMessenger: process.env.AVALANCHE_FUJI_CIRCLE_TOKEN_MESSENGER,
        USDC: process.env.AVALANCHE_FUJI_USDC_ADDRESS,
      };
      break;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }

  const { chainId, wormhole, tokenBridge, relayer, circleMessageTransmitter, circleTokenMessenger, USDC } = envVariables;

  // Common Hub parameters (consistent across networks)
  const hubChainId = parseInt(process.env.BASE_SEPOLIA_CHAIN_ID, 10);  // Hub is on Base Sepolia
  const hubContractAddress = process.env.HUB_CONTRACT_ADDRESS;
  const hubTokenUtilitiesAddress = process.env.HUB_TOKEN_UTILITIES; // Add this line to use the HUB_TOKEN_UTILITIES

  // Validate required addresses
  if (!wormhole || !tokenBridge || !relayer || !hubContractAddress || !hubTokenUtilitiesAddress) {
    throw new Error("Please set WORMHOLE, TOKEN_BRIDGE, RELAYER, HUB_CONTRACT_ADDRESS, and HUB_TOKEN_UTILITIES in the environment variables");
  }

  // Link the TokenBridgeUtilities library to the Spoke contract
  const Spoke = await hre.ethers.getContractFactory("Spoke", {
    libraries: {
      TokenBridgeUtilities: hubTokenUtilitiesAddress,
    },
  });

  // Deploy Spoke contract
  const spoke = await Spoke.deploy(
    chainId,
    wormhole,
    tokenBridge,
    relayer,
    hubChainId,
    hubContractAddress,
    circleMessageTransmitter,
    circleTokenMessenger,
    USDC
  );

  await spoke.deployed();
  console.log("Spoke deployed to:", spoke.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying Spoke:", error);
    process.exit(1);
  });
