// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../HubSpokeStructs.sol";
import "../../interfaces/IInterestRateCalculator.sol";
import "../../interfaces/IHubPriceUtilities.sol";
import "../../interfaces/IHub.sol";
import "../../interfaces/IAssetRegistry.sol";

contract HubHelperViews {

    IHub hub;

    constructor(address _hub) {
        hub = IHub(_hub);
    }

    /**
     * @dev Get the maximum amount of an asset that can be borrowed by a vault owner
     *
     * @param vaultOwner - The address of the owner of the vault
     * @param assetAddress - The address of the relevant asset
     * @param minHealth - The minimum health of the vault after the borrow
     * @param minHealthPrecision - The precision of the minimum health
     * @return maxBorrowableAmount - The maximum amount of the asset that can be borrowed by the vault owner
     */
    function getMaxBorrowableAmount(address vaultOwner, address assetAddress, uint256 minHealth, uint256 minHealthPrecision) external view returns (uint256) {
        // calculate max borrowable amount without a preceding deposit change (0 for amount and whatever for deposit/withdrawal boolean)
        (,uint256 maxBorrowable) = calculateMaxWithdrawableAndBorrowableAmounts(0, assetAddress, vaultOwner, true, minHealth, minHealthPrecision);
        return maxBorrowable;
    }

    /**
     * @notice Get the maximum amount of an asset that can be borrowed by a vault owner after a deposit or withdrawal
     * TODO: move this function out to HubHelperViews in V2
     *
     * @param assetAmount - The amount of the asset that is being deposited or withdrawn
     * @param assetAddress - The address of the relevant asset
     * @param vaultOwner - The address of the owner of the vault
     * @param deposit - Whether or not the transaction is a deposit or withdrawal
     * @param minHealth - The minimum health of the vault after the borrow
     * @param minHealthPrecision - The precision of the minimum health
     * @return maxWithdrawableAmount - The maximum amount of the asset that can be withdrawn by the vault owner
     * @return maxBorrowableAmount - The maximum amount of the asset that can be borrowed by the vault owner
     */
    function calculateMaxWithdrawableAndBorrowableAmounts(
        uint256 assetAmount,
        address assetAddress,
        address vaultOwner,
        bool deposit,
        uint256 minHealth,
        uint256 minHealthPrecision
    )
        public
        view
        returns (uint256, uint256)
    {
        IHubPriceUtilities hubPriceUtilities = IHubPriceUtilities(address(hub.getPriceUtilities()));
        HubSpokeStructs.NotionalVaultAmount memory notionals = hubPriceUtilities.getVaultEffectiveNotionals(vaultOwner, true);
        if (assetAmount > 0) {
            // since the preceding action is either a deposit or withdrawal, we treat it as a difference in collateral
            uint256 effectiveNotional = hubPriceUtilities.calculateEffectiveNotionals(assetAddress, HubSpokeStructs.DenormalizedVaultAmount(assetAmount, 0)).deposited;

            if (deposit) {
                notionals.deposited += effectiveNotional;
            } else {
                if (effectiveNotional > notionals.deposited) {
                    return (0, 0);
                }
                notionals.deposited -= effectiveNotional;
            }
        }

        if (notionals.deposited * minHealthPrecision <= notionals.borrowed * minHealth) {
            // if the vault is already below the target health, return zero amounts
            return (0,0);
        }

        uint256 prevDeposit = notionals.deposited;
        if (notionals.borrowed > 0) {
            // only limit the withdraw amount if there is debt
            // this will not underflow beacause of the previous check
            // get the maximum notional value that is withdrawable or borrowable given the minHealth
            notionals.deposited -= (notionals.borrowed * minHealth / minHealthPrecision);
        }

        // notionals.deposited >= (notionals.borrowed + maxNotionalBorrowRetainingHealth) * _minHealth / _minHealthPrecision
        // notionals.deposited * _minHealthPrecision / _minHealth - notionals.borrowed >= maxNotionalBorrowRetainingHealth
        notionals.borrowed = prevDeposit * minHealthPrecision / minHealth - notionals.borrowed;


        HubSpokeStructs.DenormalizedVaultAmount memory amounts;
        {
            // realValues.deposited will be the amount of the asset that can be withdrawn
            // realValues.borrowed will be the amount of the asset that can be borrowed
            HubSpokeStructs.NotionalVaultAmount memory realValues = hubPriceUtilities.removeCollateralizationRatios(assetAddress, notionals);
            // invert the notional computation to get the asset amount
            amounts = hubPriceUtilities.invertNotionals(assetAddress, realValues);
        }

        // in case of withdrawal, take into account the real user deposit balance
        HubSpokeStructs.DenormalizedVaultAmount memory realVaultAmounts = hub.getVaultAmounts(vaultOwner, assetAddress);
        if (deposit) {
            // add the freshly deposited amount
            realVaultAmounts.deposited += assetAmount;
        } else {
            // subtract the freshly withdrawn amount
            realVaultAmounts.deposited -= assetAmount;
        }

        return (
            amounts.deposited > realVaultAmounts.deposited ? realVaultAmounts.deposited : amounts.deposited,
            amounts.borrowed
        );
    }

    /**
     * @notice Get the maximum amount of an asset that can be withdrawn by a vault owner
     *
     * @param vaultOwner - The address of the owner of the vault
     * @param assetAddress - The address of the relevant asset
     * @param minHealth - The minimum health of the vault after the withdrawal
     * @param minHealthPrecision - The precision of the minimum health
     * @return maxWithdrawableAmount - The maximum amount of the asset that can be withdrawn by the vault owner
     */
    function getMaxWithdrawableAmount(address vaultOwner, address assetAddress, uint256 minHealth, uint256 minHealthPrecision)
        external
        view
        returns (uint256 maxWithdrawableAmount)
    {
        (uint256 maxWithdrawable,) = calculateMaxWithdrawableAndBorrowableAmounts(0, assetAddress, vaultOwner, false, minHealth, minHealthPrecision);
        return maxWithdrawable;
    }

    /**
     * @notice Get the current interest rate for an asset
     *
     * @param assetAddress - the address of the asset
     * @return IInterestRateCalculator.InterestRates The current deposit interest rate for the asset, multiplied by rate precision
     */
    function getCurrentInterestRate(address assetAddress) external view returns (IInterestRateCalculator.InterestRates memory) {
        IAssetRegistry assetRegistry = IAssetRegistry(hub.getAssetRegistry());
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(assetAddress);
        IInterestRateCalculator assetCalculator = IInterestRateCalculator(assetInfo.interestRateCalculator);
        HubSpokeStructs.DenormalizedVaultAmount memory denormalizedGlobals = hub.getGlobalAmounts(assetAddress);
        return assetCalculator.currentInterestRate(denormalizedGlobals);
    }

    /**
     * @notice Get the reserve factor and precision for a given asset
     *
     * @param asset - The address of the asset
     * @return reserveFactor - The reserve factor for the asset
     * @return reservePrecision - The precision of the reserve factor
     */
    function getReserveFactor(address asset) external view returns (uint256, uint256) {
        IAssetRegistry assetRegistry = IAssetRegistry(hub.getAssetRegistry());
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(asset);
        address assetCalculator = assetInfo.interestRateCalculator;
        return IInterestRateCalculator(assetCalculator).getReserveFactorAndPrecision();
    }

    /**
     * @notice Get a user's account balance in an asset
     *
     * @param vaultOwner - the address of the user
     * @param assetAddress - the address of the asset
     * @return VaultAmount a struct with 'deposited' field and 'borrowed' field for the amount deposited and borrowed of the asset
     * multiplied by 10^decimal for that asset. Values are denormalized.
     */
    function getUserBalance(address vaultOwner, address assetAddress)
        public
        view
        returns (HubSpokeStructs.DenormalizedVaultAmount memory)
    {
        return hub.getVaultAmounts(vaultOwner, assetAddress);
    }

    /**
     * @notice Get the protocol's global balance in an asset
     *
     * @param assetAddress - the address of the asset
     * @return VaultAmount a struct with 'deposited' field and 'borrowed' field for the amount deposited and borrowed of the asset
     * multiplied by 10^decimal for that asset. Values are denormalized.
     */
    function getGlobalBalance(address assetAddress) public view returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        return hub.getGlobalAmounts(assetAddress);
    }

    /**
     * @notice Get the protocol's global reserve amount in an asset
     *
     * @param assetAddress - the address of the asset
     * @return uint256 The amount of the asset in the protocol's reserve
     */
    function getReserveAmount(address assetAddress) external view returns (uint256) {
        return hub.getReserveAmount(assetAddress);
    }
}
