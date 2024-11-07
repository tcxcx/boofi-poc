import {
  Chain,
  ChainAddress,
  Network,
  TokenAddress,
  TokenId,
  TokenTransfer,
  Wormhole,
  amount as amountSdk,
  signSendWait,
} from "@wormhole-foundation/sdk";

import { SignerStuff } from "./type";
import { getEvmSigner, getSignerStuff } from "./evm-signer";

import { getWh, TOKEN_ADDRESS } from "./config";
import { useEthersSigner } from "@/lib/wagmi/wagmi";

export async function tokenBridge(amount: number, address: string) {
  const wh = await getWh();
  const ethChain = wh.getChain("Avalanche");
  const destinationChain = wh.getChain("BaseSepolia");
  const tb = await ethChain.getTokenBridge();
  console.log(tb, "tb");
  const automatic = false;
  const nativeGas = automatic ? "1" : undefined;
  const roundTrip: boolean = false;
  // const tokenAddress = "0x5425890298aed601595a70AB815c96711a31Bc65";
  const ethSigner = getEvmSigner(address, ethChain.chain);
  const destinationSigner = getEvmSigner(address, destinationChain.chain);
  const token = Wormhole.tokenId(ethChain.chain, TOKEN_ADDRESS);

  const ethSignerStuff = getSignerStuff(ethSigner, ethChain);
  const destinationSignerStuff = getSignerStuff(
    destinationSigner,
    destinationChain
  );
  const transfer = tb.transfer(
    ethSignerStuff?.address.address,
    destinationSignerStuff?.address,
    token.address,
    BigInt(100000)
  );

  const decimals = Number(await wh.getDecimals(token.chain, token.address));
  //  const destinationSignerStuff = getSignerStuff(ethSigner, destinationChain);
  const xfer = await tokenTransfer(wh, {
    token,
    amount: BigInt(1000000),
    source: ethSignerStuff,
    destination: destinationSignerStuff,
    delivery: {
      automatic,
      nativeGas: nativeGas
        ? amountSdk.units(amountSdk.parse(nativeGas, decimals))
        : undefined,
    },
    payload: undefined,
  });
  console.log({ xfer });
}

async function tokenTransfer<N extends Network>(
  wh: Wormhole<N>,
  route: {
    token: TokenId;
    amount: bigint;
    source: SignerStuff<N, Chain>;
    destination: SignerStuff<N, Chain>;
    delivery?: {
      automatic: boolean;
      nativeGas?: bigint;
    };
    payload?: Uint8Array;
  }
) {
  const xfer = await wh.tokenTransfer(
    route.token,
    route.amount,
    route.source.address,
    route.destination.address,
    route.delivery?.automatic ?? false,
    route.payload,
    route.delivery?.nativeGas
  );

  const quote = await TokenTransfer.quoteTransfer(
    wh,
    route.source.chain,
    route.destination.chain,
    xfer.transfer
  );
  console.log({ quote });

  if (xfer.transfer.automatic && quote.destinationToken.amount < 0)
    throw "The amount requested is too low to cover the fee and any native gas requested.";

  await xfer.initiateTransfer(route.source.signer);
}
