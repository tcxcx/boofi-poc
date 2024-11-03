import { RealtimeClient } from '@openai/realtime-api-beta';
// import { addConnectWalletTool } from './connectWallet';
// import { addDisconnectWalletTool } from './disconnectWallet';
// import { addGetAccountBalanceTool } from './getAccountBalance';
// import { addSendEthTool } from './sendEth';
import { getAccountBalanceTool } from './get-account-balance';
// import { addSwapUsdcForArsTool } from './swapUsdcForArs';
// import { addVerifyUsdcBalanceTool } from './verifyUsdcBalance';

export function importTools(client: RealtimeClient) {
//   addConnectWalletTool(client);
//   addDisconnectWalletTool(client);
//   addGetAccountBalanceTool(client);
//   addSendEthTool(client);
  getAccountBalanceTool(client as any);
//   addSwapUsdcForArsTool(client);
//   addVerifyUsdcBalanceTool(client);
  // Add more tools as needed
}
