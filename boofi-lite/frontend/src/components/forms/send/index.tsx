// SendPayment.tsx

import { useState } from "react";
import { useDeezNuts } from "@/hooks/use-peanut";
import { useWindowSize } from "@/hooks/use-window-size";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import UiForm from "@/components/forms/send/ui-form";
import { TransactionDetails } from "@/lib/types";
import { currencyAddresses } from "@/utils/currencyAddresses";

export default function SendPayment() {
  const { address, isConnected } = useAccount();
  const defaultChainId = 84532; // Base Sepolia chain ID
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const { width } = useWindowSize();
  const isMobile = width && width <= 768;

  const { createPayLink, isLoading: isPeanutLoading, copyToClipboard, truncateHash } = useDeezNuts();

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>("ETH");

  const availableTokens = {
    USDC: currencyAddresses[defaultChainId]?.USDC.address || "",
    ETH: "0x0000000000000000000000000000000000000000",
  };

  const handleSendPaymentClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOverlayVisible(true);

    if (!chainId || chainId !== defaultChainId) {
      try {
        await switchChain({ chainId: defaultChainId });
      } catch (error) {
        toast({
          title: "Network Switch Failed",
          description: "Please switch to the Base Sepolia network to send a payment.",
          variant: "destructive",
        });
        setOverlayVisible(false);
        return;
      }
    }

    try {
      const tokenAddress = availableTokens[selectedToken as keyof typeof availableTokens];
      if (!tokenAddress) throw new Error(`Token ${selectedToken} is not supported on this network.`);

      setTransactionDetails({ /* Transaction details object */ } as TransactionDetails);
    } catch (error: any) {
      toast({
        title: "Error Sending Payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOverlayVisible(true);
    }
  };

  const handleCloseOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <section className="mx-auto h-full flex flex-col items-center">
      <UiForm
        tokenAmount={tokenAmount}
        handleValueChange={(usdAmount, tokenAmount) => {
          setUsdAmount(usdAmount);
          setTokenAmount(tokenAmount);
        }}
        availableTokens={availableTokens}
        setSelectedToken={setSelectedToken}
        chainId={defaultChainId}
        handleCreateLinkClick={handleSendPaymentClick}
        isPeanutLoading={isPeanutLoading}
      />
    </section>
  );
}
