// useDeezNuts.ts

import { useCallback, useState } from "react";
import peanut, {
  getRandomString,
  interfaces as peanutInterfaces,
  claimLinkGasless,
  claimLinkXChainGasless,
  prepareTxs,
  getLinksFromTx,
} from "@squirrel-labs/peanut-sdk";
import { useAccount, useChainId } from "wagmi";
import { getChainsForEnvironment } from "@/store/supportedChains";
import { useTransactionStore } from "@/store/transactionStore";
import { useToast } from "@/components/ui/use-toast";
import { AbstractSigner, AbstractTransaction } from '@/lib/types';
import { currencyAddresses } from "@/utils/currencyAddresses";
import { useEthersSigner } from "@/lib/wagmi/wagmi";

const PEANUTAPIKEY = process.env.NEXT_PUBLIC_DEEZ_NUTS_API_KEY;
if (!PEANUTAPIKEY) {
  throw new Error("Peanut API key not found in environment variables");
}



export const useDeezNuts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { setLoading, setError } = useTransactionStore();
  const { toast } = useToast();
  const signer = useEthersSigner({ chainId });

  /**
   * Retrieves the chain configuration based on the current chain ID.
   */
  const getChainConfig = useCallback((chainId: number) => {
    const supportedChains = getChainsForEnvironment();
    console.log("Retrieving chain configuration for Chain ID:", chainId);
    const chainConfig = supportedChains.find((c: { id: number }) => c.id === chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    console.log("Chain configuration found:", chainConfig);
    return chainConfig;
  }, []);

  /**
   * Generates a random password string.
   */
  const generatePassword = useCallback(async () => {
    try {
      console.log("Generating random password for transaction...");
      const password = await getRandomString(16);
      console.log("Password generated:", password);
      return password;
    } catch (error) {
      console.error("Error generating password:", error);
      throw new Error("Error generating the password.");
    }
  }, []);

  /**
   * Determines token details based on its address.
   */
  const getTokenDetails = useCallback((tokenAddress: string) => {
    console.log("Getting token details for tokenAddress:", tokenAddress);
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      return { tokenType: 0, tokenDecimals: 18 }; // Native token (e.g., ETH)
    } else if (
      tokenAddress.toLowerCase() ===
      currencyAddresses[chainId]?.USDC.address.toLowerCase()
    ) {
      return { tokenType: 1, tokenDecimals: 6 }; // USDC
    } else {
      // Add other ERC20 tokens here if needed
      return { tokenType: 1, tokenDecimals: 18 }; // Default ERC20
    }
  }, [chainId]);

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
        console.log(
          "Generating link details with tokenValue:",
          tokenValue,
          "tokenAddress:",
          tokenAddress
        );
        const tokenDetails = getTokenDetails(tokenAddress);
        const baseUrl = `${window.location.origin}/claim`;

        const linkDetails: peanutInterfaces.IPeanutLinkDetails = {
          chainId: chainId.toString(),
          tokenAmount: parseFloat(
            Number(tokenValue).toFixed(tokenDetails.tokenDecimals)
          ),
          tokenType: tokenDetails.tokenType,
          tokenAddress: tokenAddress,
          tokenDecimals: tokenDetails.tokenDecimals,
          baseUrl: baseUrl,
          trackId: "ui",
        };
        console.log("Generated link details:", linkDetails);
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
        console.log(
          "Preparing deposit transactions with linkDetails:",
          linkDetails
        );
        if (!isConnected || !address) {
          throw new Error("Wallet not connected.");
        }

        const userAddress = address as `0x${string}`;

        const prepareTxsResponse = await peanut.prepareTxs({
          address: userAddress,
          linkDetails: linkDetails,
          passwords: [password],
        });
        console.log("Prepared deposit transactions:", prepareTxsResponse);
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
      chainId: number,
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

        if (!signer) {
          throw new Error("No signer available");
        }

        const chainConfig = getChainConfig(chainId || 84532);

        const linkDetails = generateLinkDetails({
          tokenValue: amount,
          tokenAddress,
          chainId: chainConfig.id,
        });

        const password = await generatePassword();

        const preparedTransactions = await prepareDepositTxs({
          linkDetails: linkDetails,
          password: password,
        });

        const transactionHashes: string[] = [];
        console.log("Sending prepared transactions...");

        for (const unsignedTx of preparedTransactions.unsignedTxs) {
          const abstractTx: AbstractTransaction = {
            to: unsignedTx.to as string,
            data: unsignedTx.data as string,
            value: unsignedTx.value ? BigInt(unsignedTx.value.toString()) : undefined,
          };

          console.log("Sending abstract transaction:", abstractTx);

          const txResponse = await signer.sendTransaction(abstractTx);
          const txHash = txResponse.hash;
          console.log("Transaction sent, txHash:", txHash);
          transactionHashes.push(txHash);
          onInProgress?.();
        }
      
        const { links } = await peanut.getLinksFromTx({
          linkDetails: linkDetails,
          passwords: [password],
          txHash: transactionHashes[
            transactionHashes.length - 1
          ] as `0x${string}`,
        });

        toast({
          title: "Link created successfully",
          description: "Your payment link has been created.",
        });
        onSuccess?.();
        return {
          transactionHash: transactionHashes[transactionHashes.length - 1],
          paymentLink: links[0],
        };
      } catch (error: any) {
        console.error("Error creating pay link:", error);
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
        console.log("Pay link creation process completed.");
      }
    },
    [
      isConnected,
      address,
      signer,
      getChainConfig,
      generateLinkDetails,
      prepareDepositTxs,
      toast,
      setError,
      setLoading,
      getTokenDetails,
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

        const claimedLinkResponse = await peanut.claimLinkGasless({
          link,
          APIKey: PEANUTAPIKEY as string,
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

        const claimedLinkResponse = await peanut.claimLinkXChainGasless({
          link,
          APIKey: PEANUTAPIKEY as string,
          recipientAddress: address as `0x${string}`,
          destinationChainId, // ID of the destination chain
          destinationToken, // Address of the token on the destination chain
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
    address,
    createPayLink,
    claimPayLink,
    claimPayLinkXChain,
    copyToClipboard,
    truncateHash,
    currentChainId: chainId,
  };
};
