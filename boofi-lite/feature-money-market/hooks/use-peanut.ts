import { useCallback, useState } from "react";
import peanut, {
  getRandomString,
  interfaces as peanutInterfaces,
  claimLinkGasless,
  claimLinkXChainGasless,
  prepareTxs,
  getLinksFromTx,
} from "@squirrel-labs/peanut-sdk";
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { getChainsForEnvironment } from "@/store/supportedChains";
import { useTransactionStore } from "@/store/transactionStore";
import { useToast } from "@/components/ui/use-toast";
import { PEANUT_API_URL } from "@/lib/constants";
import { parseEther } from "viem"; // Ensure viem is installed

const PEANUTAPIKEY = process.env.DEEZ_NUTS_API_KEY;
const next_proxy_url = PEANUT_API_URL;

if (!PEANUTAPIKEY) {
  throw new Error("Peanut API key not found in environment variables");
}

export const useDeezNuts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { setLoading, setError } = useTransactionStore();
  const { toast } = useToast();

  /**
   * Retrieves the chain configuration based on the current chain ID.
   */
  const getChainConfig = useCallback((chainId: number) => {
    const supportedChains = getChainsForEnvironment();
    const chainConfig = supportedChains.find((c: { id: number }) => c.id === chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return chainConfig;
  }, []);

  /**
   * Generates a random password string.
   */
  const generatePassword = useCallback(async () => {
    try {
      return await getRandomString(16);
    } catch (error) {
      console.error("Error generating password:", error);
      throw new Error("Error generating the password.");
    }
  }, []);

  /**
   * Waits for a transaction receipt with a specified timeout.
   */
  const waitForTransactionReceipt = useCallback(
    async (txHash: string, timeout = 60000): Promise<any> => {
      const startTime = Date.now();

      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const receipt = await fetch(
              `https://api.${next_proxy_url}/v1/transactions/${txHash}`
            ).then((res) => res.json());

            if (receipt) {
              clearInterval(interval);
              resolve(receipt);
            } else if (Date.now() - startTime > timeout) {
              clearInterval(interval);
              reject(
                new Error(
                  `Transaction ${txHash} was not mined within ${
                    timeout / 1000
                  } seconds`
                )
              );
            }
          } catch (error) {
            console.error("Error checking transaction receipt:", error);
            // Continue polling
          }
        }, 3000); // Poll every 3 seconds
      });
    },
    [next_proxy_url]
  );

  /**
   * Determines token details based on its address and chain ID.
   */
  const getTokenDetails = useCallback((tokenAddress: string, chainId: number | string) => {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      return { tokenType: 0, tokenDecimals: 18 }; // Native token (e.g., ETH)
    } else {
      return { tokenType: 1, tokenDecimals: 18 }; // ERC20 token (assuming 18 decimals)
    }
  }, []);

  /**
   * Generates link details required for creating a payment link.
   */
  const generateLinkDetails = useCallback(
    ({
      tokenValue,
      tokenAddress,
      chainId,
    }: {
      tokenValue: string;
      tokenAddress: string;
      chainId: number;
    }) => {
      try {
        const tokenDetails = getTokenDetails(tokenAddress, chainId);
        const baseUrl = `${window.location.origin}/claim`;

        const linkDetails: peanutInterfaces.IPeanutLinkDetails = {
          chainId: chainId.toString(),
          tokenAmount: parseFloat(Number(tokenValue).toFixed(6)),
          tokenType: tokenDetails.tokenType,
          tokenAddress: tokenAddress,
          tokenDecimals: tokenDetails.tokenDecimals,
          baseUrl: baseUrl,
          trackId: "ui",
        };

        return linkDetails;
      } catch (error) {
        console.error("Error generating link details:", error);
        throw new Error("Error getting the linkDetails.");
      }
    },
    [getTokenDetails]
  );

  /**
   * Prepares deposit transactions using the Peanut SDK.
   */
  const prepareDepositTxs = useCallback(
    async ({
      linkDetails,
      password,
    }: {
      linkDetails: peanutInterfaces.IPeanutLinkDetails;
      password: string;
    }) => {
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected.");
        }

        const userAddress = address as `0x${string}`;

        const prepareTxsResponse = await prepareTxs({
          address: userAddress,
          linkDetails: linkDetails,
          passwords: [password],
        });

        return prepareTxsResponse;
      } catch (error) {
        console.error("Error in prepareDepositTxs:", error);
        throw error;
      }
    },
    [isConnected, address]
  );

  /**
   * Creates a payment link by sending transactions and generating the link via Peanut SDK.
   */
  const createPayLink = useCallback(
    async (
      amount: string,
      tokenAddress: string,
      onInProgress?: () => void,
      onSuccess?: () => void,
      onFailed?: (error: Error) => void,
      onFinished?: () => void,
      isMultiChain: boolean = false,
      destinationChainId?: string
    ) => {
      setIsLoading(true);
      setLoading(true);
      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected.");
        }

        // Parse chainId from window.ethereum.chainId (hex to decimal)
        const chainIdHex = window.ethereum?.chainId;
        const chainId = chainIdHex ? parseInt(chainIdHex, 16) : 1; // Default to Ethereum Mainnet
        const chainConfig = getChainConfig(chainId);

        const linkDetails = generateLinkDetails({
          tokenValue: amount,
          tokenAddress,
          chainId,
        });

        const password = await generatePassword();

        const preparedTransactions = await prepareDepositTxs({
          linkDetails,
          password,
        });

        const transactionHashes: string[] = [];

        for (const unsignedTx of preparedTransactions.unsignedTxs) {
          const txHash = await sendTransactionAsync({
            to: unsignedTx.to as `0x${string}`,
            data: unsignedTx.data as `0x${string}`,
            value: unsignedTx.value
              ? parseEther(unsignedTx.value.toString())
              : undefined,
          });

          transactionHashes.push(txHash);
          onInProgress?.();
        }

        const lastTxHash = transactionHashes[transactionHashes.length - 1];

        // Wait for the last transaction to be mined
        const receipt = await waitForTransactionReceipt(lastTxHash);

        const { links } = await getLinksFromTx({
          linkDetails: linkDetails,
          passwords: [password],
          txHash: lastTxHash as `0x${string}`,
        });

        toast({
          title: "Link created successfully",
          description: "Your payment link has been created.",
        });
        onSuccess?.();
        return {
          transactionHash: lastTxHash,
          paymentLink: links[0],
        };
      } catch (error: any) {
        console.error("Error creating paylink:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        toast({
          title: "Error creating link",
          description: errorMessage,
          variant: "destructive",
        });
        onFailed?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        setLoading(false);
        onFinished?.();
      }
    },
    [
      isConnected,
      address,
      getChainConfig,
      generateLinkDetails,
      prepareDepositTxs,
      sendTransactionAsync,
      toast,
      waitForTransactionReceipt,
      setError,
      setLoading,
    ]
  );

  /**
   * Claims a payment link using the Peanut SDK.
   */
  const claimPayLink = useCallback(
    async (
      link: string,
      onInProgress?: () => void,
      onSuccess?: () => void,
      onFailed?: (error: Error) => void,
      onFinished?: () => void
    ) => {
      setIsLoading(true);
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected.");
        }

        const claimedLinkResponse = await claimLinkGasless({
          link,
          APIKey: PEANUTAPIKEY,
          recipientAddress: address as `0x${string}`,
          baseUrl: `https://api.peanut.to/claim-v2`,
        });
        console.log(claimedLinkResponse.txHash);
        toast({
          title: "Transaction sent, but not yet confirmed",
          description: `Your transaction was claimed with hash ${claimedLinkResponse.txHash}. This may take a few minutes to confirm.`,
          variant: "default",
        });
        onInProgress?.();
        onSuccess?.();

        return (
          claimedLinkResponse.transactionHash ??
          claimedLinkResponse.txHash ??
          claimedLinkResponse.hash ??
          claimedLinkResponse.tx_hash ??
          null
        );
      } catch (error: any) {
        console.error("Error claiming paylink:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        toast({
          title: "Error claiming link",
          description: errorMessage,
          variant: "destructive",
        });
        onFailed?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        setLoading(false);
        onFinished?.();
      }
    },
    [isConnected, address, toast, setError, setLoading]
  );

  /**
   * Claims a cross-chain payment link using the Peanut SDK.
   */
  const claimPayLinkXChain = useCallback(
    async (
      link: string,
      destinationChainId: string,
      destinationToken: string,
      onInProgress?: () => void,
      onSuccess?: () => void,
      onFailed?: (error: Error) => void,
      onFinished?: () => void
    ) => {
      setIsLoading(true);
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !address) {
          throw new Error("Wallet not connected.");
        }

        const claimedLinkResponse = await claimLinkXChainGasless({
          link,
          APIKey: PEANUTAPIKEY,
          recipientAddress: address as `0x${string}`,
          destinationChainId, // ID of the destination chain
          destinationToken,   // Address of the token on the destination chain
          isMainnet: true,
          slippage: 1,
        });

        console.log(claimedLinkResponse.txHash);
        toast({
          title: "Cross-chain transaction sent",
          description: `Your transaction was claimed with hash ${claimedLinkResponse.txHash}. This may take a few minutes to confirm.`,
          variant: "default",
        });
        onInProgress?.();
        onSuccess?.();

        return claimedLinkResponse.txHash;
      } catch (error: any) {
        console.error("Error claiming cross-chain paylink:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        toast({
          title: "Error claiming cross-chain link",
          description: errorMessage,
          variant: "destructive",
        });
        onFailed?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        setLoading(false);
        onFinished?.();
      }
    },
    [isConnected, address, toast, setError, setLoading]
  );

  /**
   * Copies a given link to the clipboard.
   */
  const copyToClipboard = useCallback(
    (link: string) => {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast({
            title: "Link copied",
            description: "The link has been copied to your clipboard.",
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast({
            title: "Failed to copy",
            description: "An error occurred while copying the link.",
            variant: "destructive",
          });
        });
    },
    [toast]
  );

  /**
   * Truncates a hash for display purposes.
   */
  const truncateHash = useCallback(
    (hash: string | undefined | null): string => {
      if (!hash) return "";
      if (hash.length > 10) {
        return `${hash.slice(0, 7)}...${hash.slice(-4)}`;
      }
      return hash;
    },
    []
  );

  return {
    isLoading,
    currentChainId: window.ethereum ? parseInt(window.ethereum.chainId, 16) : null, // Simplified chain ID retrieval
    address,
    createPayLink,
    claimPayLinkXChain,
    claimPayLink,
    copyToClipboard,
    truncateHash,
    // Optionally expose sendTransaction if needed elsewhere
  };
};
