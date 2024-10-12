// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IInterestRateCalculator.sol";
import "../../libraries/Interest.sol";

/**
 * @title LinearInterestRate
 * @notice Contract defining the LinearInterestRate interest rate model
 */
abstract contract BaseInterestRate is IInterestRateCalculator, Ownable {
    uint256 internal reserveFactor;
    uint256 internal reservePrecision;

    constructor(uint256 _reserveFactor, uint256 _reservePrecision) Ownable(msg.sender) {
      setReserveFactorAndPrecision(_reserveFactor, _reservePrecision);
    }

    function computeSourceInterestFactor(
      uint256 secondsElapsed,
      HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount,
      uint256 interestAccrualIndexPrecision
    ) external view override returns (uint256 depositInterestFactor, uint256 borrowInterestFactor, uint256 precision) {
      if (globalAssetAmount.deposited == 0 || globalAssetAmount.borrowed == 0 || secondsElapsed == 0) {
        // can't accrue interest if there are no borrows, no deposits, or no time has passed
        return (interestAccrualIndexPrecision, interestAccrualIndexPrecision, interestAccrualIndexPrecision);
      }

      InterestRates memory rates = currentInterestRate(globalAssetAmount);
      HubSpokeStructs.AccrualIndices memory accrualIndices = Interest.computeAccrualIndices(rates, secondsElapsed, interestAccrualIndexPrecision);
      depositInterestFactor = accrualIndices.deposited;
      borrowInterestFactor = accrualIndices.borrowed;
      precision = interestAccrualIndexPrecision;
    }

    function currentInterestRate(
      HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount
    ) public view override returns (InterestRates memory) {
      InterestRateBase memory baseRate = getInterestRateFromPoolUtilization(globalAssetAmount);
      uint256 reservePrecisionMinusFactor = reservePrecision - reserveFactor;
      InterestRates memory ret;
      ret.borrowRate = baseRate.interestRate;
      ret.precision = baseRate.precision;

      if (globalAssetAmount.deposited == 0) {
        ret.depositRate = 0;
      } else {
        ret.depositRate = reservePrecisionMinusFactor * ret.borrowRate * globalAssetAmount.borrowed / (globalAssetAmount.deposited * reservePrecision);
      }

      return ret;
    }

    function getReserveFactorAndPrecision() external view override returns (uint256, uint256) {
      return (reserveFactor, reservePrecision);
    }

    function setReserveFactorAndPrecision(uint256 _reserveFactor, uint256 _reservePrecision) public onlyOwner {
      require(_reserveFactor <= _reservePrecision, "reserve factor must be less than or equal to reserve precision");
      reserveFactor = _reserveFactor;
      reservePrecision = _reservePrecision;
    }

    function getInterestRateFromPoolUtilization(HubSpokeStructs.DenormalizedVaultAmount memory globalAssetAmount) public view virtual returns (InterestRateBase memory);
}
