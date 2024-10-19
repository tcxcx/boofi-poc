// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// @dev this is so we can verify the deployed proxy contract

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

abstract contract TransparentUpgradeableProxyAccess is TransparentUpgradeableProxy {}