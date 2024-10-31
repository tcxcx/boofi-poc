// LinkForm.tsx

import { useState, useMemo } from "react";
import { useDeezNuts } from "@/hooks/use-peanut";
import { useWindowSize } from "@/hooks/use-window-size";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import SentTable from "@/components/tables/sent-table";
import UiForm from "./ui-form";
import Overlay from "./overlay";
import { TransactionDetails } from "@/lib/types";
import { currencyAddresses } from "@/utils/currencyAddresses";

import confetti from "canvas-confetti";

export default function LinkForm() {
  const { address, isConnected } = useAccount();
  const defaultChainId = 84532;
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const { width } = useWindowSize();
  const isMobile = width && width <= 768;

  const {
    createPayLink,
    isLoading: isPeanutLoading,
    copyToClipboard,
    truncateHash,
  } = useDeezNuts();

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [showSentTable, setShowSentTable] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [currentText, setCurrentText] = useState<string>("");

  const availableTokens = {
    USDC: currencyAddresses[defaultChainId]?.USDC.address || "",
    ETH: "0x0000000000000000000000000000000000000000",
  };

  const handleCreateLinkClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOverlayVisible(true);

    // Ensure we are on Base Sepolia (ID: 84532) before proceeding
    if (!chainId || chainId !== defaultChainId) {
      console.log("Current chain ID:", chainId, "Switching to Base Sepolia network (ID: 84532)...");
      try {
        await switchChain({ chainId: defaultChainId });
        console.log("Successfully switched to Base Sepolia network.");
      } catch (error) {
        console.error("Failed to switch network:", error);
        toast({
          title: "Network Switch Failed",
          description: "Please switch to the Base Sepolia network to create a payment link.",
          variant: "destructive",
        });
        setOverlayVisible(false);
        return;
      }
    }


    try {
      const tokenAddress = availableTokens[selectedToken as keyof typeof availableTokens];
      if (!tokenAddress) {
        throw new Error(`Token ${selectedToken} is not supported on this network.`);
      }

      setCurrentText("In Progress...");
      console.log("Calling createPayLink with tokenAmount:", tokenAmount, "and token:", selectedToken);

      const linkResponse = await createPayLink(
        tokenAmount.toString(),
        tokenAddress,
        defaultChainId,
        () => setCurrentText("In Progress..."),
        () => setCurrentText("Success!"),
        (error: Error) => setCurrentText(`Failed: ${error.message}`),
        () => setCurrentText("Spooky Crypto Finance Made Easy!")
      );

      // Assuming linkResponse has the structure { paymentLink: string, transactionHash: string }
      setTransactionDetails(linkResponse as TransactionDetails);
      console.log("Payment link created successfully:", linkResponse);

      // Trigger confetti animation
      triggerConfetti("👻");
    } catch (error: any) {
      console.error("Error creating pay link:", error);
      toast({
        title: "Error Creating Pay Link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOverlayVisible(true);
      console.log("Overlay set to visible after link creation attempt.");
    }
  };

  const handleCloseOverlay = () => {
    setOverlayVisible(false);
  };

  const handleValueChange = (usdAmount: number, tokenAmount: number) => {
    setUsdAmount(usdAmount);
    setTokenAmount(tokenAmount);
  };

  const handleShare = (platform: string) => {
    const url = transactionDetails?.paymentLink;
    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(url || "")}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url || "")}`, "_blank");
    }
  };

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    triggerConfetti("💸👻💸");

    toast({
      title: "Copied to clipboard!",
      description: `${label} has been copied to clipboard.`,
    });
  };

  const triggerConfetti = (emoji: string) => {
    const scalar = 4;
    const confettiEmoji = confetti.shapeFromText({ text: emoji, scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [confettiEmoji],
      scalar,
    };

    const shoot = () => {
      confetti({ ...defaults, particleCount: 30 });
      confetti({ ...defaults, particleCount: 5 });
      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  return (
    <section className="mx-auto h-full flex flex-col items-center">
      <UiForm
        tokenAmount={tokenAmount}
        handleValueChange={handleValueChange}
        availableTokens={availableTokens}
        setSelectedToken={setSelectedToken}
        chainId={defaultChainId}
        handleCreateLinkClick={handleCreateLinkClick}
        isPeanutLoading={isPeanutLoading}
      />
      {overlayVisible && (
        <Overlay
          handleCloseOverlay={handleCloseOverlay}
          currentText={currentText}
          transactionDetails={transactionDetails}
          chainId={defaultChainId}
          handleCopy={handleCopy}
          handleShare={handleShare}
          truncateHash={truncateHash}
        />
      )}
      {showSentTable && <SentTable />}
    </section>
  );
}
