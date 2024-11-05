import {
  SignAndSendSigner,
  UnsignedTransaction,
  Chain,
  ChainContext,
  Network,
  Wormhole,
} from "@wormhole-foundation/sdk";
import { SignerStuff } from "./type";

import { sendTransaction } from "@wagmi/core";
import { useWagmiConfig } from "@/lib/wagmi/wagmi";

export function getEvmSigner(
  address: string,
  chain: "BaseSepolia" | "Avalanche"
): SignAndSendSigner<"Testnet", typeof chain> {
  return {
    chain: () => chain,
    address: () => address,
    signAndSend: async (txs: UnsignedTransaction[]) => {
      const txids: string[] = [];

      for (const txn of txs) {
        const { description, transaction } = txn;
        console.log(`Signing ${description}`);

        const txid = await sendTransaction(useWagmiConfig(), {
          data: transaction.data,
          to: transaction.to,
        });

        if (!txid)
          throw new Error(
            "Could not determine if transaction was sign and sent"
          );

        txids.push(txid);
      }

      return txids;
    },
  };
}

export function getSignerStuff<N extends Network, C extends Chain>(
  signer: SignAndSendSigner<N, C>,
  chain: ChainContext<N, C>
): SignerStuff<N, C> {
  return {
    signer,
    chain,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}
