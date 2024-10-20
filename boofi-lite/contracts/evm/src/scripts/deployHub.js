const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Hub with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Retrieve constructor parameters
  const wormholeRelayer = process.env.AVALANCHE_FUJI_WORMHOLE_ADDRESS || '0x79A1027a6A159502049F10906D333EC57E95F083';
  const tokenBridge = process.env.AVALANCHE_FUJI_TOKEN_BRIDGE_ADDRESS || '0x86F55A04690fd7815A3D802bD587e83eA888B239';
  const wormhole = process.env.AVALANCHE_FUJI_WORMHOLE_RELAYER_ADDRESS || '0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE';
  const circleMessageTransmitter = process.env.AVALANCHE_FUJI_CIRCLE_MESSAGE_TRANSMITTER || hre.ethers.constants.AddressZero;
  const circleTokenMessenger = process.env.AVALANCHE_FUJI_CIRCLE_TOKEN_MESSENGER || hre.ethers.constants.AddressZero;
  const USDC = process.env.AVALANCHE_FUJI_USDC_ADDRESS || hre.ethers.constants.AddressZero;

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

  const messengerAddress = "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf"; // contract address of the messenger on SenderOnCChain.sol on C-Chain

  const destinationBlockchainID = hre.ethers.utils.hexZeroPad('0x316fcc2056528c25a652ac1bdc12cd26d4e11631fd1225c23586be268b02885a', 32);
  const destinationAddress = '0xYourDestinationContractAddress';

  const hub = await upgrades.deployProxy(
    Hub,
    [constructorArgs, messengerAddress, destinationBlockchainID, destinationAddress],
    {
      initializer: "initialize",
    }
  );

  await hub.deployed();
  console.log("Hub deployed to:", hub.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying Hub:", error);
    process.exit(1);
  });
