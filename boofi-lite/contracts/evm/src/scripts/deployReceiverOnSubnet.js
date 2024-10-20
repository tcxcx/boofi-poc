const { ethers } = require("hardhat");

async function main() {
  const ReceiverOnSubnet = await ethers.getContractFactory("ReceiverOnSubnet");

  const messengerAddress = "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf";

  const receiver = await ReceiverOnSubnet.deploy(messengerAddress);

  await receiver.deployed();
  console.log("ReceiverOnSubnet deployed to:", receiver.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
