// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./BaseSynonymPriceSource.sol";

/**
 * @title ChainedPriceSource
 * @notice An adapter to chain multiple ISynonymPriceSource price feeds into a single price feed
 */
contract ChainedPriceSource is BaseSynonymPriceSource {
    struct ChainedSource {
        ISynonymPriceSource source;
        address inputAsset;
        string outputAsset;
        uint256 maxPriceAge;
    }

    error CallingMaxPriceAgeMustBeUint256Max();

    ChainedSource[] public sources;

    constructor(
        ChainedSource[] memory _sources
    ) BaseSynonymPriceSource(_sources[_sources.length - 1].outputAsset) {
        require(_sources.length > 0, "ChainedPriceSource: no sources");
        for (uint256 i = 0; i < _sources.length; i++) {
            require(
                _sources[i].source.priceAvailable(_sources[i].inputAsset) &&
                keccak256(abi.encodePacked(_sources[i].source.outputAsset())) == keccak256(abi.encodePacked(_sources[i].outputAsset)) &&
                _sources[i].maxPriceAge > 0,
                "ChainedPriceSource: invalid source"
            );
            sources.push(_sources[i]);
        }
    }

    function priceAvailable(address _asset) public view override returns (bool) {
        return _asset == sources[0].inputAsset;
    }

    function getPrice(address _asset, uint256 _maxPriceAge) external view override returns (Price memory price) {
        if (!priceAvailable(_asset)) {
            revert NoPriceForAsset();
        }

        if (_maxPriceAge != type(uint256).max) {
            // each price source has its own defined max price age
            // require calling getPrice with max to avoid expecting a different behavior
            revert CallingMaxPriceAgeMustBeUint256Max();
        }

        for (uint256 i = 0; i < sources.length; i++) {
            Price memory _sourcePrice = sources[i].source.getPrice(sources[i].inputAsset, sources[i].maxPriceAge);
            if (i == 0) {
                // first element of the chain. seed the price and scale to target precision
                price.price = _sourcePrice.price * PRICE_PRECISION / _sourcePrice.precision;
                price.confidence = _sourcePrice.confidence;
                // this is just for interface compatibility
                // _maxAge is checked in each of the sources independently
                price.updatedAt = _sourcePrice.updatedAt;
            } else {
                uint256 previousSourcePrice = price.price;
                price.price = price.price * _sourcePrice.price / _sourcePrice.precision;
                // let's assume prices (a and b) and confidences (da and db). we need to calculate the error dz of product z = a * b
                // the error formula for the product is:
                // dz / z = (da / a) + (db / b)
                // dz = z * (da / a + db / b)
                // z = a * b
                // dz = a * b * (da / a + db / b)
                // dz = da * b + db * a
                price.confidence = (price.confidence * _sourcePrice.price + previousSourcePrice * _sourcePrice.confidence) / _sourcePrice.precision;
                // precision sanity check
                // 18                     18               6                      18                     6                        6

                if (price.updatedAt > _sourcePrice.updatedAt) {
                    // use the oldest updatedAt
                    price.updatedAt = _sourcePrice.updatedAt;
                }
            }
        }
        price.precision = PRICE_PRECISION;
    }
}