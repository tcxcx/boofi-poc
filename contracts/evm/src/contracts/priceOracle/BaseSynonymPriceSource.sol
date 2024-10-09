// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISynonymPriceSource} from "../../interfaces/ISynonymPriceSource.sol";

/**
 * @title BaseSynonymPriceOracle
 */
abstract contract BaseSynonymPriceSource is ISynonymPriceSource, Ownable {
    uint256 public constant PRICE_PRECISION = 1e18;
    bytes32 public constant OUTPUT_ASSET_USD = keccak256("USD");
    bytes32 public constant OUTPUT_ASSET_ETH = keccak256("ETH");
    string public override outputAsset;

    constructor(string memory _outputAsset) Ownable(msg.sender) {
        outputAsset = _outputAsset;
    }
}