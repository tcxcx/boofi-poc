// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import { IBooFiPriceOracle } from "../interfaces/IBooFiPriceOracle.sol";
import { IERC20decimals } from "../interfaces/IERC20decimals.sol";

library SwapAmountsOracle {
    function getOutputForInput(
        IBooFiPriceOracle oracle,
        address input,
        address output,
        uint256 amountIn
    ) internal view returns (uint256 amountOut) {
        require(oracle.priceAvailable(input), "input asset unsupported by price oracle");
        require(oracle.priceAvailable(output), "output asset unsupported by price oracle");
        IBooFiPriceOracle.Price memory inputPrice = oracle.getPrice(input);
        IBooFiPriceOracle.Price memory outputPrice = oracle.getPrice(output);
        uint8 inputDecimals = IERC20decimals(input).decimals();
        uint8 outputDecimals = IERC20decimals(output).decimals();
        if (inputDecimals < outputDecimals) {
            uint256 precisionAdjust = 10 ** (outputDecimals - inputDecimals);
            // 1e18        1e6      1e18               1e12               1e18                      1e18                 1e18
            amountOut = amountIn * inputPrice.price * precisionAdjust * outputPrice.precision / (outputPrice.price * inputPrice.precision);
        } else {
            uint256 precisionAdjust = 10 ** (inputDecimals - outputDecimals);
            // 1e6      1e18        1e18               1e18                        1e18                  1e18               1e12
            amountOut = amountIn * inputPrice.price * outputPrice.precision / (outputPrice.price * inputPrice.precision * precisionAdjust);
        }
    }

    function getInputForOutput(
        IBooFiPriceOracle oracle,
        address input,
        address output,
        uint256 amountOut
    ) internal view returns (uint256 amountIn) {
        require(oracle.priceAvailable(input), "input asset unsupported by price oracle");
        require(oracle.priceAvailable(output), "output asset unsupported by price oracle");
        IBooFiPriceOracle.Price memory inputPrice = oracle.getPrice(input);
        IBooFiPriceOracle.Price memory outputPrice = oracle.getPrice(output);
        uint8 inputDecimals = IERC20decimals(input).decimals();
        uint8 outputDecimals = IERC20decimals(output).decimals();
        if (inputDecimals < outputDecimals) {
            uint256 precisionAdjust = 10 ** (outputDecimals - inputDecimals);
            // 1e6        1e18      1e18                 1e18                      1e18                1e12               1e18
            amountIn = amountOut * outputPrice.price * inputPrice.precision / (inputPrice.price * precisionAdjust * outputPrice.precision);
        } else {
            uint256 precisionAdjust = 10 ** (inputDecimals - outputDecimals);
            // 1e18     1e6        1e18                1e12               1e18                         1e18           1e18
            amountIn = amountOut * outputPrice.price * precisionAdjust * inputPrice.precision / (inputPrice.price * outputPrice.precision);
        }
    }
}