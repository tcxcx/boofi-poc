# 📜 Contract Deployments

## **Private Blockchain**
These contracts handle interchain messaging between the private subnet and the C-Chain:

- **Receiver on Subnet**  
  [ReceiverOnSubnet.sol](https://github.com/tcxcx/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/interchain-messaging/ReceiverOnSubnet.sol)  
  **Deployed Address**: `0x`  
  **Chain Explorer**: [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)


- **Sender on C-Chain**  
  [SenderOnCChain.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/interchain-messaging/SenderOnCChain.sol)  
  **Deployed Address**: `0x`  
  **Chain Explorer**: [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)


## **Money Market**
Core contracts for the Hub and Spoke architecture used for decentralized lending and liquidation management:

- **Lending Hub**  
  [Hub.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/lendingHub/Hub.sol)  
  **Deployed Address**: `0xHubAddress`  
  **Chain Explorer**: [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)

- **Asset Registry**  
  [AssetRegistry.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/lendingHub/AssetRegistry.sol)  
  **Deployed Address**: `0xAssetRegistryAddress`  
  **Chain Explorer**: [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)

- **Lending Spoke**  
  [Spoke.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/lendingSpoke/Spoke.sol)  
  **Deployed Address**: `0xSpokeAddress`  
  **Chain Explorers**: [Base Sepolia Explorer](https://base-sepolia.blockscout.com/)

- **Liquidator for Flash Loans**  
  [LiquidatorFlashLoan.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/evm/src/contracts/LiquidatorFlashLoan.sol)  
  **Deployed Address**: `0xLiquidatorFlashLoanAddress`  
  **Chain Explorer**: [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)


## **Payments**
Contracts supporting cross-chain payment capabilities:

- **Cross-Chain Receiver**  
  [CrossChainReceiver.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/new-contracts/src/CrossChainReceiver.sol)  
  **Deployed Address**: `0xCrossChainReceiverAddress`  
  **Chain Explorers**: [Base Sepolia Explorer](https://base-sepolia.blockscout.com/), [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)

- **Cross-Chain Sender**  
  [CrossChainSender.sol](https://github.com/boofi-poc/blob/private-blockchain/contracts/new-contracts/src/CrossChainSender.sol)  
  **Deployed Address**: `0xCrossChainSenderAddress`  
  **Chain Explorers**: [Base Sepolia Explorer](https://base-sepolia.blockscout.com/), [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)
