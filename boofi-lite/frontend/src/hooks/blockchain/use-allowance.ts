import { ethers } from "ethers";
import { useEffect } from "react";
import { erc20Abi, Hex } from "viem";
export const useAllowance = ({
  address,
  tokenAddress,
  chainId,
  signer,
  targetAddress,
  setAllowance,
}: {
  address: Hex;
  tokenAddress: Hex;
  chainId: number;
  signer: ethers.Signer | undefined;
  targetAddress: Hex;
  setAllowance: (allowance: bigint) => void;
}) => {
  useEffect(() => {
    if (!signer || !address || !tokenAddress || !targetAddress) return;

    const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

    async function getAllowance() {
      try {
        const allowance = await erc20Contract.allowance(address, targetAddress);
        const decimals = await erc20Contract.decimals();
        const formattedAllowance = ethers.utils.formatUnits(
          allowance,
          decimals
        );
        setAllowance(BigInt(formattedAllowance));
      } catch (error) {
        console.error("Error in getAllowance", error);
      }
    }

    getAllowance();
  }, [address, tokenAddress, chainId, signer, setAllowance, targetAddress]);
};
