// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestnetSequencerFeed
 * @notice An mock feed to be deployed in Arb Sepolia testnet
 */
contract TestnetSequencerFeed is AggregatorV3Interface, Ownable {
    int256 isDown;
    uint256 lastUpdateTimestamp;
    uint80 latestRoundId;

    constructor() Ownable(msg.sender) {
        isDown = 0;
        lastUpdateTimestamp = block.timestamp;
        latestRoundId = 1;
    }

    function setIsDown(bool _isDown) external onlyOwner {
        isDown = _isDown ? int256(1) : int256(0);
        lastUpdateTimestamp = block.timestamp;
        latestRoundId++;
    }

    function decimals() external pure override returns (uint8) {
        return 0;
    }

    function description() external pure override returns (string memory) {
        return "testnet sequencer feed";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80) external pure override returns (uint80, int256, uint256, uint256, uint80) {
        revert("testnet sequencer feed can only return latest round data");
    }

    /**
     * The adapter is mocking roundId as the sum of roundIds of its sources.
     * Since the source roundIds are strictly monotonic this should result in unique and monotonic roundIds.
     *
     * @return roundId Sum of source roundIds
     * @return answer The result price
     * @return startedAt Smallest of the source startedAts
     * @return updatedAt Largest of the source updatedAts
     * @return answeredInRound Sum of source answeredInRounds
     */
    function latestRoundData() external view override returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) {
        roundId = latestRoundId;
        answer = isDown;
        startedAt = lastUpdateTimestamp;
        updatedAt = lastUpdateTimestamp;
        answeredInRound = latestRoundId;
    }
}