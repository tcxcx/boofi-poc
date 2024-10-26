import { ethers, formatUnits } from "ethers";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export const GetAllowance = async (
  tokenAddress: string,
  spender: string,
  account: string
) => {
  console.log(tokenAddress, "account");
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account as `0x${string}`, spender as `0x${string}`],
  });
  console.log(data, "data");

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });
  console.log(decimals, "decimals");

  const formattedAllowance = formatUnits(data as bigint, decimals);
  console.log(formattedAllowance, "formattedAllowance");
  return formattedAllowance;
};
