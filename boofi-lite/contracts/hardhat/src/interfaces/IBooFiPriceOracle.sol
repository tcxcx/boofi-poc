// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IBooFiPriceSource} from "./IBooFiPriceSource.sol";

interface IBooFiPriceOracle is IBooFiPriceSource {
    struct PriceSource {
        IBooFiPriceSource priceSource;
        uint256 maxPriceAge;
    }

    function sequencerUptimeFeed() external view returns (AggregatorV3Interface);
    function sequencerGracePeriod() external view returns (uint256);
    function getPrice(address _asset) external view returns (Price memory price);
    function setPriceSource(address _asset, PriceSource memory _priceSource) external;
    function removePriceSource(address _asset) external;
    function getPriceSource(address _asset) external view returns (PriceSource memory);
}
