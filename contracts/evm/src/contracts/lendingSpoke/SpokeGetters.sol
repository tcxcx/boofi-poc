// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./SpokeState.sol";

/**
 * @title SpokeGetters
 * @notice A set of public getter functions
 */
contract SpokeGetters is SpokeState {
    function chainId() public view returns (uint16) {
        return _state.chainId;
    }

    function consistencyLevel() public view returns (uint8) {
        return _state.consistencyLevel;
    }

    function hubChainId() public view returns (uint16) {
        return _state.hubChainId;
    }

    function hubContractAddress() public view returns (address) {
        return _state.hubContractAddress;
    }

    function defaultGasLimitRoundtrip() public view returns (uint256) {
        return _state.defaultGasLimitRoundtrip;
    }
}
