// contracts/Bridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "../contracts/HubSpokeStructs.sol";

interface IInterestRateCalculator {
    struct InterestRates {
        uint256 depositRate;
        uint256 borrowRate;
        uint256 precision;
    }

    struct InterestRateBase {
        uint256 interestRate;
        uint256 precision;
    }

    /**
     * @notice Computes the source interest factor
     * @param secondsElapsed The number of seconds elapsed
     * @param globalAssetAmount The global denormalized asset amounts
     * @param interestAccrualIndexPrecision The precision of the interest accrual index
     * @return depositInterestFactor interest factor for deposits
     * @return borrowInterestFactor interest factor for borrows
     * @return precision precision
     */
    function computeSourceInterestFactor(
        uint256 secondsElapsed,
        HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount,
        uint256 interestAccrualIndexPrecision
    ) external view returns (uint256 depositInterestFactor, uint256 borrowInterestFactor, uint256 precision);

    /**
     * @notice utility function to return current APY for an asset
     * @param globalAssetAmount The global denormalized amounts of the asset
     * @return interestRates rate * model.ratePrecision
     */
    function currentInterestRate(HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount)
        external
        view
        returns (InterestRates memory);

    function getReserveFactorAndPrecision() external view returns (uint256 reserveFactor, uint256 reservePrecision);

    function getInterestRateFromPoolUtilization(HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount) view external returns (InterestRateBase memory);
}
