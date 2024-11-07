import { wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";

const rpc =
  "https://base-sepolia.infura.io/v3/d80826b52dc64616b60d3e45082332f9";

export const getWh = () => {
  return wormhole("Testnet", [evm], {
    chains: {
      BaseSepolia: {
        rpc,
      },
    },
  });
};

export const TOKEN_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";
