// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IWETH} from "@wormhole-upgradeable/interfaces/IWETH.sol";

import "../../interfaces/IERC20decimals.sol";
import "../../interfaces/IAssetRegistry.sol";
import "../HubSpokeStructs.sol";
import "../HubSpokeEvents.sol";


contract AssetRegistry is IAssetRegistry, HubSpokeEvents, Ownable {
    uint8 public constant PROTOCOL_MAX_DECIMALS = 18;

    mapping(address => AssetInfo) assetInfos;
    address[] registeredAssets;

    uint256 collateralizationRatioPrecision;
    uint256 maxLiquidationPortionPrecision;

    IWETH public WETH;

    error DepositCollateralizationRatioTooLow();
    error BorrowCollateralizationRatioTooLow();
    error AssetAlreadyRegistered();
    error AssetNotRegistered();
    error TooManyDecimalsInAnAsset();

    constructor(uint256 _collateralizationRatioPrecision, uint256 _maxLiquidationPortionPrecision, IWETH _WETH) Ownable(msg.sender) {
        collateralizationRatioPrecision = _collateralizationRatioPrecision;
        maxLiquidationPortionPrecision = _maxLiquidationPortionPrecision;
        WETH = _WETH;
    }

    /**
     * @notice Registers asset on the hub. Only registered assets are allowed to be stored in the protocol.
     *
     * @param assetAddress: The address to be checked
     * @param collateralizationRatioDeposit: collateralizationRatioDeposit = crd * collateralizationRatioPrecision,
     * where crd is such that when we calculate 'fair prices' to see if a vault, after an action, would have positive
     * value, for purposes of allowing withdraws, borrows, or liquidations, we multiply any deposited amount of this
     * asset by crd.
     * @param collateralizationRatioBorrow: collateralizationRatioBorrow = crb * collateralizationRatioPrecision,
     * where crb is such that when we calculate 'fair prices' to see if a vault, after an action, would have positive
     * value, for purposes of allowing withdraws, borrows, or liquidations, we multiply any borrowed amount of this
     * asset by crb. One way to think about crb is that for every '$1 worth' of effective deposits we allow $c worth of
     * this asset borrowed
     * @param interestRateCalculator: Address of the interest rate calculator for this asset
     * @param maxLiquidationPortion: maxLiquidationPortion is the largest percent of that asset that can be liquidated at once
     * @param maxLiquidationBonus: maxLiquidationBonus is a percent that defines how much of that asset can be claimed
     * by a liquidator and how much bonus they get for liquidating
     */
    function registerAsset(
        address assetAddress,
        uint256 collateralizationRatioDeposit,
        uint256 collateralizationRatioBorrow,
        address interestRateCalculator,
        uint256 maxLiquidationPortion,
        uint256 maxLiquidationBonus
    ) external override onlyOwner {
        if (assetInfos[assetAddress].exists) {
            revert AssetAlreadyRegistered();
        }

        if (collateralizationRatioDeposit < collateralizationRatioPrecision) {
            revert DepositCollateralizationRatioTooLow();
        }
        if (collateralizationRatioBorrow < collateralizationRatioPrecision) {
            revert BorrowCollateralizationRatioTooLow();
        }

        uint8 decimals = IERC20decimals(assetAddress).decimals();
        if(decimals > PROTOCOL_MAX_DECIMALS) {
            revert TooManyDecimalsInAnAsset();
        }

        assetInfos[assetAddress] = AssetInfo({
            collateralizationRatioDeposit: collateralizationRatioDeposit,
            collateralizationRatioBorrow: collateralizationRatioBorrow,
            decimals: decimals,
            interestRateCalculator: interestRateCalculator,
            exists: true,
            borrowLimit: type(uint256).max,
            supplyLimit: type(uint256).max,
            maxLiquidationPortion: maxLiquidationPortion,
            maxLiquidationBonus: maxLiquidationBonus
        });

        registeredAssets.push(assetAddress);

        emit AssetRegistered(
            assetAddress,
            collateralizationRatioDeposit,
            collateralizationRatioBorrow,
            assetInfos[assetAddress].borrowLimit,
            assetInfos[assetAddress].supplyLimit,
            interestRateCalculator,
            maxLiquidationPortion,
            maxLiquidationBonus
        );
    }

    function getAssetInfo(address assetAddress) public view override returns (AssetInfo memory) {
        return assetInfos[assetAddress];
    }

    /**
     * @notice allows the owner to set new values for various asset params
     * use zero or zero address to leave value unchanged
     * @param assetAddress: The address of the asset
     * @param borrowLimit: The new borrow limit
     * @param supplyLimit: The new supply limit
     * @param maxLiquidationPortion: The new max liquidation portion
     * @param maxLiquidationBonus: The new max liquidation bonus
     * @param interestRateCalculatorAddress: The new interest rate calculator address
     */
    function setAssetParams(
        address assetAddress,
        uint256 borrowLimit,
        uint256 supplyLimit,
        uint256 maxLiquidationPortion,
        uint256 maxLiquidationBonus,
        address interestRateCalculatorAddress
    ) external override onlyOwner {
        AssetInfo storage assetInfo = assetInfos[assetAddress];

        if (!assetInfos[assetAddress].exists) {
            revert AssetNotRegistered();
        }

        if (borrowLimit > 0) {
            assetInfo.borrowLimit = borrowLimit;
        }

        if (supplyLimit > 0) {
            assetInfo.supplyLimit = supplyLimit;
        }

        if (maxLiquidationPortion > 0) {
            assetInfo.maxLiquidationPortion = maxLiquidationPortion;
        }

        if (maxLiquidationBonus > 0) {
            assetInfo.maxLiquidationBonus = maxLiquidationBonus;
        }

        if (interestRateCalculatorAddress != address(0)) {
            assetInfo.interestRateCalculator = interestRateCalculatorAddress;
        }

        emit SetAssetParams(
            assetAddress,
            borrowLimit,
            supplyLimit,
            maxLiquidationPortion,
            maxLiquidationBonus,
            interestRateCalculatorAddress
        );
    }

    function setCollateralizationRatios(address _asset, uint256 _deposit, uint256 _borrow) external override onlyOwner {
        if (_deposit < collateralizationRatioPrecision) {
            revert DepositCollateralizationRatioTooLow();
        }

        if (_borrow < collateralizationRatioPrecision) {
            revert BorrowCollateralizationRatioTooLow();
        }

        AssetInfo storage assetInfo = assetInfos[_asset];
        if (!assetInfo.exists) {
            revert AssetNotRegistered();
        }

        assetInfo.collateralizationRatioDeposit = _deposit;
        assetInfo.collateralizationRatioBorrow = _borrow;

        emit CollateralizationRatiosChanged(_asset, _deposit, _borrow);
    }

    function getRegisteredAssets() external view override returns (address[] memory) {
        return registeredAssets;
    }

    function getCollateralizationRatioPrecision() public view override returns (uint256) {
        return collateralizationRatioPrecision;
    }

    function getMaxLiquidationPortionPrecision() public view override returns (uint256) {
        return maxLiquidationPortionPrecision;
    }

    function getMaxDecimals() public pure override returns (uint8) {
        return PROTOCOL_MAX_DECIMALS;
    }
}
