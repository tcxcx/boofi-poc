import { avalancheFuji } from "wagmi/chains";
// /abis/spokeAbi.ts
export const spokeAbi = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "depositCollateral",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "depositCollateralNative",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "withdrawCollateral",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
      { internalType: "bool", name: "unwrap", type: "bool" },
    ],
    name: "withdrawCollateralNative",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "borrow",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
      { internalType: "bool", name: "unwrap", type: "bool" },
    ],
    name: "borrowNative",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "assetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "repay",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "costForReturnDelivery",
        type: "uint256",
      },
    ],
    name: "repayNative",
    outputs: [{ internalType: "uint64", name: "sequence", type: "uint64" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;
