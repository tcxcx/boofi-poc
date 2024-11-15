export const Base = {
  chainId: 84532,
  name: "Base",
  nativeCurrency: {
    name: "Base",
    symbol: "ETH",
    decimals: 18,
    iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
  },
  rpcUrls: [
    `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,

  ],
  blockExplorerUrls: ["https://base-sepolia.blockscout.com"],
  chainName: "BaseSepolia",
  vanityName: "Base Sepolia",
  networkId: 84532,
  iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
};

export const Avalanche = {
  chainId: 43113,
  name: "Avalanche",
  blockExplorerUrls: ["https://fuji.snowtrace.io/"],
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
    iconUrls: ["https://app.dynamic.xyz/assets/networks/avax.svg"],
  },
  rpcUrls: ["https://rpc.ankr.com/avalanche_fuji"],
  vanityName: "Avalanche Fuji",
  chainName: "AvalancheFuji",
  networkId: 43113,
  iconUrls: ["https://app.dynamic.xyz/assets/networks/avax.svg"],
};

export const Arbitrum = {
  chainId: 421614,
  name: "Arbitrum",
  nativeCurrency: {
    name: "Arbitrum",
    symbol: "ARB",
    decimals: 18,
    iconUrls: ["https://app.dynamic.xyz/assets/networks/arbitrum.svg"],
  },
  rpcUrls: [
    `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ],
  blockExplorerUrls: ["https://sepolia-explorer.arbitrum.io/"],
  vanityName: "Arbitrum Sepolia",
  chainName: "ArbitrumSepolia",
  networkId: 421614,
  iconUrls: ["https://app.dynamic.xyz/assets/networks/arbitrum.svg"],
};
