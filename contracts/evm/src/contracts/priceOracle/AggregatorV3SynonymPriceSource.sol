// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {BaseSynonymPriceSource} from "./BaseSynonymPriceSource.sol";

/**
 * @title AggregatorV3SynonymPriceOracle
 */
contract AggregatorV3SynonymPriceSource is BaseSynonymPriceSource {
    mapping(address => AggregatorV3Interface) public aggregators;

    error NoZeroOrNegativePrices();
    error InvalidPriceSource();

    event PriceSourceSet(address indexed asset, address aggregator);

    constructor(string memory _outputAsset) BaseSynonymPriceSource(_outputAsset) {}

    function priceAvailable(address _asset) public view override returns (bool) {
        return address(aggregators[_asset]) != address(0);
    }

    /**
     * @notice Gets the price for an asset from a given source
     * @param _asset The asset to get the price for
     */
    function getPrice(address _asset, uint256 _maxAge) public view override returns (Price memory price) {
        if (!priceAvailable(_asset)) {
            revert NoPriceForAsset();
        }

        price.precision = PRICE_PRECISION;

        AggregatorV3Interface aggregator = aggregators[_asset];
        uint256 oraclePrecision = uint256(10 ** uint256(aggregator.decimals()));
        (, int256 answer, , uint256 updatedAt, ) = aggregator.latestRoundData();
        // current time - last update > max age
        if (block.timestamp > _maxAge + updatedAt) {
            revert StalePrice();
        }

        if (answer <= 0) {
            revert NoZeroOrNegativePrices();
        }

        price.price = uint256(answer) * price.precision / oraclePrecision;
        price.confidence = 0; // chainlink doesn't provide confidence
        price.updatedAt = updatedAt;
    }

    /**
     * Sets or unsets pyth / chainlink price source for an asset
     * @param _asset The asset for which the sources are being changed
     * @param _aggregator The chainlink aggregator of the price feed
     */
    function setPriceSource(
        address _asset,
        AggregatorV3Interface _aggregator
    ) external onlyOwner {
        if (address(_aggregator) == address(0) || _asset == address(0)) {
            revert InvalidPriceSource();
        }
        aggregators[_asset] = _aggregator;

        emit PriceSourceSet(_asset, address(_aggregator));
    }
}