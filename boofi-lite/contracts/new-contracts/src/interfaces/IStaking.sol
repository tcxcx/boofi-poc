// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStaking {
    function stake(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function balanceOf(address account) external view returns (uint256);
}
