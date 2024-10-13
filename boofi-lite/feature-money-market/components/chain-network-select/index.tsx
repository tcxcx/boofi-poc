import React, { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount, useSwitchChain, useChains } from "wagmi";
import { supportedBridgeTokensDictionary, SupportedChain, Token } from "@/data/supportedBridgeTokensDictionary";
import { TokenChip } from "@coinbase/onchainkit/token";
import { useToast } from "@/components/ui/use-toast";

interface NetworkSelectorProps {
  onSelect?: (chainId: string) => void;
  currentChainId: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  onSelect,
  currentChainId,
}) => {
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const chains = useChains(); // Corrected usage
  const { toast } = useToast();
  const [currentNetwork, setCurrentNetwork] = useState<{
    id: number;
    name: string;
  } | null>(null);

  /**
   * Updates the current network based on the connected account's chain.
   */
  const updateCurrentNetwork = useCallback(() => {
    if (isConnected && address) {
      const chainIdHex = window.ethereum?.chainId;
      const chainId = chainIdHex ? parseInt(chainIdHex, 16) : null;
      if (chainId) {
        const chain = chains.find((c: any) => c.id === chainId);
        if (chain) {
          setCurrentNetwork({ id: chain.id, name: chain.name });
        } else {
          setCurrentNetwork(null);
        }
      }
    } else {
      setCurrentNetwork(null);
    }
  }, [isConnected, address, chains]);

  useEffect(() => {
    updateCurrentNetwork();
    // Add event listeners for chain changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", updateCurrentNetwork);
      return () => {
        window.ethereum.removeListener("chainChanged", updateCurrentNetwork);
      };
    }
  }, [updateCurrentNetwork]);

  /**
   * Handles network selection and switches the network using Wagmi's switchChain.
   */
  const handleNetworkChange = useCallback(
    async (networkId: string) => {
      const selectedChainId = parseInt(networkId, 10);
      const selectedChain = chains.find((chain: any) => chain.id === selectedChainId);
      const supportedChain = supportedBridgeTokensDictionary.find(
        (chain: SupportedChain) => parseInt(chain.chainId, 10) === selectedChainId
      );

      if (selectedChain && supportedChain) {
        try {
          // Type Casting if necessary
          await switchChain(selectedChainId as any);
          setCurrentNetwork({ id: selectedChain.id, name: selectedChain.name });
          onSelect?.(networkId);
          toast({
            title: "Network switched",
            description: `Switched to ${selectedChain.name}.`,
          });
        } catch (error: any) {
          console.error("Error switching chain:", error);
          toast({
            title: "Error switching network",
            description: error.message || "An error occurred while switching networks.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Unsupported network",
          description: "The selected network is not supported.",
          variant: "destructive",
        });
      }
    },
    [chains, switchChain, onSelect, toast]
  );

  /**
   * Filters out the current chain from the available chains.
   */
  const availableChains = supportedBridgeTokensDictionary.filter(
    (chain: SupportedChain) => chain.chainId !== currentChainId
  );

  /**
   * Selects a representative token for the given chain.
   * Here, we choose the first token as the representative.
   * You can modify this logic to select a specific token if needed.
   */
  const getRepresentativeToken = useCallback((chain: SupportedChain): Token => {
    // Choose the first token as the representative
    // Alternatively, implement logic to select a specific token
    return chain.tokens[0];
  }, []);

  return (
    <div className="w-full">
      <Select
        onValueChange={handleNetworkChange}
        value={currentNetwork?.id.toString() || ""}
        disabled={!isConnected} // Disable if not connected
      >
        <SelectTrigger className="w-full border-transparent flex justify-between">
          <SelectValue>
            {currentNetwork ? (
              <div className="flex items-center">
                {/* Use TokenChip to display the representative token */}
                {(() => {
                  const supportedChain = supportedBridgeTokensDictionary.find(
                    (chain: SupportedChain) => chain.chainId === currentNetwork.id.toString()
                  );
                  if (supportedChain) {
                    const token = getRepresentativeToken(supportedChain);
                    return (
                      <TokenChip
                        token={{
                          address: token.address as `0x${string}` | '',
                          chainId: token.chainId as number,
                          symbol: token.symbol as string,
                          name: token.name as string,
                          decimals: token.decimals as number,
                          image: token.image as string | '',
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                <span className="ml-2">{currentNetwork.name}</span>
              </div>
            ) : (
              "Select Destination Chain"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available Chains</SelectLabel>
            {availableChains.map((chain: SupportedChain) => {
              const chainIdNumber = parseInt(chain.chainId, 10);
              const token = getRepresentativeToken(chain);
              return (
                <SelectItem key={chain.chainId} value={chain.chainId}>
                  {/* Use TokenChip to display the representative token */}
                  <TokenChip
                    token={{
                      address: token.address as `0x${string}` | '',
                      chainId: token.chainId as number,
                      symbol: token.symbol as string,
                      name: token.name as string,
                      decimals: token.decimals as number,
                      image: token.image as string | '',
                    }}
                  />
                  <span className="ml-2">
                    {chain.chain.charAt(0).toUpperCase() + chain.chain.slice(1)}
                  </span>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NetworkSelector;
