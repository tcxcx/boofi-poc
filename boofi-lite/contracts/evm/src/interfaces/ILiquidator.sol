// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./IHub.sol";
import "./ILiquidationCalculator.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice interface for external contracts that need to access Hub state
 */
interface ILiquidator {
    error NoZeroAddress();
    error InsufficientBalance();
    error FailedHubWithdrawal();
    error OnlyLiquidator();
    error InvalidFlashLoanInitiator();
    error InvalidFlashLoanParameters();

    event LiquidatorStatusChanged(address indexed liquidator, bool isLiquidator);
    event Withdraw(IERC20 indexed token, address indexed recipient, uint256 amount);

    function hub() external view returns (IHub);
    function addLiquidator(address _liquidator) external;
    function removeLiquidator(address _liquidator) external;
    function isLiquidator(address _liquidator) external view returns (bool);
    function withdraw(IERC20 _token, address _recipient, uint256 _amount) external;
    function withdrawHubDeposit(IERC20 _token, address _recipient, uint256 _amount) external;
    function liquidation(ILiquidationCalculator.LiquidationInput memory input) external;
}
