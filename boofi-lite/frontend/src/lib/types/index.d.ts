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

  fromChain: string;
  setFromChain: (chainId: string) => void;

  toChain: string;
  setToChain: (chainId: string) => void;
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

    // Specific function names for each action
export type LendFunctionNames = 'depositCollateral' | 'depositCollateralNative';
export type WithdrawFunctionNames = 'withdrawCollateral' | 'withdrawCollateralNative';
export type BorrowFunctionNames = 'borrow' | 'borrowNative';
export type RepayFunctionNames = 'repay' | 'repayNative';

export interface TransferWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
    functionName: ValidFunctionNames;
    buttonText: string;
    argsExtra?: any[];
}

export interface TransactionHistoryItem {
  date: string;
  amount: number;
  status: string;
}


export interface UseTokenBalanceProps {
  tokenAddress: Address;
  chainId: number;
  accountAddress: Address;
  decimals: number;
}

export interface BalanceDisplayProps {
  balance: string;
  isLoading: boolean;
  symbol: string;
}

export interface ChainContextProps {
  fromChain: string;
  toChain: string;
  setFromChain: (chainId: string) => void;
  setToChain: (chainId: string) => void;
}

export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  image: string;
}

export interface ChainSelectProps {
  value: string;
  onChange: (value: string) => void;
  chains: ChainConfig[];
  label: string;
}


export type { TransactionError };


export interface TransactionDetails {
  transactionHash: string;
  peanutLink: string;
  paymentLink: string;
}

export interface CurrencyAddressInfo {
  address: string;
  hubContract: string;
  hubABI: any;
  spokeContract: string;
  spokeABI: any;
}

export type CurrencyAddresses = Record<
  number,
  Record<string, CurrencyAddressInfo>
>;


export interface LinkUiFormProps {
  tokenAmount: number;
  handleValueChange: (usdAmount: number, tokenAmount: number) => void;
  availableTokens: Record<string, string>;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  chainId: number | undefined;
  handleCreateLinkClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isPeanutLoading: boolean;
}

export interface TransactionDetailsDisplayProps {
  transactionDetails: TransactionDetails;
  chainId: number | undefined;
  handleCopy: (text: string, label: string) => void;
  handleShare: (platform: string) => void;
  truncateHash: (hash: string) => string;
}

export interface CurrencyDisplayerProps {
  tokenAmount: number;
  onValueChange: (usdAmount: number, tokenAmount: number) => void;
  initialAmount?: number;
  availableTokens: Record<string, string>;
  onTokenSelect: (token: string) => void;
  currentNetwork: number | null;
}

export interface AbstractTransaction {
  to: string;
  data?: string;
  value?: bigint;
}

export interface AbstractSigner {
  sendTransaction(tx: AbstractTransaction): Promise<{ hash: string }>;
  getAddress(): Promise<string>;
}

export interface OverlayPayNameProps {
  handleToggleOverlay: () => void;
  copyLink: () => void;
  link: string;
  shareOnWhatsApp: (localizedLink: string) => void;
  shareOnTelegram: (localizedLink: string) => void;
}

export interface BaseNameDialogAlertProps {
  translations: Translations["Home"];
  address: string;
}

export interface FramedQRCodeProps {
  image: string;
  copyLink?: () => void;
  link: string;
  frameText?: string;
}

