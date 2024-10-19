// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ILiquidationCalculator} from "../interfaces/ILiquidationCalculator.sol";
import {IHubPriceUtilities} from "../interfaces/IHubPriceUtilities.sol";
import {IAssetRegistry} from "../interfaces/IAssetRegistry.sol";

/**
 * @title HubSpokeStructs
 * @notice A set of structs and enums used in the Hub and Spoke contracts
 */
library HubSpokeStructs {
    /**
     * @param wormhole: Address of the Wormhole contract
     * @param tokenBridge: Address of the TokenBridge contract
     * @param wormholeRelayer: Address of the WormholeRelayer contract
     * @param consistencyLevel: Desired level of finality the Wormhole guardians will reach before signing the messages
     * NOTE: consistencyLevel = 200 will result in an instant message, while all other values will wait for finality
     * Recommended finality levels can be found here: https://book.wormhole.com/reference/contracts.html
     * @param pythAddress: Address of the Pyth oracle on the Hub chain
     * @param priceStandardDeviations: priceStandardDeviations = (psd * priceStandardDeviationsPrecision), where psd is
     * the number of standard deviations that we use for our price intervals in calculations relating to allowing
     * withdraws, borrows, or liquidations
     * @param priceStandardDeviationsPrecision: A precision number that allows us to represent our desired noninteger
     * price standard deviation as an integer (psd = priceStandardDeviations/priceStandardDeviationsPrecision)
     * @param maxLiquidationPortionPrecision: A precision number that allows us to represent our desired noninteger
     * max liquidation portion mlp as an integer (mlp = maxLiquidationPortion/maxLiquidationPortionPrecision)
     * @param interestAccrualIndexPrecision: A precision number that allows us to represent our noninteger interest
     * accrual indices as integers; we store each index as its true value multiplied by interestAccrualIndexPrecision
     * @param collateralizationRatioPrecision: A precision number that allows us to represent our noninteger
     * collateralization ratios as integers; we store each ratio as its true value multiplied by
     * collateralizationRatioPrecision
     * @param liquidationFee: The fee taken by the protocol on liquidation
     * @param _circleMessageTransmitter: Circle Message Transmitter contract (cctp)
     * @param _circleTokenMessenger: Circle Token Messenger contract (cctp)
     * @param _USDC: USDC token contract (cctp)
     */
    struct ConstructorArgs {
        /* Wormhole Information */
        address wormhole;
        address tokenBridge;
        address wormholeRelayer;
        uint8 consistencyLevel;
        /* Liquidation Information */
        uint256 interestAccrualIndexPrecision;
        uint256 liquidationFee;
        uint256 liquidationFeePrecision;
        /* CCTP Information */
        address circleMessageTransmitter;
        address circleTokenMessenger;
        address USDC;
    }

    struct StoredVaultAmount {
        DenormalizedVaultAmount amounts;
        AccrualIndices accrualIndices;
    }

    struct DenormalizedVaultAmount {
        uint256 deposited;
        uint256 borrowed;
    }

    struct NotionalVaultAmount {
        uint256 deposited;
        uint256 borrowed;
    }

    struct AccrualIndices {
        uint256 deposited;
        uint256 borrowed;
    }

    /**
     * @dev Struct to hold the decoded data from a Wormhole payload
     * @param action The action to be performed (e.g., Deposit, Borrow, Withdraw, Repay)
     * @param sender The address of the sender initiating the action
     * @param wrappedAsset The address of the wrapped asset involved in the action
     * @param amount The amount of the wrapped asset involved in the action
     * @param unwrap A boolean indicating whether to unwrap the asset or not for native withdraws and borrows
     */
    struct PayloadData {
        Action action;
        address sender;
        address wrappedAsset;
        uint256 amount;
        bool unwrap;
    }

    struct CrossChainTarget {
        bytes32 addressWhFormat;
        uint32 chainId;
        bytes32 deliveryHash;
    }

    enum Action {
        Deposit,
        Borrow,
        Withdraw,
        Repay,
        DepositNative,
        RepayNative
    }

    struct HubState {
        // number of confirmations for wormhole messages
        uint8 consistencyLevel;
        // vault for lending
        mapping(address => mapping(address => HubSpokeStructs.StoredVaultAmount)) vault;
        // total asset amounts (tokenAddress => (uint256, uint256))
        mapping(address => HubSpokeStructs.StoredVaultAmount) totalAssets;
        // interest accrual indices
        mapping(address => HubSpokeStructs.AccrualIndices) indices;
        // last timestamp for update
        mapping(address => uint256) lastActivityBlockTimestamps;
        // interest accrual rate precision level
        uint256 interestAccrualIndexPrecision;
        // calculator for liquidation amounts
        ILiquidationCalculator liquidationCalculator;
        // price utilities for getting prices
        IHubPriceUtilities priceUtilities;
        // asset registry for getting asset info
        IAssetRegistry assetRegistry;
        // protocol fee taken on liquidation
        uint256 liquidationFee;
        // for wormhole relay quotes
        uint256 defaultGasLimit;
        // for refunding of returnCost amount
        uint256 refundGasLimit;
        // toggle for using CCTP for asset => USDC
        bool isUsingCCTP;
        // the precision of the liquidation fee
        uint256 liquidationFeePrecision;
    }
}
