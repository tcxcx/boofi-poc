// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../HubSpokeStructs.sol";

/**
 * @title SpokeStorage
 * @notice Contract defining state variables for the Spoke contract
 */
contract SpokeStorage {
    struct State {
        uint16 chainId;
        // number of confirmations for wormhole messages
        uint8 consistencyLevel;
        uint16 hubChainId;
        address hubContractAddress;
        uint256 defaultGasLimitRoundtrip;
        bool isUsingCCTP;
        // @dev storage gap
        uint256[50] ______gap;
    }
}

/**
 * @title SpokeState
 * @notice Contract holding state variable for the Spoke contract
 */
contract SpokeState {
    SpokeStorage.State _state;
}
