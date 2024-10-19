// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "../contracts/HubSpokeStructs.sol";

interface ILiquidationCalculator {
    /**
     * @param assetAddress - The address of the repaid/received asset
     * @param repaidAmount - The amount of the asset that is being repaid (can be zero)
     * @param receivedAmount - The amount of the asset that is being received (can be zero)
     * @param depositTakeover - A flag if the liquidator will take the deposit of the debtor instead of collateral tokens
     */
    struct DenormalizedLiquidationAsset {
        address assetAddress;
        uint256 repaidAmount;
        uint256 receivedAmount;
        bool depositTakeover;
    }

    /**
     * @param vault - the address of the vault that is being liquidated
     */
    struct LiquidationInput {
        address vault;
        DenormalizedLiquidationAsset[] assets;
    }

    function checkLiquidationInputsValid(LiquidationInput memory input) external view;
    function checkAllowedToLiquidate(LiquidationInput memory input) external view;
    function getMaxHealthFactor() external view returns (uint256, uint256);
}
