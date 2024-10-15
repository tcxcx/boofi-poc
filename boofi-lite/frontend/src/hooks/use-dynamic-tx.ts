import { Wallet } from "@dynamic-labs/sdk-react-core";
import { NetworkConfigurationMap, EvmNetwork } from "@dynamic-labs/types";
import { getOrMapViemChain } from "@dynamic-labs/viem-utils";
import { Account, Chain, Hex, Transport, WalletClient, parseEther } from "viem";
import { useState } from "react";

/**
 * Sends a transaction from the user's wallet to a specified address.
 *
 * @param address - The recipient address.
 * @param amount - The amount to be sent.
 * @param wallet - The user's wallet object.
 * @param networkConfigurations - Configuration map for different networks.
 * @returns A promise that resolves to the transaction hash if successful, or undefined if an error occurs.
 */
export const useSendTransaction = () => {
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  );
  const [chain, setChain] = useState<Chain | undefined>(undefined);

  const sendTransaction = async (
    address: any,
    amount: string,
    wallet: Wallet,
    networkConfigurations: NetworkConfigurationMap
  ): Promise<void> => {
    try {
      // Get the wallet client from the connector
      const walletClient =
        wallet.connector.getWalletClient<
          WalletClient<Transport, Chain, Account>
        >();

      // Get the network ID the wallet is currently connected to
      const chainID = await wallet.connector.getNetwork();

      // Find the current network configuration using the chain ID
      const currentNetwork = networkConfigurations.evm?.find(
        (network) => Number(network.chainId) === chainID
      ) as EvmNetwork;

      if (!currentNetwork) {
        throw new Error("Network not found");
      }

      // Map the current network configuration to a Viem chain object
      const mappedChain = getOrMapViemChain(currentNetwork);
      setChain(mappedChain);

      // Create the transaction object
      const transaction = {
        account: wallet.address as Hex,
        to: address as Hex,
        chain: mappedChain,
        value: amount ? parseEther(amount) : undefined,
      };

      // Send the transaction using the wallet client
      const txHash = await walletClient.sendTransaction(transaction);
      setTransactionHash(txHash);
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "An unknown error occurred"
      );
    }
  };

  return { sendTransaction, transactionHash, chain };
};
