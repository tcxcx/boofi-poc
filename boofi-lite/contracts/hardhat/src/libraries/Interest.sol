// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { UD60x18, ud, UNIT } from "@prb/math/src/UD60x18.sol";
import "../../src/interfaces/IInterestRateCalculator.sol";
import {HubSpokeStructs} from "../../src/contracts/HubSpokeStructs.sol";

library Interest {
  function expBaseFromRateAndPrecision(uint256 rate, uint256 precision) internal pure returns (uint256) {
    uint256 divisor = 365 days;
    return (divisor * precision + rate) / divisor;
  }

  function exponentiate(uint256 base, uint256 secondsElapsed, uint256 precision) internal pure returns (uint256) {
    // scale the exponentiationBase to UD60x18 precision
    UD60x18 baseUd = ud(base * UNIT.unwrap() / precision);
    // exponentiation -> unwrap -> scale back to precisionn
    return baseUd.powu(secondsElapsed).unwrap() * precision / UNIT.unwrap();
  }

  function computeAccrualIndices(
    IInterestRateCalculator.InterestRates memory rates,
    uint256 secondsElapsed,
    uint256 precision
  ) internal pure returns (HubSpokeStructs.AccrualIndices memory accrualIndices) {
    uint256 depositExpBase = expBaseFromRateAndPrecision(rates.depositRate, rates.precision);
    uint256 borrowExpBase = expBaseFromRateAndPrecision(rates.borrowRate, rates.precision);
    accrualIndices.deposited = exponentiate(depositExpBase, secondsElapsed, rates.precision) * precision / rates.precision;
    accrualIndices.borrowed = exponentiate(borrowExpBase, secondsElapsed, rates.precision) * precision / rates.precision;
  }

  function getAmountsWithCompoundedInterest(
    HubSpokeStructs.DenormalizedVaultAmount memory amountWithoutInterest,
    IInterestRateCalculator.InterestRates memory rates,
    uint256 secondsElapsed
  ) internal pure returns (HubSpokeStructs.DenormalizedVaultAmount memory amountWithInterest) {
    HubSpokeStructs.AccrualIndices memory indices = computeAccrualIndices(rates, secondsElapsed, rates.precision);
    amountWithInterest.deposited = amountWithoutInterest.deposited * indices.deposited / rates.precision;
    amountWithInterest.borrowed = amountWithoutInterest.borrowed * indices.borrowed / rates.precision;
  }
}