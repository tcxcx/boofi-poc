const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Registering Spoke contracts with Hub from account:", deployer.address);
    console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

    const hubAddress = process.env.HUB_CONTRACT_ADDRESS;
    const spokeContracts = {
        baseSepolia: {
            chainId: process.env.BASE_SEPOLIA_CHAIN_ID,
            address: process.env.BASE_SEPOLIA_SPOKE_ADDRESS
        },
    };

    if (!hubAddress) {
        throw new Error("Hub contract address not set in environment variables");
    }

    const Hub = await hre.ethers.getContractAt("Hub", hubAddress);
    
    for (const network in spokeContracts) {
        const { chainId, address } = spokeContracts[network];

        if (!chainId || !address) {
            console.log(`Skipping ${network}, missing chainId or spoke address.`);
            continue;
        }

        console.log(`Registering Spoke for ${network}: chainId=${chainId}, address=${address}`);

        const tx = await Hub.registerSpoke(parseInt(chainId, 10), address);
        await tx.wait();

        console.log(`Spoke registered for ${network}: chainId=${chainId}, address=${address}`);
    }

    console.log("All spokes have been registered successfully.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error registering spokes:", error);
        process.exit(1);
    });
