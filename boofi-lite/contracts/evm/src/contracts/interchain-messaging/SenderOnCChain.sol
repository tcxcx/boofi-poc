// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../teleporter/interface/ITeleporterMessenger.sol";

contract SenderOnCChain {
    ITeleporterMessenger public immutable messenger = ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);

    constructor(address _messengerAddress) {
        messenger = ITeleporterMessenger(_messengerAddress);
    }

    function sendMessage(address destinationAddress, string calldata message) external {
        messenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: bytes32(hex"316fcc2056528c25a652ac1bdc12cd26d4e11631fd1225c23586be268b02885a"),
                destinationAddress: destinationAddress,
                feeInfo: TeleporterFeeInfo({feeTokenAddress: address(0), amount: 0}),
                requiredGasLimit: 100000,
                allowedRelayerAddresses: new address[](0),
                message: abi.encode(message)
            })
        );
    }
}
