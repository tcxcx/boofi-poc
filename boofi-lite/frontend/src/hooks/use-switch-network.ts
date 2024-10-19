import { useCallback } from "react";
import { useSwitchChain } from "wagmi";
import { useAuthStore } from "@/store/authStore";
import { celoAlfajores } from "viem/chains";

export const useNetworkSwitching = () => {
  const { switchChainAsync } = useSwitchChain();
  const { currentChainId, setCurrentChainId, isMiniPay } = useAuthStore();

  const switchNetwork = useCallback(
    async (chainId?: any) => {
      const targetChainId = isMiniPay ? celoAlfajores.id : chainId;

      if (currentChainId !== targetChainId) {
        try {
          await switchChainAsync({ chainId: targetChainId });
          setCurrentChainId(targetChainId);
        } catch (error) {
          console.error("Error switching network:", error);
          throw new Error("Error switching network.");
        }
      }
    },
    [currentChainId, switchChainAsync, setCurrentChainId, isMiniPay]
  );

  return { switchNetwork };
};
