// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../teleporter/interface/ITeleporterMessenger.sol";
import "../../teleporter/interface/ITeleporterReceiver.sol";

contract ReceiverOnSubnet is ITeleporterReceiver {
    ITeleporterMessenger public immutable messenger = ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);
    
    struct HubAction {
        string actionType;
        address vault;
        address assetAddress;
        uint256 amount;
        uint256 timestamp;
    }

    HubAction[] public actions;

    constructor(address _messengerAddress) {
        messenger = ITeleporterMessenger(_messengerAddress);
    }

    function receiveTeleporterMessage(
        bytes32, // sourceBlockchainID
        address, // originSenderAddress
        bytes calldata message
    ) external override {
        require(msg.sender == address(messenger), "ReceiverOnSubnet: Unauthorized Messenger");
        _processMessage(message);
    }

    function _processMessage(bytes calldata message) internal {
        (string memory actionType, address vault, address assetAddress, uint256 amount, uint256 timestamp) = abi.decode(
            message,
            (string, address, address, uint256, uint256)
        );

        actions.push(HubAction({
            actionType: actionType,
            vault: vault,
            assetAddress: assetAddress,
            amount: amount,
            timestamp: timestamp
        }));

        emit ActionRecorded(actionType, vault, assetAddress, amount, timestamp);
    }

    event ActionRecorded(string actionType, address indexed vault, address indexed assetAddress, uint256 amount, uint256 timestamp);
}
