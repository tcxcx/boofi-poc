import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
//import "@tenderly/hardhat-tenderly";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-foundry";


dotenv.config();
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

// Network-specific private keys
const PRIVATE_KEY_baseSepolia = process.env.PRIVATE_KEY_baseSepolia || "";
const PRIVATE_KEY_avalanche_fuji = process.env.PRIVATE_KEY_avalanche_fuji || "";

// Validate private keys

if (!PRIVATE_KEY_avalanche_fuji) {
  throw new Error(
    "Please set your PRIVATE_KEY_avalanche_fuji in the .env file"
  );
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.19",
      },
      {
        version: "0.8.25",
      },
    ],
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

    fuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL || "",
      chainId: 43113,
      accounts: [PRIVATE_KEY_avalanche_fuji],
    },
    privateBlockchain: {
      url: "​http://127.0.0.1:9650/ext/bc/boofiTest/rpc",
      chainId: 1996,
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
  /*
  tenderly: {
    username: "criptopoeta",
    project: "boofi",
  }
  */
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    currency: "USD",
    trackGasDeltas: true
  }
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
