// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/ILiquidationCalculator.sol";

/**
 * @title HubSpokeEvents
 * @notice Events emitted by the Hub and Spoke contracts
 */
contract HubSpokeEvents {
    event Liquidation(address indexed liquidator, address indexed vault, ILiquidationCalculator.DenormalizedLiquidationAsset[] liquidationAssets);
    event Deposit(address indexed vault, address indexed asset, uint256 amount, uint256 vaultTotalDeposited);
    event Withdraw(address indexed vault, address indexed asset, uint256 amount, uint256 vaultTotalDeposited);
    event Borrow(address indexed vault, address indexed asset, uint256 amount, uint256 vaultTotalBorrowed);
    event Repay(address indexed vault, address indexed asset, uint256 amount, uint256 vaultTotalBorrowed);
    event ReservesWithdrawn(address indexed asset, uint256 amount, address destination);
    event LogError(bytes32 sourceAddress, uint32 sourceChain, bytes32 deliveryHash, string error);
    event SpokeRegistered(uint32 chainId, address spoke);
    event AssetRegistered(
        address asset,
        uint256 collateralizationRatioDeposit,
        uint256 collateralizationRatioBorrow,
        uint256 borrowLimit,
        uint256 supplyLimit,
        address interestRateCalculator,
        uint256 maxLiquidationPortion,
        uint256 maxLiquidationBonus
    );
    event SetAssetParams(
        address asset,
        uint256 borrowLimit,
        uint256 supplyLimit,
        uint256 maxLiquidationPortion,
        uint256 maxLiquidationBonus,
        address interestRateCalculator
    );
    event CollateralizationRatiosChanged(
        address asset,
        uint256 collateralizationRatioDeposit,
        uint256 collateralizationRatioBorrow
    );
    event SetLiquidationFee(uint256 value, uint256 precision);
    event AssetPythIdChanged(address asset, bytes32 oldPythId, bytes32 newPythId);
    event AccrualIndexUpdated(address indexed asset, uint256 deposit, uint256 borrow, uint256 timestamp);
}
