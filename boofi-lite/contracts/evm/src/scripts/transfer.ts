import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Define el ABI como constante para que TypeScript pueda inferir los tipos
const spokeAbi = [
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
      { internalType: "bool", name: "withTokenTransfer", type: "bool" },
    ],
    name: "getDeliveryCostRoundtrip",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    returnType: "uint256",
  },
  // Puedes agregar aquí los demás métodos de tu contrato
]; // 'as const' permite que TypeScript infiera los tipos exactos
const erc20Abi = [
  // Minimal ABI to interact with ERC20 Token
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
];
async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const deployer = new ethers.Wallet(
    process.env.PRIVATE_KEY_baseSepolia!,
    provider
  );

  // Crear la interfaz y la instancia del contrato
  const contractAddress = "0xA8f6Db88D79bcA5F1990C93b6a6eA5866722d198";
  const contract = new ethers.Contract(contractAddress, spokeAbi, deployer);

  try {
    const usdcContract = new ethers.Contract(USDC, erc20Abi, deployer);
    const amountToApprove = ethers.parseUnits("100000", 6); // Assuming USDC has 6 decimals

    const approveTx = await usdcContract.approve(
      contractAddress,
      amountToApprove
    );
    await approveTx.wait();

    console.log("Approved", approveTx.hash);
    const estimateTxValue = await contract.getDeliveryCostRoundtrip(1n, true);
    console.log("Estimated tx value:", estimateTxValue.toString());

    // const depositCollateralTx = await contract.depositCollateral(
    //   USDC,
    //   ethers.parseUnits("100000", 0),
    //   ethers.parseUnits("0", 0),
    //   { value: ethers.parseUnits("100000000", 0) }
    // );
    // console.log("Transaction details:", depositCollateralTx);
  } catch (error) {
    console.error("Error estimating gas or sending transaction:", error);
  }
}

main();
