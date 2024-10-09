// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {BaseSynonymPriceSource} from "./BaseSynonymPriceSource.sol";
import {ISynonymPriceOracle, ISynonymPriceSource, AggregatorV3Interface} from "../../interfaces/ISynonymPriceOracle.sol";

/**
 * @title SynonymPriceOracle
 */
contract SynonymPriceOracle is ISynonymPriceOracle, BaseSynonymPriceSource {
    mapping(address => PriceSource) public sources;
    AggregatorV3Interface public override sequencerUptimeFeed;
    uint256 public override sequencerGracePeriod;

    error InvalidAsset();
    error InvalidPriceSource();
    error InvalidMaxPriceAge();
    error InvalidSequencerFeed();
    error InvalidGracePeriod();
    error SequencerDown();

    event PriceSourceSet(address indexed asset, ISynonymPriceSource priceSource, uint256 maxPriceAge);
    event SequencerUptimeFeedSet(address indexed sequencerUptimeFeed, uint256 gracePeriod);

    constructor(
        string memory _outputAsset,
        AggregatorV3Interface _sequencerUptimeFeed,
        uint256 _sequencerGracePeriod
    ) BaseSynonymPriceSource(_outputAsset) {
        sequencerUptimeFeed = _sequencerUptimeFeed;
        sequencerGracePeriod = _sequencerGracePeriod;
    }

    function priceAvailable(address _asset) public view override returns (bool) {
        return sources[_asset].priceSource != ISynonymPriceSource(address(0));
    }

    function getPrice(address _asset) public view override returns (ISynonymPriceOracle.Price memory price) {
        return getPrice(_asset, sources[_asset].maxPriceAge);
    }

    function getPrice(address _asset, uint256 _maxAge) public view override returns (ISynonymPriceOracle.Price memory price) {
        if (!priceAvailable(_asset)) {
            revert InvalidPriceSource();
        }

        if (!_sequencerUpAndGracePeriodPassed()) {
            revert SequencerDown();
        }

        return sources[_asset].priceSource.getPrice(_asset, _maxAge);
    }

    function setSequencerUptimeFeed(AggregatorV3Interface _feed, uint256 _gracePeriod) public onlyOwner {
        if (address(_feed) == address(0)) {
            revert InvalidSequencerFeed();
        }

        if (_gracePeriod == 0) {
            revert InvalidGracePeriod();
        }

        sequencerUptimeFeed = _feed;
        sequencerGracePeriod = _gracePeriod;
        emit SequencerUptimeFeedSet(address(_feed), _gracePeriod);
    }

    /**
     * @notice Checks the sequencer oracle is healthy: is up and grace period passed.
     * @return True if the SequencerOracle is up and the grace period passed, false otherwise
     */
    function _sequencerUpAndGracePeriodPassed() internal view returns (bool) {
        (, int256 answer, uint256 startedAt,, ) = sequencerUptimeFeed.latestRoundData();
        // zero means the sequencer is up. there is a grace period that needs to elapse before we start accepting prices again - for things to stabilize.
        // it also allows users to repay any underwater loans that have become liquidatable during the outage
        // see https://docs.chain.link/data-feeds/l2-sequencer-feeds for more info
        return answer == 0 && block.timestamp - startedAt > sequencerGracePeriod;
    }

    function setPriceSource(
        address _asset,
        PriceSource memory _priceSource
    ) external override onlyOwner {
        if (_asset == address(0)) {
            revert InvalidAsset();
        }
        if (_priceSource.priceSource == ISynonymPriceSource(address(0))) {
            revert InvalidPriceSource();
        }
        if (_priceSource.maxPriceAge == 0) {
            revert InvalidMaxPriceAge();
        }
        if (keccak256(abi.encodePacked(_priceSource.priceSource.outputAsset())) != keccak256(abi.encodePacked(outputAsset))) {
            revert InvalidPriceSource();
        }
        sources[_asset] = _priceSource;

        emit PriceSourceSet(_asset, _priceSource.priceSource, _priceSource.maxPriceAge);
    }

    function removePriceSource(address _asset) external onlyOwner {
        if (sources[_asset].priceSource == ISynonymPriceSource(address(0))) {
            revert InvalidPriceSource();
        }
        delete sources[_asset];
        emit PriceSourceSet(_asset, ISynonymPriceSource(address(0)), 0);
    }

    function getPriceSource(address _asset) external view override returns (PriceSource memory) {
        if (sources[_asset].priceSource == ISynonymPriceSource(address(0))) {
            revert InvalidAsset();
        }
        return sources[_asset];
    }
}
