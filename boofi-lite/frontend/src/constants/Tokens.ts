import type { Token } from "@/lib/types/index";
import { Hex } from "viem";
import { Avalanche, Base, Arbitrum } from "./Chains";

export const AvalancheTokens: Token[] = [
  {
    address: "" as Hex,
    chainId: 43113,
    decimals: 18,
    name: "Avax",
    payable: false,
    symbol: "AVA",
    image:
      "https://bafybeihfbjhiz5rytxcug7l7ymu6veyam5dcdrmqevz2jkepsgec6xobgi.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZ5YmVpaGZiamhpejVyeXR4Y3VnN2w3eW11NnZleWFtNWRjZHJtcWV2ejJqa2Vwc2dlYzZ4b2JnaSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyOTE5NTczMiwic3ViIjoiSVBGUy10b2tlbiJ9.Or8FYayDjxvOSgW-ZjTLYksp9-0fXa7pKmKFQPUNZL4",
  },
  {
    address: "0x5425890298aed601595a70AB815c96711a31Bc65" as Hex,
    chainId: 43113,
    decimals: 6,
    name: "USDC",
    payable: true,
    symbol: "USDC",
    image:
      "https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png",
  },
];

export const BaseTokens: Token[] = [
  {
    address: "" as Hex,
    chainId: 84532,
    decimals: 18,
    name: "Ethereum",
    payable: false,
    symbol: "ETH",
    image:
      "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  },
  {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Hex,
    chainId: 84532,
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
    payable: true,
    image:
      "https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png",
  },
];
