// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/contracts/Hub.sol";
import "../src/contracts/TokenBridgeUtilities.sol";

contract DeployHub is Script {
    function run() external {
        vm.startBroadcast();

        // Load environment variables
        address wormholeRelayer = vm.envAddress("BASE_SEPOLIA_WORMHOLE_ADDRESS");
        address tokenBridge = vm.envAddress("BASE_SEPOLIA_TOKEN_BRIDGE_ADDRESS");
        address wormhole = vm.envAddress("BASE_SEPOLIA_WORMHOLE_RELAYER_ADDRESS");
        address circleMessageTransmitter = vm.envOr("BASE_SEPOLIA_CIRCLE_MESSAGE_TRANSMITTER", address(0));
        address circleTokenMessenger = vm.envOr("BASE_SEPOLIA_CIRCLE_TOKEN_MESSENGER", address(0));
        address USDC = vm.envOr("BASE_SEPOLIA_USDC_ADDRESS", address(0));

        uint256 interestAccrualIndexPrecision = 1e18;
        uint256 liquidationFee = 5e16; // 5%
        uint256 liquidationFeePrecision = 1e18;

        // Deploy TokenBridgeUtilities library
        TokenBridgeUtilities tokenBridgeUtilities = new TokenBridgeUtilities();
        address;
        libraries[0] = address(tokenBridgeUtilities);

        // Deploy Hub contract with the library linked
        Hub hub = new Hub();

        // Initialize the Hub
        hub.initialize(
            wormholeRelayer,
            tokenBridge,
            wormhole,
            circleMessageTransmitter,
            circleTokenMessenger,
            USDC,
            interestAccrualIndexPrecision,
            liquidationFee,
            liquidationFeePrecision
        );

        console.log("Hub deployed to:", address(hub));

        vm.stopBroadcast();
    }
}
