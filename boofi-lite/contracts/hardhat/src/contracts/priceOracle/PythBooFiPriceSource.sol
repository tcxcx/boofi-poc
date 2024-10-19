// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IPyth, PythStructs} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {BaseBooFiPriceSource} from "./BaseBooFiPriceSource.sol";

/**
 * @title BooFiPriceSource
 */
contract PythBooFiPriceSource is BaseBooFiPriceSource {
    IPyth public pyth;

    mapping(address => bytes32) public assetPythIds;

    error PythExpoExpectedToBeNegative();
    error NoZeroOrNegativePrices();
    error InvalidPriceSource();

    event PythSet(address indexed pyth);
    event PriceSourceSet(address indexed asset, bytes32 pythId);

    /**
     * @notice contract constructor
     */
    constructor(IPyth _pyth, string memory _outputAsset) BaseBooFiPriceSource(_outputAsset) {
        setPyth(_pyth);
    }

    function priceAvailable(address _asset) public view override returns (bool) {
        return assetPythIds[_asset] != bytes32(0);
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

        PythStructs.Price memory oraclePrice = pyth.getPriceNoOlderThan(assetPythIds[_asset], _maxAge);

        if (oraclePrice.expo > 0) {
            revert PythExpoExpectedToBeNegative();
        }

        if (oraclePrice.price <= 0) {
            revert NoZeroOrNegativePrices();
        }

        uint256 oraclePrecision = uint256(10 ** uint64(uint32(-oraclePrice.expo)));
        price.price = uint256(uint64(oraclePrice.price)) * price.precision / oraclePrecision;
        price.confidence = uint256(uint64(oraclePrice.conf)) * price.precision / oraclePrecision;
        price.updatedAt = oraclePrice.publishTime;
    }

    /**
     * @notice Set the pyth address
     * @param _pyth The pyth address
     */
    function setPyth(IPyth _pyth) public onlyOwner {
        if (address(_pyth) == address(0)) {
            revert InvalidPriceSource();
        }
        pyth = _pyth;
        emit PythSet(address(_pyth));
    }

    /**
     * Sets or unsets pyth / chainlink price source for an asset
     * @param _asset The asset for which the sources are being changed
     * @param _pythId The pythId of the price feed
     */
    function setPriceSource(
        address _asset,
        bytes32 _pythId
    ) external onlyOwner {
        if (_pythId == bytes32(0) || _asset == address(0)) {
            revert InvalidPriceSource();
        }
        assetPythIds[_asset] = _pythId;

        emit PriceSourceSet(_asset, _pythId);
    }
}