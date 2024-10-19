// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IInterestRateCalculator.sol";
import "./BaseInterestRate.sol";

/**
 * @title PiecewiseInterestRate
 * @notice Contract defining the PiecewiseInterestRate interest rate model for testing purposes
 */
contract PiecewiseInterestRate is BaseInterestRate {
    struct PiecewiseInterestRateModel {
        uint256[] kinks;
        uint64 ratePrecision;
        uint256[] rates;
    }

    PiecewiseInterestRateModel public model;

    event ModelSet(PiecewiseInterestRateModel model);

    /**
     * @notice Constructor for the PiecewiseInterestRate contract
     * @dev This function initializes the PiecewiseInterestRateModel with the provided parameters.
     * @param _ratePrecision The precision of the rate
     * @param _kinks The array of kinks
     * @param _rates The array of rates
     * @param _reserveFactor The reserve factor
     * @param _reservePrecision The precision of the reserve
     */
    constructor(
        uint64 _ratePrecision,
        uint256[] memory _kinks,
        uint256[] memory _rates,
        uint256 _reserveFactor,
        uint256 _reservePrecision
    ) BaseInterestRate(_reserveFactor, _reservePrecision) {
        setModel(_ratePrecision, _kinks, _rates);
    }

    // VIEW FUNCTIONS

    function getInterestRateFromPoolUtilization(HubSpokeStructs.DenormalizedVaultAmount memory _globalAssetAmount) public view override returns (InterestRateBase memory baseRate) {
        // this doesn't change
        baseRate.precision = model.ratePrecision;

        // if zero borrows and nonzero deposits, then set interest rate for period to the rate intercept i.e. first kink;
        if (_globalAssetAmount.deposited == 0 || _globalAssetAmount.borrowed == 0) {
            baseRate.interestRate = model.rates[0];
            return baseRate;
        }

        // if full utilization return the last rate
        if (_globalAssetAmount.deposited <= _globalAssetAmount.borrowed) {
            baseRate.interestRate = model.rates[model.rates.length - 1];
            return baseRate;
        }

        // find the kink that we are in
        // both edge cases covered above
        uint256 i;
        for (i = 1; i < model.kinks.length; i++) {
            if (_globalAssetAmount.borrowed * model.ratePrecision <= _globalAssetAmount.deposited * model.kinks[i]) {
                break;
            }
        }

        // ow linearly interpolate between kinks
        // compute where on the x axis we are
        uint256 xAxis = _globalAssetAmount.borrowed * model.ratePrecision / _globalAssetAmount.deposited;
        // determine the multiplier for the rate interval
        uint256 multiplier = (xAxis - model.kinks[i - 1]) * model.ratePrecision / (model.kinks[i] - model.kinks[i - 1]);
        // interpolate linearly over the interval
        baseRate.interestRate = (model.rates[i] - model.rates[i - 1]) * multiplier / model.ratePrecision + model.rates[i - 1];
    }

    /**
     * @notice Set the model for the PiecewiseInterestRate contract
     * @param _ratePrecision The precision of the rate
     * @param _kinks The array of kinks
     * @param _rates The array of rates
     */
    function setModel(
        uint64 _ratePrecision,
        uint256[] memory _kinks,
        uint256[] memory _rates
    ) public onlyOwner {
        verifyInputs(_ratePrecision, _kinks, _rates);

        model = PiecewiseInterestRateModel({
            kinks: _kinks,
            ratePrecision: _ratePrecision,
            rates: _rates
        });

        emit ModelSet(model);
    }

    // INTERNAL
    /**
     * @notice Verifies the inputs for the PiecewiseInterestRateModel
     * @dev This function checks the validity of the inputs for the PiecewiseInterestRateModel.
     * It ensures that the rate precision and reserve precision are greater than or equal to 1e18.
     * It also checks that the lengths of the kinks and rates arrays match, the first kink is at 0,
     * the kinks are monotonically increasing, and the last kink is equal to the rate precision.
     * Finally, it verifies that the rates are monotonically non-decreasing.
     * @param _ratePrecision The precision of the rate
     * @param _kinks The array of kinks
     * @param _rates The array of rates
     */
    function verifyInputs(
        uint64 _ratePrecision,
        uint256[] memory _kinks,
        uint256[] memory _rates
    ) internal pure {
        require(_ratePrecision >= 1e18, "Precision must be >= 1e18");

        uint256 n = _kinks.length;
        uint256 m = _rates.length;

        require(n == m, "lengths of kinks and rates arrays don't match");
        require(_kinks[0] == 0, "first kink must be at 0");

        uint256 i;
        for (i = 1; i < n;) {
            require(_kinks[i] > _kinks[i - 1], "kinks must be monotonically increasing");
            unchecked {
                i++;
            }
        }

        require(_kinks[n - 1] == _ratePrecision, "last kink must be 1 (i.e. ratePrecision)");

        for (i = 1; i < m;) {
            require(_rates[i] >= _rates[i - 1], "rates must be monotonically non-decreasing");
            unchecked {
                i++;
            }
        }
    }
}
