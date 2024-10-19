export enum Action {
    Deposit = 0,
    Borrow = 1,
    Withdraw = 2,
    Repay = 3,
    DepositNative = 4,
    RepayNative = 5,
  }
  
  export interface ConstructorArgs {
    // Wormhole Information
    wormhole: string;
    tokenBridge: string;
    wormholeRelayer: string;
    consistencyLevel: number;
  
    // Liquidation Information
    interestAccrualIndexPrecision: number;
    liquidationFee: number;
    liquidationFeePrecision: number;
  
    // CCTP Information
    circleMessageTransmitter: string;
    circleTokenMessenger: string;
    USDC: string;
  }
  
  export interface AccrualIndices {
    deposited: number;
    borrowed: number;
  }
  
  export interface DenormalizedVaultAmount {
    deposited: number;
    borrowed: number;
  }
  
  export interface StoredVaultAmount {
    amounts: DenormalizedVaultAmount;
    accrualIndices: AccrualIndices;
  }
  
  export interface PayloadData {
    action: Action;
    sender: string;
    wrappedAsset: string;
    amount: number;
    unwrap: boolean;
  }
  
  export interface CrossChainTarget {
    addressWhFormat: string;
    chainId: number;
    deliveryHash: string;
  }
  
  export interface HubState {
    consistencyLevel: number;
    vault: {
      [vaultOwner: string]: {
        [assetAddress: string]: StoredVaultAmount;
      };
    };
    totalAssets: {
      [assetAddress: string]: StoredVaultAmount;
    };
    indices: {
      [assetAddress: string]: AccrualIndices;
    };
    lastActivityBlockTimestamps: {
      [assetAddress: string]: number;
    };
    interestAccrualIndexPrecision: number;
    liquidationCalculator: string; // Address of ILiquidationCalculator
    priceUtilities: string; // Address of IHubPriceUtilities
    assetRegistry: string; // Address of IAssetRegistry
    liquidationFee: number;
    defaultGasLimit: number;
    refundGasLimit: number;
    isUsingCCTP: boolean;
    liquidationFeePrecision: number;
  }
  