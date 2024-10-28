export type CurrencyAddresses = {
  [chainId: number]: {
    USDC: {
      address: string;
      hubContract: string;
      hubABI: any;
      spokeContract: string;
      spokeABI: any;
    };
  };
};
