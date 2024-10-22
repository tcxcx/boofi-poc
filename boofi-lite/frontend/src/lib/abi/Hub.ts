// /abis/hubAbi.ts
export const hubAbi = [
  {
    type: 'function',
    name: 'getVaultAmounts',
    stateMutability: 'view',
    inputs: [
      { name: 'vaultOwner', type: 'address' },
      { name: 'assetAddress', type: 'address' },
    ],
    outputs: [
      {
        components: [
          { name: 'deposited', type: 'uint256' },
          { name: 'borrowed', type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
  },
  {
    type: 'function',
    name: 'getGlobalAmounts',
    stateMutability: 'view',
    inputs: [
      { name: 'assetAddress', type: 'address' },
    ],
    outputs: [
      {
        components: [
          { name: 'deposited', type: 'uint256' },
          { name: 'borrowed', type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
  },
] as const;
