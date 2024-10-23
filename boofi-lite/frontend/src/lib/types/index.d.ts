import type { Abi, Address, Hex } from 'viem';
import type { TransactionError } from '@coinbase/onchainkit/transaction';
import React from 'react';

export interface CurrencyInfo {
    address: string;
    borrowContract?: string;
    lendContract?: string;
    borrowABI?: any[];
    lendABI?: any[];
    decimals?: any;
  }

export interface FooterProps {
    isPlaying: boolean;
    togglePlay: () => void;
    playNextSong: () => void;
    playPreviousSong: () => void;
    currentSong: string;
  }


export interface NetworkSelectorProps {
    onSelect?: (chainId: string) => void;
    currentChainId: string;
  }

export interface StepItemProps {
  step: number
  title: string
  isCompleted: boolean
  isActive: boolean
  children: React.ReactNode
}

export interface ExtendedPaymentInfo {
    chainId: number | string;
    tokenSymbol: string;
    tokenAmount: string;
    senderAddress: string;
    claimed: boolean;
    depositDate: string;
    transactionHash?: string;
    depositIndex: number;
  }
  
  export interface IGetLinkDetailsResponse {
    link: string;
    chainId: string;
    depositIndex: number;
    contractVersion: string;
    password: string;
    sendAddress: string;
    tokenType: string;
    tokenAddress: string;
    tokenDecimals: number;
    tokenSymbol: string;
    TokenName: string;
    tokenAmount: string;
    tokenId: number;
    claimed: boolean;
    depositDate: string;
    tokenURI: string;
  }

export interface CustomLinkProps extends React.LinkHTMLAttributes<HTMLAnchorElement> {
    href: string;
  }
  
export interface PaymentInfoProps {
    paymentInfo: {
      chainId: number | string;
      tokenSymbol: string;
      tokenAmount: string;
      senderAddress: string;
      claimed: boolean;
      depositDate: string;
      transactionHash?: string;
      destinationChainId?: number;
      destinationChainName?: string;
    };
  }


type Call = {
  to: Address;
  data?: Hex;
  value?: bigint;
};

export interface TransactionWrapperPropsBase {
  chainId: number;
  onSuccess: (txHash: string) => void;
  onError: (error: TransactionError) => void;
  children: React.ReactNode;
}

export interface TransactionWrapperPropsWithCall
  extends TransactionWrapperPropsBase {
  call: Call;
}

export interface TransactionWrapperPropsWithContract
  extends TransactionWrapperPropsBase {
  contractAddress: `0x${string}`;
  abi: Abi;
  functionName: string;
  args: any[];
}

export type TransactionWrapperProps =
  | TransactionWrapperPropsWithCall
  | TransactionWrapperPropsWithContract;


export interface AuroraTitleProps {
  text: string;
  size?: string;
  letterSpacing?: string;
  backgroundColor?: string;
}

export interface MarketStore {
  currentViewTab: ViewTab;
  setCurrentViewTab: (tab: ViewTab) => void;
  
  selectedAsset: CurrencyInfo | null; 
  setSelectedAsset: (asset: CurrencyInfo) => void;
}

export interface AssetData {
  assetName: string;
  chains: string[];
  totalSupplied: number;
  totalSupplyAPY: number;
  amount: number;
  value: number;
}
export interface TabState {
  activeTab: 'moneyMarket' | 'paymentLink' | 'tokenSwap';
  setActiveTab: (tab: 'moneyMarket' | 'paymentLink' | 'tokenSwap') => void;
}

export interface APYData {
  baseAPY: number;
  bonusAPY: number;
  totalAPY: number;
}

export interface CurrencyInfo {
  address: string;
  hubContract?: string;
  spokeContract?: string;
  hubABI?: any[];
  spokeABI?: any[];
}


type ValidFunctionNames =
    | 'depositCollateral'
    | 'depositCollateralNative'
    | 'withdrawCollateral'
    | 'withdrawCollateralNative'
    | 'borrow'
    | 'borrowNative'
    | 'repay'
    | 'repayNative';

interface TransferWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
    functionName: ValidFunctionNames;
    buttonText: string;
    argsExtra?: any[];
}