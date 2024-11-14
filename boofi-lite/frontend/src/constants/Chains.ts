export const Base = {
  chainId: 8453,
  name: "Base",
  nativeCurrency: {
    name: "Base",
    symbol: "ETH",
    decimals: 18,
    iconUrls: "https://base.org/favicon.ico",
  },

  rpcUrls: [
    `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ],
  blockExplorerUrls: ["https://sepolia.basescan.org/"],
  chainName: "BaseSepolia",
  vanityName: "BaseSepolia",
  networkId: 8453,
  iconsUrls: ["https://base.org/favicon.ico"],
};

export const Avalanche = {
  chainId: 43114,
  name: "Avalanche",
  blockExplorerUrls: ["https://fuji.snowtrace.io/"],
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
    iconUrls: "https://avalanche.org/favicon.ico",
  },
  rpcUrls: [
    `https://avax-fuji.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ],
  vanityName: "AvalancheFuji",
  chainName: "AvalancheFuji",
  networkId: 43114,
  iconsUrls: ["https://avalanche.org/favicon.ico"],
};

export const Arbitrum = {
  chainId: 42161,
  name: "Arbitrum",
  nativeCurrency: {
    name: "Arbitrum",
    symbol: "ARB",
    decimals: 18,
    iconUrls: "https://arbitrum.org/favicon.ico",
  },
  rpcUrls: [
    `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ],
  blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
  vanityName: "ArbitrumSepolia",
  chainName: "ArbitrumSepolia",
  networkId: 42161,
  iconsUrls: ["https://arbitrum.org/favicon.ico"],
};
