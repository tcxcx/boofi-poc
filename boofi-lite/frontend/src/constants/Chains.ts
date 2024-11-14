export const Base = {
  id: 8453,
  name: "Base",
  nativeCurrency: {
    name: "Base",
    symbol: "ETH",
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: [
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ],
    },
  },
};

export const Avalanche = {
  id: 43114,
  name: "Avalanche",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        `https://avax-fuji.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ],
    },
  },
};

export const Arbitrum = {
  id: 42161,
  name: "Arbitrum",
  nativeCurrency: {
    name: "Arbitrum",
    symbol: "ARB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ],
    },
  },
};
