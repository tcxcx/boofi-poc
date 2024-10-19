// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "../contracts/HubSpokeStructs.sol";
import "./ILiquidationCalculator.sol";
import "./IHubPriceUtilities.sol";
import "./IAssetRegistry.sol";

/**
 * @notice interface for external contracts that need to access Hub state
 */
interface IHub {
    function checkVaultHasAssets(address vault, address assetAddress, uint256 normalizedAmount, bool shouldRevert)
        external
        view
        returns (bool success, string memory error);

    function checkProtocolGloballyHasAssets(
        address assetAddress,
        uint256 normalizedAmount,
        bool shouldRevert
    ) external view returns (bool success, string memory error);

    function checkProtocolGloballyHasAssets(
        address assetAddress,
        uint256 normalizedAmount,
        bool shouldRevert,
        uint256 borrowLimit
    ) external view returns (bool success, string memory error);

    function getInterestAccrualIndices(address assetAddress)
        external
        view
        returns (HubSpokeStructs.AccrualIndices memory);

    function getInterestAccrualIndexPrecision() external view returns (uint256);

    function getVaultAmounts(address vaultOwner, address assetAddress)
        external
        view
        returns (HubSpokeStructs.DenormalizedVaultAmount memory);

    function getCurrentAccrualIndices(address assetAddress)
        external
        view
        returns (HubSpokeStructs.AccrualIndices memory);

    function updateAccrualIndices(address assetAddress) external;

    function getLastActivityBlockTimestamp(address assetAddress) external view returns (uint256);

    function getGlobalAmounts(address assetAddress) external view returns (HubSpokeStructs.DenormalizedVaultAmount memory);

    function getReserveAmount(address assetAddress) external view returns (uint256);

    function getLiquidationCalculator() external view returns (ILiquidationCalculator);

    function getPriceUtilities() external view returns (IHubPriceUtilities);

    function getAssetRegistry() external view returns (IAssetRegistry);

    function getLiquidationFeeAndPrecision() external view returns (uint256, uint256);

    function liquidation(ILiquidationCalculator.LiquidationInput memory input) external;

    function userActions(HubSpokeStructs.Action action, address asset, uint256 amount) external payable;
}
