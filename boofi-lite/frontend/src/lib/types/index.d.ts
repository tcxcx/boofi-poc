export interface CurrencyInfo {
    address: string;
    borrowContract?: string;
    lendContract?: string;
    borrowABI?: any[];
    lendABI?: any[];
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


export interface TransactionWrapperProps {
    contractAddress: Address;
    abi: any;
    functionName: string;
    args: any[];
    chainId: number;
    onSuccess: (hash: string) => void;
    onError: (error: TransactionError) => void;
    children: any;
  }

export interface AuroraTitleProps {
  text: string;
  size?: string;
  letterSpacing?: string;
  backgroundColor?: string;
}

export interface MarketStore {
  currentViewTab: ViewTab;
  setCurrentViewTab: (tab: ViewTab) => void;
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
  activeTab: 'moneyMarket' | 'paymentLink';
  setActiveTab: (tab: 'moneyMarket' | 'paymentLink') => void;
}

export interface APYData {
  baseAPY: number;
  bonusAPY: number;
  totalAPY: number;
}