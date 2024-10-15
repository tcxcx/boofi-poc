interface CurrencyInfo {
  address: string;
  borrowContract?: string;
  lendContract?: string;
  borrowABI?: any[];
  lendABI?: any[];
}

export const currencyAddresses: Record<number, Record<string, string | CurrencyInfo>> = {
  1: {
    // Ethereum Mainnet
    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48", // Example USDC address
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  10: {
    // Optimism
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Example USDC address
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  },
  11155111: {
    // Sepolia Testnet
    USDC: {
      address: "0x45Df5e83B9400421cb3B262b31ee7236b61219D5",
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    DAI: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
    USDT: "0x523C8591Fbe215B5aF0bEad65e65dF783A37BCBC",
  },
  11155420: {
    // Optimism Sepolia
    USDC: {
      address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    USDT: "0x4bA3A5ab2EC0C9C45F153374fbcb05a1526C4a01",
  },
  8453: {
    // Base Mainnet
    USDC: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
  84532: {
    // Base Sepolia
    USDC: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      borrowContract: "0xYourBorrowContractAddress",
      lendContract: "0xYourLendContractAddress",
      borrowABI: [/* Your Borrow ABI */],
      lendABI: [/* Your Lend ABI */],
    },
    USDT: "0x73b4a58138CCcBDa822dF9449FeDA5eaC6669ebD",
  },

};
