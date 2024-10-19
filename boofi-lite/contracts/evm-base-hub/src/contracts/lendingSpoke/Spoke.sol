// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {TokenSender} from "../../upgradeable-wormhole-solidity-sdk/src/WormholeRelayerSDK.sol";
import {CCTPSender, CCTPBase} from "../../upgradeable-wormhole-solidity-sdk/src/CCTPBase.sol";
import {VaaKey} from "../../upgradeable-wormhole-solidity-sdk/src/interfaces/IWormholeRelayer.sol";
import "../../upgradeable-wormhole-solidity-sdk/src/Utils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../HubSpokeStructs.sol";
import "./SpokeGetters.sol";
import "../wormhole/TokenReceiverWithCCTP.sol";
import "../wormhole/TokenBridgeUtilities.sol";

/**
 * @title Spoke
 * @notice The Spoke contract is the point of entry for cross-chain actions; users initiate an action by calling any of
 * the `public payable` functions (ex: `#depositCollateral`, `#withdrawCollateral`) with their desired asset and amount,
 * and using Wormhole we send the payload/tokens to the Hub on the target chain; if the action concludes with sending
 * tokens back to the user, we receive the final payload/tokens from the Hub before sending tokens to the user. This
 * contract also implements wormhole's CCTP contracts to send/receive USDC.
 */

contract Spoke is SpokeGetters, TokenSender, CCTPSender, TokenReceiverWithCCTP, Ownable {
    using SafeERC20 for IERC20;

    /**
     * @notice Spoke constructor - Initializes a new spoke with given parameters
     *
     * @param chainId: Chain ID of the chain that this Spoke is deployed on
     * @param wormhole: Address of the Wormhole contract on this Spoke chain
     * @param tokenBridge: Address of the TokenBridge contract on this Spoke chain
     * @param relayer: Address of the WormholeRelayer contract on this Spoke chain
     * @param hubChainId: Chain ID of the Hub
     * @param hubContractAddress: Contract address of the Hub contract (on the Hub chain)
     * @param _circleMessageTransmitter: Circle Message Transmitter contract (cctp)
     * @param _circleTokenMessenger: Circle Token Messenger contract (cctp)
     * @param _USDC: USDC token contract (cctp)
     */
    constructor(
        uint32 chainId,
        address wormhole,
        address tokenBridge,
        address relayer,
        uint32 hubChainId,
        address hubContractAddress,
        address _circleMessageTransmitter,
        address _circleTokenMessenger,
        address _USDC
    ) Ownable(msg.sender) {
        CCTPBase.__CCTPBase_init(
            relayer,
            tokenBridge,
            wormhole,
            _circleMessageTransmitter,
            _circleTokenMessenger,
            _USDC
        );
        _state.chainId = chainId;
        _state.hubChainId = hubChainId;
        _state.hubContractAddress = hubContractAddress;
        _state.defaultGasLimitRoundtrip = 650_000;
        _state.isUsingCCTP = _circleMessageTransmitter != address(0); // zero address would indicate not using/supported
        setRegisteredSender(hubChainId, toWormholeFormat(hubContractAddress));
        // disable the registrationOwner so that the Hub can't be changed.
        registrationOwner = address(0);
    }

    /**
     * @notice Allows the contract deployer to set the default gas limit used in wormhole relay quotes
     *
     * @param value: the new value for `defaultGasLimitRoundtrip`
     */
    function setDefaultGasLimitRoundtrip(uint256 value) external onlyOwner {
        _state.defaultGasLimitRoundtrip = value;
    }

    /**
     * @notice Allows the contract deployer to toggle whether we are using CCTP for USDC
     * NOTE: If `_circleMessageTransmitter` is the null address, it indicates CCTP is not supported on this chain, thus
     * we don't do anything.
     *
     * @param value: the new value for `isUsingCCTP`
     */
    function setIsUsingCCTP(bool value) external onlyOwner {
        if (address(circleMessageTransmitter) == address(0)) return; // zero address would indicate not using/supported

        _state.isUsingCCTP = value;
    }

    /**
     * @notice Allows the caller to initiate a cross-chain deposit. The caller must have approved the `assetAmount` of
     * `asset` and must have provided enough `msg.value` to cover the relay
     *
     * @param asset: Addresss of the asset to deposit
     * @param assetAmount: Amount of the asset to deposit
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub (for refunds)
     * @return sequence number of the message sent.
     */
    function depositCollateral(address asset, uint256 assetAmount, uint256 costForReturnDelivery)
        public
        payable
        returns (uint64 sequence)
    {
        require(msg.value >= getDeliveryCostRoundtrip(costForReturnDelivery, true), "Insufficient value sent");
        sequence = _doAction(HubSpokeStructs.Action.Deposit, asset, assetAmount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain withdraw. The caller must have provided enough `msg.value`
     * to cover the relay and the return delivery
     *
     * @param asset: Addresss of the asset to withdraw
     * @param assetAmount: Amount of the asset to withdraw
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub
     * @return sequence number of the message sent.
     */
    function withdrawCollateral(address asset, uint256 assetAmount, uint256 costForReturnDelivery)
        public
        payable
        returns (uint64 sequence)
    {
        require(costForReturnDelivery > 0, "Non-zero costForReturnDelivery");
        sequence = _doAction(HubSpokeStructs.Action.Withdraw, asset, assetAmount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain borrow. The caller must have provided enough `msg.value`
     * to cover the relay and the return delivery
     *
     * @param asset: Addresss of the asset to borrow
     * @param assetAmount: Amount of the asset to borrow
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub
     * @return sequence number of the message sent.
     */
    function borrow(address asset, uint256 assetAmount, uint256 costForReturnDelivery)
        public
        payable
        returns (uint64 sequence)
    {
        require(costForReturnDelivery > 0, "Non-zero costForReturnDelivery");
        sequence = _doAction(HubSpokeStructs.Action.Borrow, asset, assetAmount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain repay. The caller must have approved the `assetAmount` of
     * `asset` and must have provided enough `msg.value` to cover the relay
     *
     * @param asset: Addresss of the asset to borrow
     * @param assetAmount: Amount of the asset to borrow
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub (for refunds)
     * @return sequence number of the message sent.
     */
    function repay(address asset, uint256 assetAmount, uint256 costForReturnDelivery)
        public
        payable
        returns (uint64 sequence)
    {
        require(msg.value >= getDeliveryCostRoundtrip(costForReturnDelivery, true), "Insufficient value sent");
        sequence = _doAction(HubSpokeStructs.Action.Repay, asset, assetAmount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain deposit with native tokens. The caller must have provided
     * enough `msg.value` to cover the relay+return and their desired deposit amount
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub (for refunds)
     * enough `msg.value` to cover the relay and their desired deposit amount
     * @return sequence number of the message sent.
     */
    function depositCollateralNative(uint256 costForReturnDelivery) public payable returns (uint64 sequence) {
        uint256 totalCost = getDeliveryCostRoundtrip(costForReturnDelivery, true);
        require(msg.value >= totalCost, "Spoke::depositCollateralNative:Insufficient value sent");
        uint256 amount = msg.value - totalCost;

        sequence = _doAction(HubSpokeStructs.Action.DepositNative, address(0), amount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain repay with native tokens. The caller must have provided
     * enough `msg.value` to cover the relay+return and their desired repay amount
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub (for refunds)
     * enough `msg.value` to cover the relay and their desired repay amount
     * @return sequence number of the message sent.
     */
    function repayNative(uint256 costForReturnDelivery) public payable returns (uint64 sequence) {
        uint256 totalCost = getDeliveryCostRoundtrip(costForReturnDelivery, true);
        require(msg.value >= totalCost, "Spoke::repayNative:Insufficient value sent");
        uint256 amount = msg.value - totalCost;

        sequence = _doAction(HubSpokeStructs.Action.RepayNative, address(0), amount, costForReturnDelivery, false);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain withdraw with native tokens. The caller must have provided
     * enough `msg.value` to cover the relay and the return delivery
     *
     * @param assetAmount: Amount of the asset to withdraw
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub
     * @param unwrap: Whether to unwrap the native tokens or not
     * @return sequence number of the message sent.
     */
    function withdrawCollateralNative(uint256 assetAmount, uint256 costForReturnDelivery, bool unwrap)
        public
        payable
        returns (uint64 sequence)
    {
        sequence = _doAction(HubSpokeStructs.Action.Withdraw, address(tokenBridge.WETH()), assetAmount, costForReturnDelivery, unwrap);
    }

    /**
     * @notice Allows the caller to initiate a cross-chain borrow with native tokens. The caller must have provided
     * enough `msg.value` to cover the relay and the return delivery
     *
     * @param assetAmount: Amount of the asset to borrow
     * @param costForReturnDelivery: The quoted cost for return delivery from the Hub
     * @param unwrap: Whether to unwrap the native tokens or not
     * @return sequence number of the message sent.
     */
    function borrowNative(uint256 assetAmount, uint256 costForReturnDelivery, bool unwrap)
        public
        payable
        returns (uint64 sequence)
    {
        sequence = _doAction(HubSpokeStructs.Action.Borrow, address(tokenBridge.WETH()), assetAmount, costForReturnDelivery, unwrap);
    }

    /**
     * @notice Get the quote for the wormhole delivery cost, accounting for a forward() call on the Hub (in case of potential
     * reverts or to receive tokens on borrow/withdraw)
     *
     * @param costForReturnDelivery: the result of Hub#getCostForReturnDelivery()
     * @param withTokenTransfer: whether to include the message fee for a token bridge transfer (on deposit or repay)
     * @return cost for the forward() call on the Hub
     */
    function getDeliveryCostRoundtrip(uint256 costForReturnDelivery, bool withTokenTransfer)
        public
        view
        returns (uint256)
    {
        (uint256 cost,) =
            wormholeRelayer.quoteEVMDeliveryPrice(hubChainId(), costForReturnDelivery, defaultGasLimitRoundtrip());

        if (withTokenTransfer) {
            return cost + tokenBridge.wormhole().messageFee();
        }

        return cost;
    }

    /**
     * @dev Initiates an action (deposit, borrow, withdraw, or repay) on the spoke by sending
     * a Wormhole message (potentially a TokenBridge message with tokens) to the Hub
     * @param action - the action to be performed. It can be Deposit, Borrow, Withdraw, Repay, DepositNative, RepayNative.
     * @param asset - the address of the relevant asset. For native tokens like ETH, AVAX, this will be the zero address.
     * @param assetAmount - the amount of the asset to be involved in the action.
     * @param costForReturnDelivery - the cost to forward tokens back from the Hub
     * @param unwrap - a boolean value indicating whether to unwrap the asset or not.
     * @return sequence number of the message sent.
     */
    function _doAction(HubSpokeStructs.Action action, address asset, uint256 assetAmount, uint256 costForReturnDelivery, bool unwrap)
        internal
        returns (uint64 sequence)
    {

        require(assetAmount > 0, "No zero asset amount");

        bool withCCTP = asset == USDC && _state.isUsingCCTP;

        // for token transfers, only validate amount if we're using the token bridge
        if (!withCCTP) {
            TokenBridgeUtilities.requireAssetAmountValidForTokenBridge(asset, assetAmount);
        }

        HubSpokeStructs.Action hubAction = action;

        if (action == HubSpokeStructs.Action.DepositNative) {
            hubAction = HubSpokeStructs.Action.Deposit;
        } else if (action == HubSpokeStructs.Action.RepayNative) {
            hubAction = HubSpokeStructs.Action.Repay;
        }

        bool sendingTokens = action == HubSpokeStructs.Action.Deposit || action == HubSpokeStructs.Action.Repay;
        bool sendingUSDC = withCCTP && sendingTokens;
        bool receivingUSDC = withCCTP && !sendingTokens;
        bytes memory userPayload = abi.encode(uint8(hubAction), msg.sender, asset, unwrap, sendingUSDC, receivingUSDC);
        bytes memory payload = sendingUSDC
            ? userPayload
            : abi.encode(assetAmount, userPayload); // encoding again so it's the same format as cctp messages

        if (sendingTokens) {
            sequence = withCCTP
                ? _sendUSDCWithPayload(payload, assetAmount, costForReturnDelivery)
                : _sendTokenBridgeMessage(payload, asset, assetAmount, costForReturnDelivery);
        } else if (action == HubSpokeStructs.Action.Withdraw || action == HubSpokeStructs.Action.Borrow) {
            sequence = wormholeRelayer.sendPayloadToEvm{value: msg.value}(
                hubChainId(),
                hubContractAddress(),
                payload,
                costForReturnDelivery,
                defaultGasLimitRoundtrip(),
                chainId(), // refundChain
                msg.sender // refundAddress
            );
        } else if (action == HubSpokeStructs.Action.DepositNative || action == HubSpokeStructs.Action.RepayNative) {
            sequence = _sendTokenBridgeMessageNative(payload, assetAmount, costForReturnDelivery);
        }
    }

    /**
     * @dev Sends EVM Worlhole Relayer a message with the given payload and value
     * @param value - amount of ETH to be sent to relayer
     * @param payload - the payload to be sent
     * @param costForReturnDelivery - the cost to forward tokens back from the Hub
     * @param refundAddress The address on `refundChain` to deliver any refund to
     * @return sequence - the sequence number of the message sent
     */
    function _sendToEvmWormHoleRelayer(
        uint256 value,
        bytes memory payload,
        uint256 costForReturnDelivery,
        address refundAddress
    ) internal returns(uint64 sequence) {
        return wormholeRelayer.sendPayloadToEvm{value: value}(
            hubChainId(),
            hubContractAddress(),
            payload,
            costForReturnDelivery,
            defaultGasLimitRoundtrip(),
            hubChainId(),
            refundAddress
        );
    }

    /**
     * @dev Sends a TokenBridge message with the given payload, asset, and amount
     * @param payload - the payload to be sent
     * @param asset - the address of the asset to be sent
     * @param amount - the amount of the asset to be sent
     * @param costForReturnDelivery - the cost to forward tokens back from the Hub
     * @return sequence - the sequence number of the message sent
     */
    function _sendTokenBridgeMessage(bytes memory payload, address asset, uint256 amount, uint256 costForReturnDelivery)
        internal
        returns (uint64)
    {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        return sendTokenWithPayloadToEvm(
            hubChainId(),
            hubContractAddress(),
            payload,
            costForReturnDelivery,
            defaultGasLimitRoundtrip(),
            asset,
            amount,
            chainId(), // refundChain
            msg.sender // refundAddress
        );
    }

    /**
     * @dev Sends a TokenBridge message with the given payload and amount in native tokens
     * @param payload - the payload to be sent
     * @param amount - the amount of native tokens to be sent
     * @param costForReturnDelivery - the cost to forward tokens back from the Hub
     * @return sequence - the sequence number of the message sent
     */
    function _sendTokenBridgeMessageNative(bytes memory payload, uint256 amount, uint256 costForReturnDelivery)
        internal
        returns (uint64)
    {
        uint256 amountPlusFee = amount + tokenBridge.wormhole().messageFee();
        uint64 sequence = tokenBridge.wrapAndTransferETHWithPayload{value: amountPlusFee}(
            hubChainId(), toWormholeFormat(hubContractAddress()), 0, payload
        );

        VaaKey[] memory additionalVaas = new VaaKey[](1);
        additionalVaas[0] = VaaKey(chainId(), toWormholeFormat(address(tokenBridge)), sequence);

        uint256 deliveryCost = getDeliveryCostRoundtrip(costForReturnDelivery, false);
        return wormholeRelayer.sendVaasToEvm{value: deliveryCost}(
            hubChainId(),
            hubContractAddress(),
            payload,
            costForReturnDelivery,
            defaultGasLimitRoundtrip(),
            additionalVaas,
            chainId(), // refundChain
            msg.sender // refundAddress
        );
    }

    /**
     * @dev Sends USDC with the given payload via wormhole's CCTP integration
     * @param payload - the payload to be sent
     * @param amount - the amount of the asset to be sent
     * @param costForReturnDelivery - the cost to forward tokens back from the Hub
     * @return sequence - the sequence number of the message sent
     */
    function _sendUSDCWithPayload(bytes memory payload, uint256 amount, uint256 costForReturnDelivery)
        internal
        returns (uint64)
    {
        IERC20(USDC).safeTransferFrom(msg.sender, address(this), amount);

        return sendUSDCWithPayloadToEvm(
            hubChainId(),
            hubContractAddress(),
            payload,
            costForReturnDelivery,
            defaultGasLimitRoundtrip(),
            amount,
            chainId(), // refundChain
            msg.sender // refundAddress
        );
    }

    /**
     * @dev Returns whether we are using CCTP while receiving wormhole messages, as specified in the encoded `payload`
     * @param payload - the payload received
     */
    function messageWithCCTP(bytes memory payload) internal pure override returns (bool) {
        (,, bool withCCTP) = _decodePayload(payload);

        // NOTE: we are not checking _state.isUsingCCTP here in order to handle it as best effort
        return withCCTP;
    }

    function receiveWormholeMessages(
          bytes memory payload,
          bytes[] memory additionalVaas,
          bytes32 sourceAddress,
          uint32 sourceChain,
          bytes32 deliveryHash
    ) public virtual override(TokenReceiverWithCCTP) payable {
        if (additionalVaas.length == 0) {
            (address recipient,,) = _decodePayload(payload);
            // send any refund back to the recipient
            if (msg.value > 0) {
                (bool refundSuccess,) = recipient.call{value: msg.value}("");
                require(refundSuccess, "refund failed");
            }
        } else {
            super.receiveWormholeMessages(payload, additionalVaas, sourceAddress, sourceChain, deliveryHash);
        }
    }

    /**
     * @dev Receives a payload and tokens, and processes them
     * @param payload - the payload received
     * @param receivedTokens - the tokens received
     * @param sourceAddress - the source address of the tokens
     * @param sourceChain - the source chain of the tokens
     * @param deliveryHash - the delivery hash of the tokens
     */
    function receivePayloadAndTokens(
        bytes memory payload,
        TokenReceived[] memory receivedTokens,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    )
        internal
        override
        onlyWormholeRelayer
        isRegisteredSender(sourceChain, sourceAddress)
        replayProtect(deliveryHash)
    {
        require(receivedTokens.length == 1, "Expecting one transfer");

        TokenReceived memory receivedToken = receivedTokens[0];
        (address recipient, bool unwrap,) = _decodePayload(payload);
        if (unwrap) {
            // unwrap and transfer to recipient
            tokenBridge.WETH().withdraw(receivedToken.amount);
            (bool withdrawSuccess,) = recipient.call{value: receivedToken.amount}("");
            require(withdrawSuccess, "withdraw to native failed");
        } else {
            IERC20(receivedToken.tokenAddress).safeTransfer(recipient, receivedToken.amount);
        }

        // send any refund back to the recipient
        if (msg.value > 0) {
            (bool refundSuccess,) = recipient.call{value: msg.value}("");
            require(refundSuccess, "refund failed");
        }
    }

    /**
     * @dev Receives a payload and USDC via CCTP
     * @param userPayload - the payload received
     * @param amountUSDCReceived - the amount of USDC received
     * @param sourceAddress - the source address of the tokens
     * @param sourceChain - the source chain of the tokens
     * @param deliveryHash - the delivery hash of the tokens
     */
    function receivePayloadAndUSDC(
        bytes memory userPayload,
        uint256 amountUSDCReceived,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    )
        internal
        override
        onlyWormholeRelayer
        isRegisteredSender(sourceChain, sourceAddress)
        replayProtect(deliveryHash)
    {
        (address recipient,,) = abi.decode(userPayload, (address, bool, bool));

        IERC20(USDC).safeTransfer(recipient, amountUSDCReceived);

        // send any refund back to the recipient
        if (msg.value > 0) {
            (bool refundSuccess,) = recipient.call{value: msg.value}("");
            require(refundSuccess, "refund failed");
        }
    }

    /**
     * @dev Decodes `payload` into expected arguments
     * @param payload - the payload received
     */
    function _decodePayload(
        bytes memory payload
    ) internal pure returns (address recipient, bool unwrap, bool withCCTP) {
        (, bytes memory userPayload) = abi.decode(payload, (uint256, bytes));
        (recipient, unwrap, withCCTP) = abi.decode(userPayload, (address, bool, bool));
    }

    /**
     * @notice fallback function to receive unwrapped native asset
     */
    fallback() external payable {}

    /**
     * @notice Function to receive ETH
     */
    receive() external payable {}
}
