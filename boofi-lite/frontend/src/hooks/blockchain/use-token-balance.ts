import { ethers } from "ethers";
import { useEffect } from "react";
import { erc20Abi, Hex } from "viem";
export const useTokenBalance = ({
  address,
  tokenAddress,
  chainId,
  signer,
  setBalance,
}: {
  address: Hex;
  tokenAddress: Hex;
  chainId: number;
  signer: ethers.Signer | undefined;
  setBalance: (balance: string) => void;
}) => {
  useEffect(() => {
    if (!signer || !address || !tokenAddress) return;

    const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

    async function getBalance() {
      try {
        const balance = await erc20Contract.balanceOf(address);
        const decimals = await erc20Contract.decimals();
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        setBalance(formattedBalance);
      } catch (error) {
        console.error("Error al obtener el balance:", error);
      }
    }

    getBalance();
  }, [address, tokenAddress, chainId, signer, setBalance]);
};
