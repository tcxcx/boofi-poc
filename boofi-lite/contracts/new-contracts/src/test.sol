// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "../lib/chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "../lib/chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

contract CCIPSenderMiniApp {
    using SafeERC20 for IERC20;

    IERC20 private s_linkToken;
    IRouterClient private s_router;

    // Values hardcoded for the hackathon
    // Only Allowing transfers to Polygon Amoy
    uint64 public constant s_destinationChainSelector = 16281711391670634445;

    // This contract will be deployed on Avax Fuji
    constructor(address _router, address _link) {
        s_linkToken = IERC20(_link);
        s_router = IRouterClient(_router);
    }

    function transferUSDC(
        address _receiver,
        address _token,
        uint256 _amount
    ) external returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(s_linkToken)
        );

        uint256 fees = s_router.getFee(
            s_destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > s_linkToken.balanceOf(address(this))) {
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);
        }

        // The contract must have enough LINK to pay the fees
        // The following 2 lines are just for hackathon purposes
        // I'd recommend to use a more `secure` way to approve the fees
        s_linkToken.approve(address(s_router), fees);
        IERC20(_token).approve(address(s_router), _amount);

        messageId = s_router.ccipSend(
            s_destinationChainSelector,
            evm2AnyMessage
        );
        return messageId;
    }

    function _buildCCIPMessage(
        address _receiver, // Who will receive the tokens, if it's a contract it must implement the CCIPReceiver
        address _token, // The address of the token to be transferred
        uint256 _amount, // The amount of tokens to be transferred
        address _feeTokenAddress //
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token, // will be USDC
            amount: _amount
        });
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: "", // empty string
                tokenAmounts: tokenAmounts, // The amount and type of token being transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                // Fees will be paid with LINK
                feeToken: _feeTokenAddress
            });
    }

    receive() external payable {}
}
