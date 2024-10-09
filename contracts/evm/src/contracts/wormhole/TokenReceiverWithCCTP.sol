// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {TokenReceiver} from "@wormhole-upgradeable/WormholeRelayerSDK.sol";
import {CCTPReceiver} from "@wormhole-upgradeable/CCTPBase.sol";

abstract contract TokenReceiverWithCCTP is CCTPReceiver, TokenReceiver {
    /**
     * @dev Overriding the superclasses' function to choose whether to use CCTP or not, based on the implemented
     * `isUsingCCTP` function
     * @param payload - the payload received
     * @param additionalVaas - any wormhole VAAs received
     * @param sourceAddress - the source address of the tokens
     * @param sourceChain - the source chain of the tokens
     * @param deliveryHash - the delivery hash of the tokens
     */
    function receiveWormholeMessages(
          bytes memory payload,
          bytes[] memory additionalVaas,
          bytes32 sourceAddress,
          uint16 sourceChain,
          bytes32 deliveryHash
    ) public virtual override(TokenReceiver, CCTPReceiver) payable {
        if (messageWithCCTP(payload)) {
            _receiveWormholeMessagesWithCCTP(payload, additionalVaas, sourceAddress, sourceChain, deliveryHash);
        } else {
            _receiveWormholeMessages(payload, additionalVaas, sourceAddress, sourceChain, deliveryHash);
        }
    }

    /**
     * @dev Virtual function to decode `payload` and determine if using CCTP or not
     * @param payload - the payload received
     */
    function messageWithCCTP(bytes memory payload) internal view virtual returns (bool);
}