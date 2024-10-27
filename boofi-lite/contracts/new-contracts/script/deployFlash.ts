import { BytesLike, ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

const POOL_ADDRESS_PROVIDER = "0x8B9b2AF4afB389b4a70A474dfD4AdCD4a302bb40";
const USDC = "0x5425890298aed601595a70AB815c96711a31Bc65"; // USDC en Fuji
const AAVE_TOKEN = "0x3d2ee1AB8C3a597cDf80273C684dE0036481bE3a"; // AAVE token en Fuji

async function main() {
  const sourceProvider = new ethers.JsonRpcProvider(
    "https://api.avax-test.network/ext/bc/C/rpc"
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, sourceProvider);

  const senderJson = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        "../out/FlashLoanAndAutoStake.sol/FlashLoanAndLender.json"
      ),
      "utf8"
    )
  );
  const FlashLoanAndAutoStakeFactory = new ethers.ContractFactory(
    senderJson.abi,
    senderJson.bytecode,
    wallet
  );

  try {
    // Obtener la transacción de despliegue
    const deployTransaction = FlashLoanAndAutoStakeFactory.getDeployTransaction(
      POOL_ADDRESS_PROVIDER,
      USDC,
      AAVE_TOKEN
    );

    // Estimar el gas necesario

    const flashLoanAndAutoStake = await FlashLoanAndAutoStakeFactory.deploy(
      POOL_ADDRESS_PROVIDER,
      USDC,
      AAVE_TOKEN
    );
    await flashLoanAndAutoStake.waitForDeployment();

    console.log(
      `FlashLoanAndAutoStake desplegado en: ${flashLoanAndAutoStake.target}`
    );
  } catch (error: any) {
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
