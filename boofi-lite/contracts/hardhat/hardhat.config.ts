import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@tenderly/hardhat-tenderly";
import * as dotenv from 'dotenv';
import "@nomiclabs/hardhat-ethers";

dotenv.config();
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');


// Network-specific private keys
const PRIVATE_KEY_baseSepolia = process.env.PRIVATE_KEY_baseSepolia || "";
const PRIVATE_KEY_opSepolia = process.env.PRIVATE_KEY_opSepolia || "";
const PRIVATE_KEY_sepolia = process.env.PRIVATE_KEY_sepolia || "";
const PRIVATE_KEY_arbitrumSepolia = process.env.PRIVATE_KEY_arbitrumSepolia || "";
const PRIVATE_KEY_avalanche_fuji = process.env.PRIVATE_KEY_avalanche_fuji || "c2d37b4d296048a0696e3960d9f2637308f1804a122479fafee3850ebdd4842e";

// Validate private keys
if (!PRIVATE_KEY_baseSepolia) {
  throw new Error("Please set your PRIVATE_KEY_baseSepolia in the .env file");
}
if (!PRIVATE_KEY_opSepolia) {
  throw new Error("Please set your PRIVATE_KEY_opSepolia in the .env file");
}
if (!PRIVATE_KEY_sepolia) {
  throw new Error("Please set your PRIVATE_KEY_sepolia in the .env file");
}
if (!PRIVATE_KEY_arbitrumSepolia) {
  throw new Error("Please set your PRIVATE_KEY_arbitrumSepolia in the .env file");
}

if (!PRIVATE_KEY_avalanche_fuji) {
  throw new Error("Please set your PRIVATE_KEY_avalanche_fuji in the .env file");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src/contracts", 
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      chainId: 84532,
      accounts: [PRIVATE_KEY_baseSepolia],
    },
    "op-sepolia": {
      url: process.env.OP_SEPOLIA_RPC_URL || "",
      chainId: 11155420,
      accounts: [PRIVATE_KEY_opSepolia],
    },
    "sepolia": {
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: [PRIVATE_KEY_sepolia],
    },
    "arb-sepolia": {
      url: process.env.ARB_SEPOLIA_RPC_URL || "",
      chainId: 421614,
      accounts: [PRIVATE_KEY_arbitrumSepolia],
    },
    "fuji": {
      url: process.env.AVALANCHE_FUJI_RPC_URL || "",
      chainId: 43113,
      accounts: [PRIVATE_KEY_avalanche_fuji],
    },
    hardhat: {
      // Remove forking configuration if not needed
      // If you need forking, ensure the URL is correct and the block number is valid
      // forking: {
      //   url: process.env.BASE_SEPOLIA_RPC_URL || "",
      //   blockNumber: 12345678, // Optional: Specify a block number for consistent state
      // },
      // Additional hardhat network settings can be added here
    },
  },
  tenderly: {
    username: "criptopoeta",
    project: "boofi",
  },
  // Optional: Etherscan configuration for additional verifications
  // etherscan: {
  //   apiKey: {
  //     "base-sepolia": process.env.ETHERSCAN_API_KEY,
  //     "op-sepolia": process.env.OPTIMISM_ETHERSCAN_API_KEY,
  //     "sepolia": process.env.ETHEREUM_ETHERSCAN_API_KEY,
  //     "arb-sepolia": process.env.ARBITRUM_ETHERSCAN_API_KEY,
  //   },
  // },
};

export default config;
