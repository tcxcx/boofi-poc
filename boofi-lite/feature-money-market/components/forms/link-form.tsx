"use client";

import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  XIcon,
} from "lucide-react";
import { Chain } from "viem/chains";
import CurrencyDisplayer from "@/components/currency";
import { Button } from "@/components/ui/button";
import { FadeText } from "@/components/magicui/fade-text";
import { AnimatePresence, motion } from "framer-motion";
import { QRCode } from "react-qrcode-logo";
import SentTable from "@/components/tables/sent-table";
import { useDeezNuts } from "@/hooks/use-peanut";
import { useMiniPayDeezNuts } from "@/hooks/use-minipay-links";
import { useWindowSize } from "@/hooks/use-window-size";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { getNetwork, useUserWallets } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { getBlockExplorerUrl } from "@/utils/index";
import { config } from "@/store/wagmi";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { ToastAction } from "@/components/ui/toast";
import confetti from "canvas-confetti";
import { celo, celoAlfajores } from "viem/chains";
import { useAuthStore } from "@/store/authStore";

interface TransactionDetails {
  transactionHash: string;
  peanutLink: string;
  paymentLink: string;
}

export default function LinkForm() {
  const { isMiniPay, setCurrentChainId } = useAuthStore();

  const { createPayLink, isLoading: isPeanutLoading } = isMiniPay
    ? useMiniPayDeezNuts()
    : useDeezNuts();

  const { copyToClipboard, truncateHash } = useDeezNuts();

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [showSentTable, setShowSentTable] = useState(false);
  const [isMultiChain, setIsMultiChain] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [currentNetwork, setCurrentNetwork] = useState<Chain | null>(null);
  const { width } = useWindowSize();
  const userWallets = useUserWallets();
  const isMobile = width && width <= 768;
  const { toast } = useToast();
  const [currentText, setCurrentText] = useState<string>("");
  const [destinationChainId, setDestinationChainId] = useState<string | null>(
    null
  );
  const [destinationToken, setDestinationToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetwork = async () => {
      if (isMiniPay) {
        const celoNetwork =
          process.env.NEXT_PUBLIC_USE_TESTNET === "true" ? celoAlfajores : celo;
        setCurrentNetwork(celoNetwork);
        setCurrentChainId(celoNetwork.id);
        console.log("Setting network for MiniPay:", celoNetwork);
      } else if (userWallets.length > 0) {
        const networkId = await getNetwork(userWallets[0].connector);
        if (networkId) {
          const chain = config.chains.find((chain) => chain.id === networkId);
          if (chain) {
            setCurrentNetwork(chain);
            setCurrentChainId(chain.id);
          }
        }
      }
    };
    fetchNetwork();
  }, [userWallets, isMiniPay, setCurrentChainId]);

  const handleCreateLinkClick = async (e: any) => {
    e.preventDefault();
    setOverlayVisible(true);

    if (!currentNetwork) {
      console.error("No network selected");
      return;
    }

    try {
      let tokenAddress = "0x0000000000000000000000000000000000000000";
      if (selectedToken !== "ETH") {
        tokenAddress =
          currencyAddresses[currentNetwork.id]?.[selectedToken] || tokenAddress;
      }

      setCurrentText("In Progress...");
      const link = await createPayLink(
        tokenAmount.toString(),
        tokenAddress,
        () => setCurrentText("In Progress..."),
        () => setCurrentText("Success!"),
        (error) => setCurrentText(`Failed: ${error.message}`),
        () => setCurrentText("Spooky Crypto Finance Made Easy!")
      );
      setTransactionDetails(link as TransactionDetails);

      // Trigger confetti emoji animation
      const scalar = 4;
      const unicorn = confetti.shapeFromText({ text: "👻", scalar });

      const defaults = {
        spread: 360,
        ticks: 60,
        gravity: 0,
        decay: 0.96,
        startVelocity: 20,
        shapes: [unicorn],
        scalar,
      };

      const shoot = () => {
        confetti({
          ...defaults,
          particleCount: 30,
        });

        confetti({
          ...defaults,
          particleCount: 5,
        });

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
    } finally {
      setOverlayVisible(true);
    }
  };

  const handleViewMovementsClick = () => {
    setShowSentTable(!showSentTable);
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
      window.open(
        `https://wa.me/?text=${encodeURIComponent(url || "")}`,
        "_blank"
      );
    } else if (platform === "telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url || "")}`,
        "_blank"
      );
    }
  };

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);

    // Trigger confetti emoji animation
    const scalar = 4;
    const unicorn = confetti.shapeFromText({ text: "💸👻💸", scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [unicorn],
      scalar,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
      });

      confetti({
        ...defaults,
        particleCount: 5,
      });

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

    toast({
      title: "Copied to clipboard!",
      description: `${label} has been copied to clipboard.`,
      action: <ToastAction altText="Spooky">👻</ToastAction>,
    });
  };

  return (
    <section className="mx-auto h-full flex flex-col items-center">
      <div className="flex w-full md:h-[300px] lg:h-[400px] flex-col justify-between rounded-2xl border bg-background">
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xl">💸👻💸</span>
            <span>You are sending</span>
          </div>
          <CurrencyDisplayer
            tokenAmount={tokenAmount}
            onValueChange={handleValueChange}
            availableTokens={
              currentNetwork ? currencyAddresses[currentNetwork.id] : {}
            }
            onTokenSelect={setSelectedToken}
            currentNetwork={currentNetwork?.id || null}
            isMiniPay={isMiniPay}
          />
        </div>
      </div>
      <div className="flex justify-between w-full space-x-2">
        <Button
          size={"lg"}
          className="mt-5 flex items-center gap-2 self-end w-full"
          onClick={handleCreateLinkClick}
          variant={"fito"}
          disabled={isPeanutLoading}
        >
          <span>Create Link 👻</span>
        </Button>
      </div>
      {overlayVisible && (
        <div className="animate-in fade-in-0 fixed inset-0 z-50 bg-white/90">
          <div className="relative flex size-full items-center justify-center">
            <button
              className="absolute right-4 top-4"
              onClick={handleCloseOverlay}
            >
              <XIcon className="size-6" />
            </button>
            <div className="flex flex-col items-center gap-10">
              <AnimatePresence mode="wait">
                <FadeText
                  key="currentText"
                  className="text-center text-4xl bg-gradient-to-b from-indigo-300 to-indigo-900/80 bg-clip-text font-semibold leading-none text-transparent dark:from-indigo-600 dark:to-slate-900/10"
                  direction="up"
                  framerProps={{ show: { transition: { delay: 0.2 } } }}
                  text={currentText}
                />
              </AnimatePresence>
              {transactionDetails ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex w-full  flex-col justify-between rounded-2xl border bg-white p-5">
                    <div
                      className="flex justify-center mb-4 cursor-pointer"
                      onClick={() =>
                        handleCopy(
                          transactionDetails.paymentLink,
                          "Payment Link"
                        )
                      }
                    >
                      <QRCode
                        value={transactionDetails.paymentLink}
                        qrStyle="fluid"
                        eyeRadius={100}
                        size={200}
                      />
                    </div>

                    <div className="flex justify-center text-xs text-primary mb-4">
                      {" "}
                      Share crypto with a link to your friends and family
                    </div>
                    <div className="flex justify-center gap-4 mb-4 mx-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare("whatsapp")}
                        className="text-xs px-4"
                      >
                        <Image
                          src="/icons/whatsapp.svg"
                          alt="WhatsApp"
                          width={24}
                          height={24}
                        />
                        Share on Whatsapp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare("telegram")}
                        className="text-xs px-4"
                      >
                        <Image
                          src="/icons/telegram.png"
                          alt="Telegram"
                          width={24}
                          height={24}
                        />
                        Share on Telegram
                      </Button>
                    </div>

                    {isMultiChain && destinationChainId && (
                      <div className="flex justify-center text-xs text-primary mb-4">
                        <span>Destination Chain: {destinationChainId}</span>
                      </div>
                    )}

                    <div className="mt-2 flex h-16 items-center border-t text-xs">
                      <div className="mx-5 flex w-full items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-semibold flex items-center">
                            Transaction Hash:
                          </span>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() =>
                              handleCopy(
                                transactionDetails.transactionHash,
                                "Transaction Hash"
                              )
                            }
                          >
                            {truncateHash(transactionDetails.transactionHash)}
                          </Button>
                        </div>
                        {currentNetwork && transactionDetails && (
                          <div className="flex items-center">
                            <Link
                              href={`${getBlockExplorerUrl(
                                currentNetwork
                              )}/tx/${transactionDetails.transactionHash}`}
                              target="_blank"
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="px-2"
                              >
                                View in Blockscout
                                <ChevronRightIcon className="ml-1 size-4" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="my-5 flex justify-center gap-5 items-center">
                    <Button
                      size={"lg"}
                      className="flex items-center gap-2"
                      onClick={() =>
                        handleCopy(
                          transactionDetails.paymentLink,
                          "Payment Link"
                        )
                      }
                    >
                      Copy Link
                      <CopyIcon className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="size-8 animate-spin fill-neutral-600 text-neutral-200 dark:text-neutral-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showSentTable && <SentTable />}
    </section>
  );
}
