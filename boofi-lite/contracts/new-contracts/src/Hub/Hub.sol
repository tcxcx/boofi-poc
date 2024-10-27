// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title CrossChainReceiver
 * @dev This contract receives tokens via Wormhole cross-chain transfers,
 *      and deposits them into the LiquidityProvider (FlashLoanAndAutoStake) contract.
 */

// Required imports
import "lib/wormhole-solidity-sdk/src/WormholeRelayerSDK.sol";
import "lib/wormhole-solidity-sdk/src/interfaces/IERC20.sol";
import {FlashLoanAndAutoStake} from "../FlashLoanAndAutoStake.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CrossChainReceiver is TokenReceiver, Ownable {
    address public liquidityProvider;

    event TokensDeposited(address token, address to, uint256 amount);
    mapping(address => uint256) public userBalances;

    /**
     * @dev Constructor initializes the contract with necessary addresses.
     * @param _wormholeRelayer The address of the Wormhole Relayer
     * @param _tokenBridge The address of the Wormhole Token Bridge
     * @param _wormhole The address of the Wormhole Core contract
     * @param _liquidityProvider The address of the LiquidityProvider (FlashLoanAndAutoStake) contract
     */
    constructor(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole,
        address _liquidityProvider
    ) TokenBase(_wormholeRelayer, _tokenBridge, _wormhole) Ownable(msg.sender) {
        liquidityProvider = _liquidityProvider;
    }

    /**
     * @dev Allows the owner to set a new liquidity provider address.
     * @param newLiquidityProvider The address of the new liquidity provider
     */
    function setLiquidityProvider(
        address newLiquidityProvider
    ) external onlyOwner {
        require(newLiquidityProvider != address(0), "Invalid address");
        liquidityProvider = newLiquidityProvider;
    }

    /**
     * @dev Receives the cross-chain payload and tokens, and deposits tokens into the liquidity provider.
     * @param payload The payload sent from the source chain
     * @param receivedTokens Array containing details of the received tokens
     * @param sourceAddress The address of the source contract on the source chain
     * @param sourceChain The ID of the source chain
     */
    function receivePayloadAndTokens(
        bytes memory payload,
        TokenReceived[] memory receivedTokens,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32 // deliveryHash (not used in this implementation)
    )
        internal
        override
        onlyWormholeRelayer
        isRegisteredSender(sourceChain, sourceAddress)
    {
        require(receivedTokens.length == 1, "Expected 1 token transfer");

        // Decode the recipient address from the payload
        address recipient = abi.decode(payload, (address));

        // Update the user's balance
        userBalances[recipient] += receivedTokens[0].amount;

        // Transfer tokens to the LiquidityProvider (FlashLoanAndAutoStake) contract
        IERC20(receivedTokens[0].tokenAddress).transfer(
            liquidityProvider,
            receivedTokens[0].amount
        );

        emit TokensDeposited(
            receivedTokens[0].tokenAddress,
            liquidityProvider,
            receivedTokens[0].amount
        );

        // Notify the LiquidityProvider contract to handle the received tokens
        FlashLoanAndAutoStake(liquidityProvider).handleReceivedTokens(
            receivedTokens[0].tokenAddress,
            receivedTokens[0].amount
        );
    }
}
