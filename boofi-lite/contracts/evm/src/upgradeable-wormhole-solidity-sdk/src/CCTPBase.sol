// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWormholeReceiver.sol";
import "./interfaces/IWormholeRelayer.sol";
import "./interfaces/ITokenBridge.sol";
import "./interfaces/CCTPInterfaces/ITokenMessenger.sol";
import "./interfaces/CCTPInterfaces/IMessageTransmitter.sol";

import "./Utils.sol";
import {TokenBase} from "./WormholeRelayerSDK.sol";

library CCTPMessageLib {
    uint8 constant CCTP_KEY_TYPE = 2;

    // encoded using abi.encodePacked(domain, nonce)
    struct CCTPKey {
        uint32 domain;
        uint64 nonce;
    }

    // encoded using abi.encode(message, signature)
    struct CCTPMessage {
        bytes message;
        bytes signature;
    }
}

abstract contract CCTPBase is TokenBase {
    ITokenMessenger public circleTokenMessenger;
    IMessageTransmitter public circleMessageTransmitter;
    address public USDC;

    function __CCTPBase_init(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole,
        address _circleMessageTransmitter,
        address _circleTokenMessenger,
        address _USDC
    ) public {
        require(!_wormholeRelayerInitialized, "WRI");
        TokenBase.__TokenBase_init(_wormholeRelayer, _tokenBridge, _wormhole);
        circleTokenMessenger = ITokenMessenger(_circleTokenMessenger);
        circleMessageTransmitter = IMessageTransmitter(_circleMessageTransmitter);
        USDC = _USDC;
    }

    function getCCTPDomain(uint32 chain) internal pure returns (uint32) {
        if (chain == 2 || chain == 10002) {
            return 0;
        } else if (chain == 6) {
            return 1;
        } else if (chain == 23 || chain == 10003) {
            return 3;
        } else if (chain == 24 || chain == 10005) {
            return 2;
        } else if (chain == 30 || chain == 10004) {
            return 6;
        } else {
            revert("Wrong CCTP Domain");
        }
    }

    function redeemUSDC(bytes memory cctpMessage) internal returns (uint256 amount) {
        (bytes memory message, bytes memory signature) = abi.decode(cctpMessage, (bytes, bytes));
        uint256 beforeBalance = IERC20(USDC).balanceOf(address(this));
        circleMessageTransmitter.receiveMessage(message, signature);
        return IERC20(USDC).balanceOf(address(this)) - beforeBalance;
    }
}

abstract contract CCTPSender is CCTPBase {
    uint8 internal constant CONSISTENCY_LEVEL_FINALIZED = 15;

    using CCTPMessageLib for *;

    /**
     * transferTokens wraps common boilerplate for sending tokens to another chain using IWormholeRelayer
     * - approves tokenBridge to spend 'amount' of 'token'
     * - emits token transfer VAA
     * - returns VAA key for inclusion in WormholeRelayer `additionalVaas` argument
     *
     * Note: this requires that only the targetAddress can redeem transfers.
     *
     */

    function transferUSDC(uint256 amount, uint32 targetChain, address targetAddress)
        internal
        returns (MessageKey memory)
    {
        SafeERC20.forceApprove(IERC20(USDC), address(circleTokenMessenger), amount);
        uint64 nonce = circleTokenMessenger.depositForBurnWithCaller(
            amount,
            getCCTPDomain(targetChain),
            addressToBytes32CCTP(targetAddress),
            USDC,
            addressToBytes32CCTP(targetAddress)
        );
        return MessageKey(
            CCTPMessageLib.CCTP_KEY_TYPE, abi.encodePacked(getCCTPDomain(wormhole.chainId()), nonce)
        );
    }

    function sendUSDCWithPayloadToEvm(
        uint32 targetChain,
        address targetAddress,
        bytes memory payload,
        uint256 receiverValue,
        uint256 gasLimit,
        uint256 amount,
        uint32 refundChain,
        address refundAddress
    ) internal returns (uint64 sequence) {
        MessageKey[] memory messageKeys = new MessageKey[](1);
        messageKeys[0] = transferUSDC(amount, targetChain, targetAddress);

        address defaultDeliveryProvider = wormholeRelayer.getDefaultDeliveryProvider();

        (uint256 cost,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, receiverValue, gasLimit);

        sequence = wormholeRelayer.sendToEvm{value: cost}(
            targetChain,
            targetAddress,
            abi.encode(amount, payload),
            receiverValue,
            0,
            gasLimit,
            refundChain,
            refundAddress,
            defaultDeliveryProvider,
            messageKeys,
            CONSISTENCY_LEVEL_FINALIZED
        );
    }

    function addressToBytes32CCTP(address addr) private pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}

abstract contract CCTPReceiver is CCTPBase {
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory additionalMessages,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    ) external virtual payable {
        _receiveWormholeMessagesWithCCTP(payload, additionalMessages, sourceAddress, sourceChain, deliveryHash);
    }

    function _receiveWormholeMessagesWithCCTP(
        bytes memory payload,
        bytes[] memory additionalMessages,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    ) internal {
        require(additionalMessages.length <= 1, "CCTP: At most one Message is supported");

        uint256 amountUSDCReceived;
        if (additionalMessages.length == 1) {
            amountUSDCReceived = redeemUSDC(additionalMessages[0]);
        }

        (uint256 amount, bytes memory userPayload) = abi.decode(payload, (uint256, bytes));

        // Check that the correct amount was received
        // It is important to verify that the 'USDC' received is
        require(amount == amountUSDCReceived, "Wrong amount received");

        receivePayloadAndUSDC(userPayload, amountUSDCReceived, sourceAddress, sourceChain, deliveryHash);
    }

    function receivePayloadAndUSDC(
        bytes memory payload,
        uint256 amountUSDCReceived,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    ) internal virtual {}
}
