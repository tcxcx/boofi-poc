// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../src/WormholeRelayerSDK.sol";
import "../src/interfaces/IWormholeReceiver.sol";
import "../src/interfaces/IWormholeRelayer.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../src/testing/WormholeRelayerTest.sol";

import "../src/WormholeRelayerSDK.sol";
import "../src/Utils.sol";

import "forge-std/console.sol";

contract Toy is Base {
    IWormholeRelayer relayer;

    uint256 public payloadReceived;

    constructor(address _wormholeRelayer, address _wormhole) {
        initialize(_wormholeRelayer, _wormhole);
    }

    function initialize(address _wormholeRelayer, address _wormhole) public {
        Base.__Base_init(_wormholeRelayer, _wormhole);
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    ) public payable onlyWormholeRelayer replayProtect(deliveryHash) isRegisteredSender(sourceChain, sourceAddress) {
        payloadReceived = abi.decode(payload, (uint256));

        console.log("Toy received message");
        console.log("Payload", payloadReceived);
        console.log("Value Received", msg.value);
    }
}

contract TokenToy is TokenSender, TokenReceiver {
    constructor(address _wormholeRelayer, address _bridge, address _wormhole) {
        _initialize(_wormholeRelayer, _bridge, _wormhole);
    }

    function _initialize(address _wormholeRelayer, address _bridge, address _wormhole) internal {
        TokenBase.__TokenBase_init(_wormholeRelayer, _bridge, _wormhole);
    }

    uint256 constant GAS_LIMIT = 250_000;

    function quoteCrossChainDeposit(uint32 targetChain) public view returns (uint256 cost) {
        // Cost of delivering token and payload to targetChain
        uint256 deliveryCost;
        (deliveryCost,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);

        // Total cost: delivery cost + cost of publishing the 'sending token' wormhole message
        cost = deliveryCost + wormhole.messageFee();
    }

    function sendCrossChainDeposit(uint32 targetChain, address recipient, uint256 amount, address token)
        public
        payable
    {
        uint256 cost = quoteCrossChainDeposit(targetChain);
        require(msg.value == cost, "msg.value must be quoteCrossChainDeposit(targetChain)");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        bytes memory payload = abi.encode(recipient);
        sendTokenWithPayloadToEvm(
            targetChain,
            fromWormholeFormat(registeredSenders[targetChain]), // address (on targetChain) to send token and payload to
            payload,
            0, // receiver value
            GAS_LIMIT,
            token, // address of IERC20 token contract
            amount
        );
    }

    function sendCrossChainDeposit(
        uint32 targetChain,
        address recipient,
        uint256 amount,
        address token,
        uint32 refundChain,
        address refundAddress
    ) public payable {
        uint256 cost = quoteCrossChainDeposit(targetChain);
        require(msg.value == cost, "msg.value must be quoteCrossChainDeposit(targetChain)");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        bytes memory payload = abi.encode(recipient);
        sendTokenWithPayloadToEvm(
            targetChain,
            fromWormholeFormat(registeredSenders[targetChain]), // address (on targetChain) to send token and payload to
            payload,
            0, // receiver value
            GAS_LIMIT,
            token, // address of IERC20 token contract
            amount,
            refundChain,
            refundAddress
        );
    }

    function receivePayloadAndTokens(
        bytes memory payload,
        TokenReceived[] memory receivedTokens,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 // deliveryHash
    ) internal override onlyWormholeRelayer isRegisteredSender(sourceChain, sourceAddress) {
        require(receivedTokens.length == 1, "Expected 1 token transfers");
        address recipient = abi.decode(payload, (address));
        IERC20(receivedTokens[0].tokenAddress).transfer(recipient, receivedTokens[0].amount);
    }
}

contract WormholeSDKTest is WormholeRelayerBasicTest {
    Toy toySource;
    Toy toyTarget;
    TokenToy tokenToySource;
    TokenToy tokenToyTarget;
    ERC20Mock public token;

    function setUpSource() public override {
        toySource = new Toy(address(relayerSource), address(wormholeSource));
        toySource.setRegisteredSender(targetChain, toWormholeFormat(address(this)));

        tokenToySource = new TokenToy(address(relayerSource), address(tokenBridgeSource), address(wormholeSource));

        token = createAndAttestToken(sourceChain);
    }

    function setUpTarget() public override {
        toyTarget = new Toy(address(relayerTarget), address(wormholeTarget));
        toyTarget.setRegisteredSender(sourceChain, toWormholeFormat(address(this)));

        tokenToyTarget = new TokenToy(address(relayerTarget), address(tokenBridgeTarget), address(wormholeTarget));
    }

    function setUpGeneral() public override {
        vm.selectFork(sourceFork);
        tokenToySource.setRegisteredSender(targetChain, toWormholeFormat(address(tokenToyTarget)));

        vm.selectFork(targetFork);
        tokenToyTarget.setRegisteredSender(sourceChain, toWormholeFormat(address(tokenToySource)));
    }

    function testInitializer() public {
        toyTarget = new Toy(address(relayerTarget), address(wormholeTarget));
        vm.expectRevert(bytes("WRI"));
        toyTarget.initialize(address(relayerTarget), address(wormholeTarget));
    }

    function testSendMessage() public {
        vm.recordLogs();
        (uint256 cost,) = relayerSource.quoteEVMDeliveryPrice(targetChain, 1e17, 100_000);
        relayerSource.sendPayloadToEvm{value: cost}(targetChain, address(toyTarget), abi.encode(55), 1e17, 100_000);
        performDelivery();

        vm.selectFork(targetFork);
        require(55 == toyTarget.payloadReceived());
    }

    function testSendMessageSource() public {
        vm.selectFork(targetFork);
        vm.recordLogs();

        (uint256 cost,) = relayerTarget.quoteEVMDeliveryPrice(sourceChain, 1e17, 100_000);
        relayerTarget.sendPayloadToEvm{value: cost}(sourceChain, address(toySource), abi.encode(56), 1e17, 100_000);
        performDelivery();

        vm.selectFork(sourceFork);
        require(56 == toySource.payloadReceived());
    }

    function testSendToken() public {
        vm.selectFork(sourceFork);

        uint256 amount = 19e17;
        token.approve(address(tokenToySource), amount);

        vm.selectFork(targetFork);
        address recipient = 0x1234567890123456789012345678901234567890;

        vm.selectFork(sourceFork);
        uint256 cost = tokenToySource.quoteCrossChainDeposit(targetChain);

        vm.recordLogs();
        tokenToySource.sendCrossChainDeposit{value: cost}(targetChain, recipient, amount, address(token));
        performDelivery();

        vm.selectFork(targetFork);
        address wormholeWrappedToken = tokenBridgeTarget.wrappedAsset(sourceChain, toWormholeFormat(address(token)));
        assertEq(IERC20(wormholeWrappedToken).balanceOf(recipient), amount);
    }

    function testSendTokenWithRefund() public {
        vm.selectFork(sourceFork);

        uint256 amount = 19e17;
        token.approve(address(tokenToySource), amount);

        vm.selectFork(targetFork);
        address recipient = 0x1234567890123456789012345678901234567890;
        address refundAddress = 0x2234567890123456789012345678901234567890;
        vm.selectFork(sourceFork);
        uint256 cost = tokenToySource.quoteCrossChainDeposit(targetChain);

        vm.recordLogs();
        tokenToySource.sendCrossChainDeposit{value: cost}(
            targetChain, recipient, amount, address(token), targetChain, refundAddress
        );
        performDelivery();

        vm.selectFork(targetFork);
        address wormholeWrappedToken = tokenBridgeTarget.wrappedAsset(sourceChain, toWormholeFormat(address(token)));
        assertEq(IERC20(wormholeWrappedToken).balanceOf(recipient), amount);
        assertTrue(refundAddress.balance > 0);
    }
}
