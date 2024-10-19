
pragma solidity ^0.8.13;

import "../src/WormholeRelayerSDK.sol";
import "../src/interfaces/IWormholeReceiver.sol";
import "../src/interfaces/IWormholeRelayer.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../src/testing/WormholeRelayerTest.sol";

import "../src/WormholeRelayerSDK.sol";
import "../src/CCTPBase.sol";
import "../src/Utils.sol";

contract CCTPToy is CCTPSender, CCTPReceiver {
    uint256 constant GAS_LIMIT = 250_000;

    constructor(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole,
        address _circleMessageTransmitter,
        address _circleTokenMessenger,
        address _USDC
    ) {
        initialize(
            _wormholeRelayer,
            _tokenBridge,
            _wormhole,
            _circleMessageTransmitter,
            _circleTokenMessenger,
            _USDC
        );
    }

    function initialize(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole,
        address _circleMessageTransmitter,
        address _circleTokenMessenger,
        address _USDC
    ) public {
        CCTPBase.__CCTPBase_init(
            _wormholeRelayer,
            _tokenBridge,
            _wormhole,
            _circleMessageTransmitter,
            _circleTokenMessenger,
            _USDC
        );
    }

    function quoteCrossChainDeposit(
        uint32 targetChain
    ) public view returns (uint256 cost) {
        // Cost of delivering token and payload to targetChain
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }

    function sendCrossChainDeposit(
        uint32 targetChain,
        address recipient,
        uint256 amount
    ) public payable {
        uint256 cost = quoteCrossChainDeposit(targetChain);
        require(
            msg.value == cost,
            "msg.value must be quoteCrossChainDeposit(targetChain)"
        );

        IERC20(USDC).transferFrom(msg.sender, address(this), amount);

        bytes memory payload = abi.encode(recipient, amount);
        sendUSDCWithPayloadToEvm(
            targetChain,
            fromWormholeFormat(registeredSenders[targetChain]), // address (on targetChain) to send token and payload to
            payload,
            0, // receiver value
            GAS_LIMIT,
            amount,
            targetChain, // refundChain
            recipient // refundAddress
        );
    }

    function receivePayloadAndUSDC(
        bytes memory payload,
        uint256 amount,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 // deliveryHash
    )
        internal
        override
        onlyWormholeRelayer
        isRegisteredSender(sourceChain, sourceAddress)
    {
        (address recipient, uint256 expectedAmount) = abi.decode(
            payload,
            (address, uint256)
        );
        require(amount == expectedAmount, "amount != payload.expectedAmount");
        IERC20(USDC).transfer(recipient, amount);
    }
}

contract WormholeSDKTest is WormholeRelayerBasicTest {
    CCTPToy CCTPToySource;
    CCTPToy CCTPToyTarget;
    ERC20Mock USDCSource;
    ERC20Mock USDCTarget;

    constructor() {
        setTestnetForkChains(2, 6);
    }

    function setUpSource() public override {
        USDCSource = ERC20Mock(address(sourceChainInfo.USDC));
        mintUSDC(sourceChain, address(this), 5000e18);
        CCTPToySource = new CCTPToy(
            address(relayerSource),
            address(tokenBridgeSource),
            address(wormholeSource),
            address(sourceChainInfo.circleMessageTransmitter),
            address(sourceChainInfo.circleTokenMessenger),
            address(USDCSource)
        );
    }

    function setUpTarget() public override {
        USDCTarget = ERC20Mock(address(targetChainInfo.USDC));
        mintUSDC(targetChain, address(this), 5000e18);
        CCTPToyTarget = new CCTPToy(
            address(relayerTarget),
            address(tokenBridgeTarget),
            address(wormholeTarget),
            address(targetChainInfo.circleMessageTransmitter),
            address(targetChainInfo.circleTokenMessenger),
            address(USDCTarget)
        );
    }

    function setUpGeneral() public override {
        vm.selectFork(sourceFork);
        CCTPToySource.setRegisteredSender(targetChain, toWormholeFormat(address(CCTPToyTarget)));

        vm.selectFork(targetFork);
        CCTPToyTarget.setRegisteredSender(sourceChain, toWormholeFormat(address(CCTPToySource)));
    }

    function testSendToken() public {
        vm.selectFork(sourceFork);

        uint256 amount = 100e6;
        USDCSource.approve(address(CCTPToySource), amount);

        vm.selectFork(targetFork);
        address recipient = 0x1234567890123456789012345678901234567890;

        vm.selectFork(sourceFork);
        uint256 cost = CCTPToySource.quoteCrossChainDeposit(targetChain);

        vm.recordLogs();
        CCTPToySource.sendCrossChainDeposit{value: cost}(
            targetChain,
            recipient,
            amount
        );
        performDelivery(true);

        vm.selectFork(targetFork);
        assertEq(IERC20(USDCTarget).balanceOf(recipient), amount);
    }

}
