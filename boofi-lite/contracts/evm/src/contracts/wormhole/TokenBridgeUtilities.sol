// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../interfaces/IERC20decimals.sol";

/**
 * @title TokenBridgeUtilities
 * @notice A set of internal utility functions
 */
library TokenBridgeUtilities {
    error TooManyDecimalPlaces();

    uint8 public constant MAX_DECIMALS = 8;

    /**
     * @dev This function checks if the asset amount is valid for the token bridge
     * @param assetAddress The address of the asset
     * @param assetAmount The amount of the asset
     */
    function requireAssetAmountValidForTokenBridge(address assetAddress, uint256 assetAmount) public view {
        uint8 decimals;
        if (assetAddress == address(0)) {
            // native ETH
            decimals = 18;
        } else {
            decimals = IERC20decimals(assetAddress).decimals();
        }

        if (decimals > MAX_DECIMALS && trimDust(assetAmount, decimals) != assetAmount) {
            revert TooManyDecimalPlaces();
        }
    }

    function trimDust(uint256 amount, uint8 decimals) public pure returns (uint256) {
        return denormalizeAmount(normalizeAmount(amount, decimals), decimals);
    }

    /**
     * @dev This function normalizes the amount based on the decimals
     * @param amount The amount to be normalized
     * @param decimals The number of decimals
     * @return The normalized amount
     */
    function normalizeAmount(uint256 amount, uint8 decimals) public pure returns (uint256) {
        if (decimals > MAX_DECIMALS) {
            amount /= uint256(10) ** (decimals - MAX_DECIMALS);
        }

        return amount;
    }

    /**
     * @dev This function normalizes the amount based on the decimals
     * @param amount The amount to be normalized
     * @param decimals The number of decimals
     * @return The normalized amount
     */
    function denormalizeAmount(uint256 amount, uint8 decimals) public pure returns (uint256) {
        if (decimals > MAX_DECIMALS) {
            amount *= uint256(10) ** (decimals - MAX_DECIMALS);
        }

        return amount;
    }
}
