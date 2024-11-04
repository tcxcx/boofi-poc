// frontend/src/hooks/peanut-protocol/use-create-link.ts

"use client";

import peanut, { interfaces } from "@squirrel-labs/peanut-sdk";
import { useMutation } from "@tanstack/react-query";
import { useEthersSigner } from "@/lib/wagmi/wagmi";
import { useAccount, useSwitchChain } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { useLocalLinkStorage } from "@/hooks/peanut-protocol/use-local-link-storage";

type UseCreateLinkParams = {
  chainId?: number;
  token: any;
};

const useCreateLink = ({ chainId, token }: UseCreateLinkParams) => {
  console.log("useCreateLink hook called with:", { chainId, token });

  const signer = useEthersSigner({ chainId });
  console.log("useEthersSigner:", { signer });

  const { chain } = useAccount();
  console.log("useAccount chain:", chain);

  const { toast } = useToast();
  console.log("useToast initialized");

  const { switchChainAsync } = useSwitchChain();
  console.log("useSwitchChain initialized");

  const [, { add }] = useLocalLinkStorage();
  console.log("useLocalLinkStorage initialized");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ amount, token }: { amount: string; token: any }) => {
      console.log("mutationFn called with:", { amount, token });

      if (!chainId) {
        console.warn("No chainId provided");
        toast({
          title: "Chain ID Missing",
          description: "Please provide a valid chain ID.",
          variant: "destructive",
        });
        throw new Error("Chain ID Missing");
      }

      if (chainId !== chain?.id) {
        console.log("Current chain ID:", chain?.id, "Switching to desired chain ID:", chainId);
        try {
          await switchChainAsync({ chainId });
          console.log("Successfully switched to chain ID:", chainId);
        } catch (switchError) {
          console.error("Failed to switch chain:", switchError);
          toast({
            title: "Chain Switch Failed",
            description: `Failed to switch to chain ID ${chainId}.`,
            variant: "destructive",
          });
          throw switchError; // Re-throw to be caught in the caller
        }
      } else {
        console.log("Already on the desired chain ID:", chainId);
      }

      if (!signer) {
        console.warn("No signer available. User might not be logged in.");
        toast({
          title: "Signer Missing",
          description: "You need to be logged in to create a link.",
          variant: "destructive",
        });
        throw new Error("Signer Missing");
      }

      let tokenType: interfaces.EPeanutLinkType = interfaces.EPeanutLinkType.erc20;
      console.log("Initial tokenType:", tokenType);

      if (token.isNative) {
        tokenType = interfaces.EPeanutLinkType.native;
        console.log("Token is native. Updated tokenType:", tokenType);
      }

      let linkDetails: interfaces.IPeanutLinkDetails = {
        chainId: chainId.toString(),
        tokenAmount: Number(amount),
        tokenType,
        tokenDecimals: token.decimals,
      };
      console.log("linkDetails:", linkDetails);

      if (tokenType === interfaces.EPeanutLinkType.erc20) {
        linkDetails.tokenAddress = token.address;
        console.log("ERC20 Token Address added to linkDetails:", linkDetails.tokenAddress);
      }

      const createParams: interfaces.ICreateLinkParams = {
        structSigner: {
          signer: signer,
        },
        linkDetails,
      };
      console.log("createParams:", createParams);

      let link = "";
      let txHash = "";

      try {
        console.log("Calling peanut.createLink with createParams...");
        const res = await peanut.createLink(createParams);
        console.log("peanut.createLink response:", res);

        link = res.link;
        txHash = res.txHash;

        console.log("Link and TxHash extracted:", { link, txHash });

        // Add the link to local storage
        console.log("Adding link to local storage");
        add({
          sender: signer._address,
          link,
          txHash,
          linkDetails: createParams.linkDetails,
        });
        console.log("Link added to local storage");

        return link;
      } catch (error) {
        console.error("Error in peanut.createLink:", error);
        toast({
          title: "An error occurred",
          description: "Failed to create the payment link.",
          variant: "destructive",
        });
        throw error; // Re-throw to be handled by the caller
      }
    },
    onSuccess: (data) => {
      console.log("Mutation onSuccess with data:", data);
    },
    onError: (error) => {
      console.error("Mutation onError:", error);
    },
    onSettled: () => {
      console.log("Mutation onSettled");
    },
  });

  console.log("useMutation initialized with mutateAsync and isPending:", { mutateAsync, isPending });

  return {
    createLink: mutateAsync,
    loading: isPending,
    signer, 
  };
};

export default useCreateLink;
