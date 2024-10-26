// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../interfaces/ILiquidationCalculator.sol";
import "../../interfaces/IHubPriceUtilities.sol";
import "../../interfaces/IAssetRegistry.sol";
import "../HubSpokeStructs.sol";
import "../HubSpokeEvents.sol";

/**
 * @title HubState
 * @notice Contract holding state variable for the Hub contract
 */
abstract contract HubState is OwnableUpgradeable, HubSpokeEvents {

    error InvalidPrecision();

    HubSpokeStructs.HubState _state;

    function getAssetInfo(address assetAddress) internal view virtual returns (IAssetRegistry.AssetInfo memory) {
        return _state.assetRegistry.getAssetInfo(assetAddress);
    }

    function consistencyLevel() public view returns (uint8) {
        return _state.consistencyLevel;
    }

    function getLiquidationCalculator() public view returns (ILiquidationCalculator) {
        return _state.liquidationCalculator;
    }

    function getPriceUtilities() public view returns (IHubPriceUtilities) {
        return _state.priceUtilities;
    }

    function getAssetRegistry() public view returns (IAssetRegistry) {
        return _state.assetRegistry;
    }

    function getLiquidationFeeAndPrecision() public view returns (uint256, uint256) {
        return (_state.liquidationFee, _state.liquidationFeePrecision);
    }

    function getIsUsingCCTP() public view returns (bool) {
        return _state.isUsingCCTP;
    }

    function getLastActivityBlockTimestamp(address assetAddress) public view returns (uint256) {
        return _state.lastActivityBlockTimestamps[assetAddress];
    }

    function getInterestAccrualIndices(address assetAddress) public view returns (HubSpokeStructs.AccrualIndices memory) {
        if (_state.indices[assetAddress].deposited == 0 || _state.indices[assetAddress].borrowed == 0) {
            // seed with precision if not set
            return HubSpokeStructs.AccrualIndices({deposited: getInterestAccrualIndexPrecision(), borrowed: getInterestAccrualIndexPrecision()});
        }

        return _state.indices[assetAddress];
    }

    function getInterestAccrualIndexPrecision() public view returns (uint256) {
        return _state.interestAccrualIndexPrecision;
    }

    function setLastActivityBlockTimestamp(address assetAddress, uint256 blockTimestamp) internal {
        _state.lastActivityBlockTimestamps[assetAddress] = blockTimestamp;
    }

    function setInterestAccrualIndices(address assetAddress, HubSpokeStructs.AccrualIndices memory indices) internal {
        _state.indices[assetAddress] = indices;
    }

    /**
     * @notice Sets the default gas limit used for wormhole relay quotes
     * @param value: The new value for `defaultGasLimit`
     */
    function setDefaultGasLimit(uint256 value) public onlyOwner {
        _state.defaultGasLimit = value;
    }

    /**
     * @dev Sets the gas limit used for refunding of returnCost amount
     * @param value: The new value for `refundGasLimit`
     */
    function setRefundGasLimit(uint256 value) public onlyOwner {
        _state.refundGasLimit = value;
    }

    /**
     * @notice Updates the liquidation fee
     * @param _liquidationFee: The new liquidation fee
     */
    function setLiquidationFee(uint256 _liquidationFee, uint256 _precision) public onlyOwner {
        if (_liquidationFee > _precision) {
            revert InvalidPrecision();
        }
        _state.liquidationFee = _liquidationFee;
        _state.liquidationFeePrecision = _precision;
        emit SetLiquidationFee(_liquidationFee, _precision);
    }

    /**
     * @notice Sets the liquidation calculator
     * @param _calculator: The address of the liquidation calculator
     */
    function setLiquidationCalculator(address _calculator) external onlyOwner {
        _state.liquidationCalculator = ILiquidationCalculator(_calculator);
    }

    function setPriceUtilities(address _priceUtilities) external onlyOwner {
        _state.priceUtilities = IHubPriceUtilities(_priceUtilities);
    }

    function setAssetRegistry(address _assetRegistry) external onlyOwner {
        _state.assetRegistry = IAssetRegistry(_assetRegistry);
    }
}
