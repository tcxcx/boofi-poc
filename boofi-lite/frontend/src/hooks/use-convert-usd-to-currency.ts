import { useLocale } from "next-intl";
import { createPublicClient, http, formatUnits } from "viem";
import { base, celo, optimism } from "viem/chains";

// ABI for Chainlink price feed contracts
const priceFeedABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Price feed contract addresses
const priceFeedAddresses: Record<
  string,
  { address: `0x${string}`; chain: typeof base | typeof celo | typeof optimism }
> = {
  BRL: { address: "0x0b0E64c05083FdF9ED7C5D3d8262c4216eFc9394", chain: base },
  INR: { address: "0x85d4Ec34339478F73c153710B19f2D5C402dce6F", chain: celo },
  EUR: { address: "0xc91D87E81faB8f93699ECf7Ee9B44D11e1D53F0F", chain: base },
  JPY: {
    address: "0x536944c3A71FEb7c1E5C66Ee37d1a148d8D8f619",
    chain: optimism,
  },
};

export async function convertUSDToCurrency(
  usdAmount: number,
  targetCurrency: "BRL" | "INR" | "EUR" | "JPY"
): Promise<number> {
  const { address, chain } = priceFeedAddresses[targetCurrency];

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const [, answer] = (await client.readContract({
    address,
    abi: priceFeedABI,
    functionName: "latestRoundData",
  })) as [bigint, bigint, bigint, bigint, bigint];

  const exchangeRate = Number(formatUnits(answer, 8));
  return usdAmount * exchangeRate;
}
