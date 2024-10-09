// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../HubSpokeStructs.sol";
import "./HubState.sol";
import "../../interfaces/IInterestRateCalculator.sol";

/**
 * @title HubInterestUtilities
 * @notice Contract defining interest-related utility functions for the Hub contract
 */
contract HubInterestUtilities is HubState {

    /**
     * @dev Assets accrue interest over time, so at any given point in time the value of an asset is (amount of asset on day 1) * (the amount of interest that has accrued).
     * This function updates both the deposit and borrow interest accrual indices of the asset.
     *
     * @param assetAddress - The asset to update the interest accrual indices of
     */
    function updateAccrualIndices(address assetAddress) public {
        HubSpokeStructs.AccrualIndices memory accrualIndices = getCurrentAccrualIndices(assetAddress);
        setInterestAccrualIndices(assetAddress, accrualIndices);
        setLastActivityBlockTimestamp(assetAddress, block.timestamp);
        emit AccrualIndexUpdated(assetAddress, accrualIndices.deposited, accrualIndices.borrowed, block.timestamp);
    }

    /**
     * @dev Calculates the current accrual indices for a given asset.
     * It calculates the seconds elapsed since the last activity, the total assets deposited,
     * and the current interest accrual indices. If seconds elapsed and deposited are not zero,
     * it calculates the total assets borrowed, normalizes the deposited and borrowed amounts,
     * gets the asset info, and computes the interest factor, reserve factor, and reserve precision.
     * It then updates the borrowed and deposited accrual indices accordingly.
     * @param assetAddress The address of the asset for which to calculate the accrual indices.
     * @return AccrualIndices The current accrual indices for the given asset.
     */
    function getCurrentAccrualIndices(address assetAddress) public view returns (HubSpokeStructs.AccrualIndices memory) {
        uint256 secondsElapsed = block.timestamp - getLastActivityBlockTimestamp(assetAddress);
        HubSpokeStructs.StoredVaultAmount memory globalAssetAmounts = _state.totalAssets[assetAddress];
        HubSpokeStructs.AccrualIndices memory accrualIndices = getInterestAccrualIndices(assetAddress);
        if (secondsElapsed != 0 && globalAssetAmounts.amounts.borrowed != 0 && globalAssetAmounts.amounts.deposited != 0) {
            IAssetRegistry.AssetInfo memory assetInfo = getAssetInfo(assetAddress);
            IInterestRateCalculator assetCalculator = IInterestRateCalculator(assetInfo.interestRateCalculator);
            uint256 interestAccrualPrecision = getInterestAccrualIndexPrecision();
            (uint256 depositInterestFactor, uint256 borrowInterestFactor, uint256 precision) = assetCalculator
                .computeSourceInterestFactor(
                    secondsElapsed,
                    applyInterest(globalAssetAmounts, accrualIndices),
                    interestAccrualPrecision
                );

            accrualIndices.borrowed = accrualIndices.borrowed * borrowInterestFactor / precision;
            accrualIndices.deposited = accrualIndices.deposited * depositInterestFactor / precision;
        }
        return accrualIndices;
    }

    function applyInterest(address asset, HubSpokeStructs.StoredVaultAmount memory vaultAmount) internal view returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        return applyInterest(vaultAmount, getCurrentAccrualIndices(asset));
    }

    function applyInterest(HubSpokeStructs.StoredVaultAmount memory vaultAmount, HubSpokeStructs.AccrualIndices memory indices) internal pure returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        // no need to check the deposit index
        // if the borrow index didn't change then the deposit index didn't either
        if (indices.borrowed == vaultAmount.accrualIndices.borrowed) {
            // the amounts are already up to date
            // no need to recompute
            return vaultAmount.amounts;
        }

        return HubSpokeStructs.DenormalizedVaultAmount({
            deposited: vaultAmount.amounts.deposited == 0 ? 0 : vaultAmount.amounts.deposited * indices.deposited / vaultAmount.accrualIndices.deposited,
            borrowed: vaultAmount.amounts.borrowed == 0 ? 0 : vaultAmount.amounts.borrowed * indices.borrowed / vaultAmount.accrualIndices.borrowed
        });
    }
}
