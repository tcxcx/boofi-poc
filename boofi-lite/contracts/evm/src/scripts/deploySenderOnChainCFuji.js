const { ethers } = require("hardhat");

async function main() {
  const SenderOnCChain = await ethers.getContractFactory("SenderOnCChain");

  const messengerAddress = "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf"; // Replace with actual address of TeleporterMessenger.sol on Fuji

  const sender = await SenderOnCChain.deploy(messengerAddress);

  await sender.deployed();
  console.log("SenderOnCChain deployed to:", sender.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
