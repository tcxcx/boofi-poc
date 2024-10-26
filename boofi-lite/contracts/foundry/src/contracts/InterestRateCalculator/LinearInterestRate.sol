// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IInterestRateCalculator.sol";
import "./BaseInterestRate.sol";

/**
 * @title LinearInterestRate
 * @notice Contract defining the LinearInterestRate interest rate model
 */
contract LinearInterestRate is BaseInterestRate {
    struct InterestRateModel {
        uint64 ratePrecision;
        uint64 rateIntercept;
        uint64 rateCoefficient;
    }

    InterestRateModel public model;

    event ModelSet(InterestRateModel model);

    /**
     * @notice Constructor for the LinearInterestRate contract
     * @dev Initializes the contract with the given parameters
     * @param _ratePrecision The precision of the interest rate
     * @param _rateIntercept The intercept of the linear interest rate model
     * @param _rateCoefficient The coefficient of the linear interest rate model
     * @param _reserveFactor The reserve factor
     * @param _reservePrecision The precision of the reserve
     */
    constructor(
        uint64 _ratePrecision,
        uint64 _rateIntercept,
        uint64 _rateCoefficient,
        uint256 _reserveFactor,
        uint256 _reservePrecision
    ) BaseInterestRate(_reserveFactor, _reservePrecision) {
        setModel(_ratePrecision, _rateIntercept, _rateCoefficient);
    }

    // VIEW FUNCTIONS

    function getInterestRateFromPoolUtilization(HubSpokeStructs.DenormalizedVaultAmount memory _globalAssetAmounts) public view override returns (InterestRateBase memory) {
        if (_globalAssetAmounts.deposited == 0) {
            return InterestRateBase({ interestRate: model.rateIntercept, precision: model.ratePrecision});
        }

        return InterestRateBase({
            interestRate: (model.rateIntercept + (_globalAssetAmounts.borrowed * model.rateCoefficient) / _globalAssetAmounts.deposited),
            precision: model.ratePrecision
        });
    }

    // ADMIN FUNCTIONS

    /**
     * @notice Sets the model for the LinearInterestRate contract. Can only be called by the contract owner.
     * @param _ratePrecision The precision of the interest rate
     * @param _rateIntercept The intercept of the linear interest rate model
     * @param _rateCoefficient The coefficient of the linear interest rate model
     */
    function setModel(
        uint64 _ratePrecision,
        uint64 _rateIntercept,
        uint64 _rateCoefficient
    ) public onlyOwner {
        require(_ratePrecision >= 1e18, "Precision must be >= 1e18");
        model.ratePrecision = _ratePrecision;
        model.rateIntercept = _rateIntercept;
        model.rateCoefficient = _rateCoefficient;

        emit ModelSet(model);
    }
}
