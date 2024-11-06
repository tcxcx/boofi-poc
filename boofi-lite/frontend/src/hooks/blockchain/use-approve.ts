import { ethers } from "ethers";
import { useEffect } from "react";
import { erc20Abi, Hex } from "viem";
export const useApprove = ({
  address,
  tokenAddress,
  chainId,
  signer,
  targetAddress,
  setApprove,
}: {
  address: Hex;
  tokenAddress: Hex;
  chainId: number;
  signer: ethers.Signer | undefined;
  targetAddress: Hex;
  setApprove: (approve: bigint) => void;
}) => {
  useEffect(() => {
    if (!signer || !address || !tokenAddress) return;

    const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

    async function getApprove() {
      try {
        const approve = await erc20Contract.approve(targetAddress, 1);
        const decimals = await erc20Contract.decimals();
        const formattedApprove = ethers.utils.formatUnits(approve, decimals);
        setApprove(BigInt(formattedApprove));
      } catch (error) {
        console.error("Error in getApprove", error);
      }
    }

    getApprove();
  }, [address, tokenAddress, chainId, signer, setApprove, targetAddress]);
};
