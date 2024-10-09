// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "./IHub.sol";
import "./IAssetRegistry.sol";
import "./ISynonymPriceOracle.sol";
import "../contracts/HubSpokeStructs.sol";

interface IHubPriceUtilities {
    function getAssetRegistry() external view returns (IAssetRegistry);
    function getPrices(address assetAddress) external view returns (uint256, uint256, uint256, uint256);
    function getVaultEffectiveNotionals(address vaultOwner, bool collateralizationRatios) external view returns (HubSpokeStructs.NotionalVaultAmount memory);
    function calculateNotionals(address asset, HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount) external view returns (HubSpokeStructs.NotionalVaultAmount memory);
    function calculateEffectiveNotionals(address asset, HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount) external view returns (HubSpokeStructs.NotionalVaultAmount memory);
    function invertNotionals(address asset, HubSpokeStructs.NotionalVaultAmount memory realValues) external view returns (HubSpokeStructs.DenormalizedVaultAmount memory);
    function applyCollateralizationRatios(address asset, HubSpokeStructs.NotionalVaultAmount memory vaultAmount) external view returns (HubSpokeStructs.NotionalVaultAmount memory);
    function removeCollateralizationRatios(address asset, HubSpokeStructs.NotionalVaultAmount memory vaultAmount) external view returns (HubSpokeStructs.NotionalVaultAmount memory);
    function checkAllowedToDeposit(address assetAddress, uint256 assetAmount, bool shouldRevert) external view returns (bool success, string memory error);
    function checkAllowedToWithdraw(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert) external view returns (bool success, string memory error);
    function checkAllowedToBorrow(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert) external view returns (bool success, string memory error);
    function checkAllowedToRepay(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert) external view returns (bool success, string memory error);
    function getHub() external view returns (IHub);
    function setHub(IHub _hub) external;
    function getPriceOracle() external view returns (ISynonymPriceOracle);
    function setPriceOracle(ISynonymPriceOracle _priceOracle) external;
    function getPriceStandardDeviations() external view returns (uint256, uint256);
    function setPriceStandardDeviations(uint256 _priceStandardDeviations, uint256 _precision) external;
}
