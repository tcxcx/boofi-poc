export interface Token {
  chainId: number;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  image: string | null;
}

export interface SupportedChain {
  chainId: string;
  chain: string;
  tokens: Token[];
}

export const supportedBridgeTokensDictionary: SupportedChain[] = [
  {
    chainId: "1",
    chain: "Ethereum",
    tokens: [
      {
        chainId: 1,
        name: "Ethereum",
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      },
      {
        chainId: 1,
        name: "USD Coin",
        symbol: "USDC",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
        image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
      },
      // Add more tokens as needed
    ],
  },
  {
    chainId: "11155111",
    chain: "Ethereum Sepolia",
    tokens: [
      {
        chainId: 11155111,
        name: "USD Coin",
        symbol: "USDC",
        address: "0x45Df5e83B9400421cb3B262b31ee7236b61219D5",
        decimals: 6,
        image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
      },
      {
        chainId: 11155111,
        name: "Tether",
        symbol: "USDT",
        address: "0x523C8591Fbe215B5aF0bEad65e65dF783A37BCBC",
        decimals: 6,
        image: "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png",
      },
      {
        chainId: 11155111,
        name: "Dai",
        symbol: "DAI",
        address: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
        decimals: 18,
        image: "https://assets.coingecko.com/coins/images/9956/large/4943.png",
      },
      // Add more tokens as needed
    ],
  },
  // Add other chains similarly
];
