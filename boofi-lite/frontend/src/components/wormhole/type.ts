import {
  Chain,
  ChainAddress,
  ChainContext,
  Network,
  Signer,
} from "@wormhole-foundation/sdk";

export interface SignerStuff<N extends Network, C extends Chain = Chain> {
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}
