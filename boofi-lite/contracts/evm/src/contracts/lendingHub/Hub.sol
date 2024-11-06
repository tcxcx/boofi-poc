

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {TokenSender, TokenReceiver, IWormholeRelayerSend, IWormhole, ITokenBridge} from "../../upgradeable-wormhole-solidity-sdk/src/WormholeRelayerSDK.sol";
import {IWETH} from "../../upgradeable-wormhole-solidity-sdk/src/interfaces/IWETH.sol";
import {CCTPSender, CCTPReceiver, CCTPBase} from "../../upgradeable-wormhole-solidity-sdk/src/CCTPBase.sol";
import "../../upgradeable-wormhole-solidity-sdk/src/Utils.sol";

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../teleporter/interface/ITeleporterMessenger.sol";

import "./HubInterestUtilities.sol";
import "../wormhole/TokenReceiverWithCCTP.sol";
import "../wormhole/TokenBridgeUtilities.sol";

import {Error} from "../../libraries/Error.sol";
import {Event} from "../../libraries/Event.sol";
import "../../libraries/Constant.sol";


/**
 * @title Hub
 * @notice The Hub contract maintains state and liquidity for the protocol. It receives cross-chain payloads and tokens
 * using Wormhole, with user interactions happening on Spokes deployed on different chains. Spokes must be registered
 * on the Hub before we can receive messages. Assets must also be registered.
 */

contract Hub is
    Initializable,
    TokenSender,
    CCTPSender,
    PausableUpgradeable,
    HubInterestUtilities
{
    using SafeERC20 for IERC20;
    ITeleporterMessenger public messenger = ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);

    bytes32 public destinationBlockchainID;
    address public destinationAddress;

     /**
     * @notice Hub constructor; prevent initialize() from being invoked on the implementation contract, we change this to a constructor
     */

    constructor(HubSpokeStructs.ConstructorArgs memory args, address _messengerAddress, bytes32 _destinationBlockchainID, address _destinationAddress) {
        initialize(args, _messengerAddress, _destinationBlockchainID, _destinationAddress);
    }

    /**
     * @notice Hub initializer - Initializes a new hub with given parameters
     *
     * @param args struct with constructor arguments
     *
     * @param _messengerAddress - The address of the Teleporter messenger contract
     */
     
function initialize(
        HubSpokeStructs.ConstructorArgs memory args,
        address _messengerAddress,
        bytes32 _destinationBlockchainID,
        address _destinationAddress
    ) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);
        PausableUpgradeable.__Pausable_init();
        CCTPBase.__CCTPBase_init(
            args.wormholeRelayer,
            args.tokenBridge,
            args.wormhole,
            args.circleMessageTransmitter,
            args.circleTokenMessenger,
            args.USDC
        );

        if (args.interestAccrualIndexPrecision < 1e18) {
            revert Error.InvalidPrecision();
        }

        _state.interestAccrualIndexPrecision = args.interestAccrualIndexPrecision;
        _state.defaultGasLimit = 300_000;
        _state.refundGasLimit = 60_000;
        setLiquidationFee(args.liquidationFee, args.liquidationFeePrecision);
        _state.isUsingCCTP = args.circleMessageTransmitter != address(0); // zero address would indicate not using

        // Initialize the TeleporterMessenger and destination info
        messenger = ITeleporterMessenger(_messengerAddress);
        destinationBlockchainID = _destinationBlockchainID;
        destinationAddress = _destinationAddress;
    }

    function getVaultAmounts(address vaultOwner, address assetAddress) public view returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        return applyInterest(assetAddress, _state.vault[vaultOwner][assetAddress]);
    }

    function setVaultAmounts(address vaultOwner, address assetAddress, HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount) internal {
        _state.vault[vaultOwner][assetAddress].amounts = vaultAmount;
        _state.vault[vaultOwner][assetAddress].accrualIndices = getCurrentAccrualIndices(assetAddress);
    }

    function getGlobalAmounts(address assetAddress) public view returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        return applyInterest(assetAddress, _state.totalAssets[assetAddress]);
    }

    function setGlobalAmounts(address assetAddress, HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount) internal {
        _state.totalAssets[assetAddress].amounts = vaultAmount;
        _state.totalAssets[assetAddress].accrualIndices = getCurrentAccrualIndices(assetAddress);
    }

    /**
     * @notice Registers a spoke contract. Only wormhole messages from registered spoke contracts are allowed.
     *
     * @param chainId - The chain id which the spoke is deployed on
     * @param spokeContractAddress - The address of the spoke contract on its chain
     */
    function registerSpoke(uint32 chainId, address spokeContractAddress) external onlyOwner {
        setRegisteredSender(chainId, toWormholeFormat(spokeContractAddress));

        emit Event.SpokeRegistered(chainId, spokeContractAddress);
    }

    /**
     * @notice Liquidates a vault. The sender of this transaction pays, for each i, assetRepayAmount[i] of the asset
     * assetRepayAddresses[i] and receives, for each i, assetReceiptAmount[i] of the asset at assetReceiptAddresses[i]
     * A check is made to see if this liquidation attempt should be allowed
     *
     * @param input: The LiquidationInput struct containing the liquidation details, input amounts should be denormalized (real amounts)
     */
    // todo kc change accrual indices in tests to > 1, make some time elapse as well
    function liquidation(ILiquidationCalculator.LiquidationInput memory input) public whenNotPaused {
        // check if inputs are valid
        _state.liquidationCalculator.checkLiquidationInputsValid(input);

        // update all accrual indices
        for (uint256 i = 0; i < input.assets.length;) {
            updateAccrualIndices(input.assets[i].assetAddress);
            unchecked {
                i++;
            }
        }

        // check if intended liquidation is valid
        _state.liquidationCalculator.checkAllowedToLiquidate(input);

        (uint256 liquidationFee, uint256 precision) = getLiquidationFeeAndPrecision();

        for (uint256 i = 0; i < input.assets.length;) {
            ILiquidationCalculator.DenormalizedLiquidationAsset memory asset = input.assets[i];
            IERC20 assetToken = IERC20(asset.assetAddress);

            // update vault amounts
            if (asset.repaidAmount > 0) {
                _updateVaultAmounts(HubSpokeStructs.Action.Repay, input.vault, asset.assetAddress, asset.repaidAmount);
                // send repay tokens from liquidator to contract
                assetToken.safeTransferFrom(msg.sender, address(this), asset.repaidAmount);
            }

            if (asset.receivedAmount > 0) {
                _updateVaultAmounts(HubSpokeStructs.Action.Withdraw, input.vault, asset.assetAddress, asset.receivedAmount);
                // reward liquidator
                uint256 feePortion = (asset.receivedAmount * liquidationFee) / precision;
                uint256 amountToTransfer = asset.receivedAmount - feePortion;
                if (asset.depositTakeover) {
                    _updateVaultAmounts(HubSpokeStructs.Action.Deposit, msg.sender, asset.assetAddress, amountToTransfer);
                } else {
                    assetToken.safeTransfer(msg.sender, amountToTransfer);
                }
            }

            unchecked {
                i++;
            }
        }

        emit Event.Liquidation(msg.sender, input.vault, input.assets);
    }

    /**
     * @notice Returns the calculated return delivery cost on the given `spokeChainId`
     * @param spokeChainId: The spoke's chainId to forward tokens to
     * @return The calculated return delivery cost
     */
    function getCostForReturnDelivery(uint32 spokeChainId) public view returns (uint256) {
        return getDeliveryCost(spokeChainId, _state.defaultGasLimit);
    }

    function getCostForRefundDelivery(uint32 spokeChainId) public view returns (uint256) {
        return getDeliveryCost(spokeChainId, _state.refundGasLimit);
    }

    function getDeliveryCost(uint32 spokeChainId, uint256 gasLimit) internal view returns (uint256) {
        (uint256 deliveryCost,) = wormholeRelayer.quoteEVMDeliveryPrice(spokeChainId, 0, gasLimit);
        return deliveryCost + tokenBridge.wormhole().messageFee();
    }

    /**
     * @dev Overriding the superclasses' function to choose whether to use CCTP or not, based on the implemented
     * `isUsingCCTP` function
     * @param payload - the payload received
     * @param additionalVaas - any wormhole VAAs received
     * @param sourceAddress - the source address of the tokens
     * @param sourceChain - the source chain of the tokens
     * @param deliveryHash - the delivery hash of the tokens
     */
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory additionalVaas,
        bytes32 sourceAddress,
        uint32 sourceChain,
        bytes32 deliveryHash
    )
    external
    payable
    onlyWormholeRelayer
    isRegisteredSender(sourceChain, sourceAddress)
    replayProtect(deliveryHash)
    {
        HubSpokeStructs.PayloadData memory data;
        bool withCCTP;
        {
            bytes memory userPayload;
            bool sendingCCTP;
            bool receivingCCTP;
            (data.amount, userPayload) = abi.decode(payload, (uint256, bytes));
            (data.action, data.sender, data.wrappedAsset, data.unwrap, sendingCCTP, receivingCCTP) =
                abi.decode(userPayload, (HubSpokeStructs.Action, address, address, bool, bool, bool));
            withCCTP = sendingCCTP || receivingCCTP;
        }

        if (sendingTokens(data.action)) {
            if (additionalVaas.length > 0) {
                revert Error.InvalidPayloadOrVaa();
            }
            data.wrappedAsset = withCCTP && _state.isUsingCCTP
                ? USDC
                : tokenBridge.wrappedAsset(sourceChain, toWormholeFormat(data.wrappedAsset));
        } else {
            if (additionalVaas.length != 1) {
                revert Error.InvalidPayloadOrVaa();
            }

            if (withCCTP) {
                if (data.amount != redeemUSDC(additionalVaas[0])) {
                    revert Error.InvalidPayloadOrVaa();
                }
                data.wrappedAsset = USDC;
            } else {
                IWormhole.VM memory parsed = wormhole.parseVM(additionalVaas[0]);
                if (parsed.emitterAddress != tokenBridge.bridgeContracts(parsed.emitterChainId)) {
                    revert Error.InvalidPayloadOrVaa();
                }
                ITokenBridge.TransferWithPayload memory transfer = tokenBridge.parseTransferWithPayload(parsed.payload);
                if (transfer.to != toWormholeFormat(address(this)) || transfer.toChain != wormhole.chainId()) {
                    revert Error.InvalidPayloadOrVaa();
                }

                tokenBridge.completeTransferWithPayload(additionalVaas[0]);

                data.wrappedAsset = getTokenAddressOnThisChain(transfer.tokenChain, transfer.tokenAddress);

                if (data.amount != TokenBridgeUtilities.denormalizeAmount(transfer.amount, getDecimals(data.wrappedAsset))) {
                    revert Error.InvalidPayloadOrVaa();
                }
            }
        }

        handlePayload(
            data,
            HubSpokeStructs.CrossChainTarget(sourceAddress, sourceChain, deliveryHash),
            false
        );
    }

    function hubInitiatedAction(HubSpokeStructs.Action action, address asset, uint256 amount, uint32 targetChain, bool unwrap) external payable whenNotPaused {
        bytes32 spokeAddress = registeredSenders[targetChain];
        if (spokeAddress == bytes32(0)) revert Error.ZeroAddress();
    

        if (action != HubSpokeStructs.Action.Withdraw && action != HubSpokeStructs.Action.Borrow) {
            revert Error.InvalidAction();
        }

        TokenBridgeUtilities.requireAssetAmountValidForTokenBridge(asset, amount);

        HubSpokeStructs.PayloadData memory data = HubSpokeStructs.PayloadData(action, msg.sender, asset, amount, unwrap);
        HubSpokeStructs.CrossChainTarget memory target = HubSpokeStructs.CrossChainTarget(spokeAddress, targetChain, bytes32(0));

        handlePayload(data, target, true);
    }

    // ============ Same Chain User Functions ============
    /**
     * @notice allows users to perform actions on the vault from the same chain as the vault (ERC20 only)
     * @param action - the action (either Deposit, Borrow, Withdraw, or Repay)
     * @param asset - the address of the wrapped asset
     * @param amount - the amount of the wrapped asset
     */
    function userActions(HubSpokeStructs.Action action, address asset, uint256 amount) public payable whenNotPaused {
        if (action == HubSpokeStructs.Action.RepayNative || action == HubSpokeStructs.Action.DepositNative) {
            if (msg.value == 0) revert Error.MustSendEther();
            if (asset != address(0)) revert Error.UnusedParameterMustBeZero();
            if (amount != 0) revert Error.UnusedParameterMustBeZero();

            IWETH weth = _state.assetRegistry.WETH();
            asset = address(weth);
            amount = msg.value;
            weth.deposit{value: msg.value}();
        }

        checkValidAsset(asset, true);
        updateAccrualIndices(asset);

        bool transferTokensToSender;

        if (action == HubSpokeStructs.Action.Withdraw) {
            _state.priceUtilities.checkAllowedToWithdraw(msg.sender, asset, amount, true);
            transferTokensToSender = true;
        } else if (action == HubSpokeStructs.Action.Borrow) {
            _state.priceUtilities.checkAllowedToBorrow(msg.sender, asset, amount, true);
            transferTokensToSender = true;
        } else if (action == HubSpokeStructs.Action.Repay || action == HubSpokeStructs.Action.RepayNative) {
            _state.priceUtilities.checkAllowedToRepay(msg.sender, asset, amount, true);
            if (action == HubSpokeStructs.Action.Repay) {
                IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
            }
        } else if (action == HubSpokeStructs.Action.Deposit || action == HubSpokeStructs.Action.DepositNative) {
            _state.priceUtilities.checkAllowedToDeposit(asset, amount, true);
            if (action == HubSpokeStructs.Action.Deposit) {
                IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
            }
        }

        _updateVaultAmounts(action, msg.sender, asset, amount);

        if (transferTokensToSender) {
            IERC20(asset).safeTransfer(msg.sender, amount);
        }
    }

    /**
     * @notice Allows users to borrow or withdraw in native currency
     * @param action - the action (either Borrow or Withdraw)
     * @param amount - The amount in native currency
     * @param unwrap - A boolean indicating whether to unwrap the asset or not
     */
    function borrowOrWithdrawNative(HubSpokeStructs.Action action, uint256 amount, bool unwrap) external whenNotPaused {
        IWETH weth = _state.assetRegistry.WETH();
        address asset = address(weth);
        updateAccrualIndices(asset);

        if (action == HubSpokeStructs.Action.Withdraw) {
            _state.priceUtilities.checkAllowedToWithdraw(msg.sender, asset, amount, true);
        } else if (action == HubSpokeStructs.Action.Borrow) {
            _state.priceUtilities.checkAllowedToBorrow(msg.sender, asset, amount, true);
        } else {
            revert Error.InvalidAction();
        }

        _updateVaultAmounts(action, msg.sender, asset, amount);

        if (unwrap) {
            _sendNative(amount, weth);
        } else {
            IERC20(asset).safeTransfer(msg.sender, amount);
        }
    }

    /**
     * @dev Checks if deposit after interest is greater than the amount that is to be withdrawn
     *
     * @param vault - the address of the vault to be checked
     * @param assetAddress - the address of the relevant asset
     * @param amount - the denormalized amount of the asset that is to be withdrawn
     * @param shouldRevert - Whether we should revert or simply log the error
     * @return success - Whether the vault has assets
     * @return error - The error message if the vault has insufficient assets
     */
    function checkVaultHasAssets(address vault, address assetAddress, uint256 amount, bool shouldRevert)
        public
        view
        returns (bool success, string memory error)
    {
        HubSpokeStructs.DenormalizedVaultAmount memory amounts = getVaultAmounts(vault, assetAddress);
        bool hasAssets = amounts.deposited >= amount;

        if (shouldRevert) {
            require(hasAssets, ERROR_VAULT_INSUFFICIENT_ASSETS);
        }

        return (hasAssets, ERROR_VAULT_INSUFFICIENT_ASSETS);
    }

    function checkProtocolGloballyHasAssets(
        address assetAddress,
        uint256 amount,
        bool shouldRevert
    ) public view returns (bool success, string memory error) {
        return checkProtocolGloballyHasAssets(assetAddress, amount, shouldRevert, type(uint256).max);
    }

    /**
     * @dev Checks if the protocol globally has an amount of asset greater than or equal to withdrawn or borrowed amount
     * This check protects protocol reserves, because it requires:
     * 1. denormalizedDeposited >= denormalizedBorrowed + amount
     * 2. baseDeposited + depositInterest >= baseBorrowed + borrowInterest + amount
     * 3. baseDeposited + depositInterest - baseBorrowed - borrowInterest >= amount
     * 4. baseDeposited - baseBorrowed + depositInterest - borrowInterest >= amount
     * 5. baseDeposited - baseBorrowed + depositInterest - borrowInterest >= amount
     * 6. baseDeposited - baseBorrowed - (borrowInterest - depositInterest) >= amount
     * 7. baseDeposited - baseBorrowed - reserve >= amount
     *
     * @param assetAddress - the address of the relevant asset
     * @param amount - the denormalized amount of asset that is to be withdrawn or borrowed
     * @param shouldRevert - Whether we should revert or simply log the error
     * @param borrowLimit - The borrow limit of the asset. Pass type(uint256).max for no limit
     * @return success - Whether the protocol globally has assets
     * @return error - The error message if the protocol has insufficient assets
     */
    function checkProtocolGloballyHasAssets(
        address assetAddress,
        uint256 amount,
        bool shouldRevert,
        uint256 borrowLimit
    ) public view returns (bool success, string memory error) {
        HubSpokeStructs.DenormalizedVaultAmount memory globalAmounts = getGlobalAmounts(assetAddress);
        bool globalHasAssets = globalAmounts.deposited >= globalAmounts.borrowed + amount;
        if (borrowLimit < type(uint256).max) {
            globalHasAssets = borrowLimit >= globalAmounts.borrowed + amount;
        }

        if (shouldRevert) {
            require(globalHasAssets, ERROR_GLOBAL_INSUFFICIENT_ASSETS);
        }

        return (globalHasAssets, ERROR_GLOBAL_INSUFFICIENT_ASSETS);
    }

    /**
     * @dev Check if an address has been registered on the Hub; throws an error or logs the error
     * @param assetAddress - The address to be checked
     * @param shouldRevert - Whether we should revert or simply log the error
     * @return Whether the asset is valid
     * @return The error message if the asset is invalid
     */
    function checkValidAsset(address assetAddress, bool shouldRevert) internal view returns (bool, string memory) {
        bool isValid = getAssetInfo(assetAddress).exists;

        if (shouldRevert) {
            require(isValid, ERROR_UNREGISTERED_ASSET);
        }

        return (isValid, ERROR_UNREGISTERED_ASSET);
    }

    // ============ Internal Functions ============

    function handlePayload(
        HubSpokeStructs.PayloadData memory data,
        HubSpokeStructs.CrossChainTarget memory target,
        bool revertOnInvalid
    ) internal {
        (bool valid, string memory err) = checkValidAsset(data.wrappedAsset, false);

        if (paused()) {
            valid = false;
            err = ERROR_PAUSED;
        }

        if (valid) {
            (valid, err) = _checkMsgValueForReturnDelivery(data.action, target.chainId);
        }

        if (valid) {
            updateAccrualIndices(data.wrappedAsset);
            if (data.action == HubSpokeStructs.Action.Withdraw) {
                (valid, err) = _state.priceUtilities.checkAllowedToWithdraw(data.sender, data.wrappedAsset, data.amount, false);
            } else if (data.action == HubSpokeStructs.Action.Borrow) {
                (valid, err) = _state.priceUtilities.checkAllowedToBorrow(data.sender, data.wrappedAsset, data.amount, false);
            } else if (data.action == HubSpokeStructs.Action.Repay || data.action == HubSpokeStructs.Action.RepayNative) {
                (valid, err) = _state.priceUtilities.checkAllowedToRepay(data.sender, data.wrappedAsset, data.amount, false);
            } else if (data.action == HubSpokeStructs.Action.Deposit || data.action == HubSpokeStructs.Action.DepositNative) {
                (valid, err) = _state.priceUtilities.checkAllowedToDeposit(data.wrappedAsset, data.amount, false);
            }
        }

        if (valid) {
            _updateVaultAmounts(data.action, data.sender, data.wrappedAsset, data.amount);
        } else {
            emit Event.LogError(target.addressWhFormat, target.chainId, target.deliveryHash, err);
        }

        if (revertOnInvalid && !valid) {
            revert(err);
        }

        handleTokenTransfer(valid, data, target.chainId, target.addressWhFormat);
    }

    function encodeUserPayload(HubSpokeStructs.PayloadData memory data, bool withCCTP) internal pure returns (bytes memory) {
        return abi.encode(data.sender, data.unwrap, withCCTP);
    }

    function sendingTokens(HubSpokeStructs.Action action) private pure returns (bool) {
        return action == HubSpokeStructs.Action.Withdraw || action == HubSpokeStructs.Action.Borrow;
    }

    /**
     * @dev Handles the transfer of tokens based on the validity of the action and the type of action. If we are to
     * use CCTP, use the appropriate function to send.
     * @param valid - A boolean indicating the validity of the action.
     * @param data - A struct containing the payload data.
     * @param sourceChain - The source chain from where the payload and tokens were sent.
     * @param sourceAddress - The address from which the payload and tokens were sent.
     */
    function handleTokenTransfer(bool valid, HubSpokeStructs.PayloadData memory data, uint32 sourceChain, bytes32 sourceAddress)
        internal
    {
        bool tokensOut = sendingTokens(data.action);

        if ((valid && tokensOut) || (!valid && !tokensOut)) {
            if (msg.value < getCostForReturnDelivery(sourceChain)) {
                revert Error.InsufficientMsgValue();
            }

            if (data.wrappedAsset == USDC && _state.isUsingCCTP) {
                sendUSDCWithPayloadToEvm(
                    sourceChain,
                    fromWormholeFormat(sourceAddress),
                    encodeUserPayload(data, true),
                    0,
                    _state.defaultGasLimit,
                    data.amount,
                    sourceChain, // refundChain
                    data.sender // refundAddress
                );
            } else {
                sendTokenWithPayloadToEvm(
                    sourceChain,
                    fromWormholeFormat(sourceAddress),
                    abi.encode(uint256(0), encodeUserPayload(data, false)), // encoding again so it's the same format as cctp messages
                    0,
                    _state.defaultGasLimit,
                    data.wrappedAsset,
                    data.amount,
                    sourceChain, // refundChain
                    data.sender // refundAddress
                );
            }
        } else if (msg.value > getCostForRefundDelivery(sourceChain)) {
            // not transferring any tokens and not refunding a failed deposit or repay
            // we need to return the roundtrip cost to the sender
            wormholeRelayer.sendToEvm{value: msg.value}(
                sourceChain,
                fromWormholeFormat(sourceAddress),
                abi.encode(uint256(0), encodeUserPayload(data, false)), // encoding again so it's the same format as cctp messages
                0, // receiverValue in Spoke chain native currency
                msg.value - getCostForRefundDelivery(sourceChain), // additional value sent in Hub chain native currency
                _state.refundGasLimit, // refund gas limit,
                sourceChain,
                data.sender,
                wormholeRelayer.getDefaultDeliveryProvider(),
                new VaaKey[](0),
                CONSISTENCY_LEVEL_FINALIZED
            );
        }
    }

    /**
     * @dev This function allows users to perform actions on the vault from the same chain as the vault using the native asset.
     * It checks if the action is allowed, updates the vault amounts, and if the action is Borrow or Withdraw, it sends the native asset to the user.
     * @param amount - The amount of the native asset.
     * @param weth - IWETH interface
     */
    function _sendNative(uint256 amount, IWETH weth) internal {
        weth.withdraw(amount);
        (bool success,) = payable(msg.sender).call{value: amount}("");
        if (!success) revert Error.TransferFailed();
    }

    /**
     * @dev Updates the vault's state to log either a deposit, borrow, withdraw, or repay
     *
     * @param action - the action (either Deposit, Borrow, Withdraw, or Repay)
     * @param vault - the address of the vault
     * @param assetAddress - the address of the relevant asset being logged
     * @param amount - the amount of the asset assetAddress being logged
     */
    function _updateVaultAmounts(HubSpokeStructs.Action action, address vault, address assetAddress, uint256 amount) internal {
        HubSpokeStructs.DenormalizedVaultAmount memory vaultAmounts = getVaultAmounts(vault, assetAddress);
        HubSpokeStructs.DenormalizedVaultAmount memory globalAmounts = getGlobalAmounts(assetAddress);

        if (action == HubSpokeStructs.Action.Deposit || action == HubSpokeStructs.Action.DepositNative) {
            vaultAmounts.deposited += amount;
            globalAmounts.deposited += amount;

            emit Event.Deposit(vault, assetAddress, amount, vaultAmounts.deposited);
            _sendMessageToPrivateChain("Deposit", vault, assetAddress, amount);

        } else if (action == HubSpokeStructs.Action.Withdraw) {
            vaultAmounts.deposited -= amount;
            globalAmounts.deposited -= amount;

            emit Event.Withdraw(vault, assetAddress, amount, vaultAmounts.deposited);
            _sendMessageToPrivateChain("Withdraw", vault, assetAddress, amount);

        } else if (action == HubSpokeStructs.Action.Borrow) {
            vaultAmounts.borrowed += amount;
            globalAmounts.borrowed += amount;

            emit Event.Borrow(vault, assetAddress, amount, vaultAmounts.borrowed);
            _sendMessageToPrivateChain("Borrow", vault, assetAddress, amount);

        } else if (action == HubSpokeStructs.Action.Repay || action == HubSpokeStructs.Action.RepayNative) {
            if (amount > vaultAmounts.borrowed) {
                amount = vaultAmounts.borrowed;
            }
            vaultAmounts.borrowed -= amount;
            globalAmounts.borrowed -= amount;

            emit Event.Repay(vault, assetAddress, amount, vaultAmounts.borrowed);
            _sendMessageToPrivateChain("Repay", vault, assetAddress, amount);

        }

        setVaultAmounts(vault, assetAddress, vaultAmounts);
        setGlobalAmounts(assetAddress, globalAmounts);
    }


    /**
     * @dev Sends a message to the private blockchain via the Teleporter Messenger
     *
     * @param actionType - The type of action (e.g., "Deposit", "Withdraw", etc.)
     *
     * @param vault - The address of the user's vault
     *
     * @param assetAddress - The address of the asset involved
     *
     * @param amount - The amount involved in the action
     *
     **/

    function _sendMessageToPrivateChain(
        string memory actionType,
        address vault,
        address assetAddress,
        uint256 amount
    ) internal {
        bytes memory message = abi.encode(
            actionType,
            vault,
            assetAddress,
            amount,
            block.timestamp
        );

        messenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: bytes32(hex"586e7956654d7532714834516233754e70676b4d"),
                destinationAddress: destinationAddress,    // Replace with your receiver contract address
                feeInfo: TeleporterFeeInfo({feeTokenAddress: address(0), amount: 0}),
                requiredGasLimit: 100000,
                allowedRelayerAddresses: new address[](0),
                message: message
            })
        );

        emit Event.MessageSentToPrivateChain(actionType, vault, assetAddress, amount, block.timestamp);
    }

    /**
     * @dev Validates whether the `msg.value` is sufficient to cover the quoted cost for return delivery
     * @param action The relayed action; we only validate `msg.value` when it's a borrow or withdraw
     * @param sourceChain The chain from which the payload and tokens were sent
     */
    function _checkMsgValueForReturnDelivery(HubSpokeStructs.Action action, uint32 sourceChain)
        internal
        view
        returns (bool valid, string memory error)
    {
        if (action != HubSpokeStructs.Action.Borrow && action != HubSpokeStructs.Action.Withdraw) return (true, "");

        valid = msg.value >= getCostForReturnDelivery(sourceChain);

        return (valid, ERROR_MSG_VALUE);
    }

    // ============ Admin Functions ============

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
     * @notice Withdraws reserves from the contract. If the amount is greater than the reserve balance, then
     * the entire reserve balance is withdrawn.
     * @param wrappedAsset: The address of the wrapped asset. Pass address(0) for native asset.
     * @param destination: The address to send the reserves to
     * @param amount: The amount of the wrapped asset to withdraw
     */
    function withdrawReserves(address wrappedAsset, address destination, uint256 amount) external onlyOwner {
        if (destination == address(0)) {
            revert Error.ZeroAddress();
        }

        uint256 reserveBalance = wrappedAsset == address(0) ? address(this).balance : getReserveAmount(wrappedAsset);

        // can't withdraw more than reserve balance
        if (amount > reserveBalance) {
            amount = reserveBalance;
        }

        if (wrappedAsset == address(0)) {
            (bool success,) = payable(destination).call{value: amount}("");
            if (!success) revert Error.TransferFailed();
        } else {
            // transfer reserve balance to destination
            IERC20(wrappedAsset).safeTransfer(destination, amount);
        }

        emit Event.ReservesWithdrawn(wrappedAsset, amount, destination);
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        // this already checks for zero address
        OwnableUpgradeable.transferOwnership(newOwner);
        // also update registrationOwner defined in abstract contract Base in evm/lib/upgradeable-wormhole-solidity-sdk/src/WormholeRelayerSDK.sol
        // this is required to be able to register new WH message senders (Spokes)
        registrationOwner = newOwner;
    }

    function renounceOwnership() public view override onlyOwner {
        revert Error.RenounceOwnershipDisabled();
    }

    /**
     * @notice Get the protocol's global reserve amount in an asset
     *
     * @param asset - the address of the asset
     * @return uint256 The amount of the asset in the protocol's reserve
     */
    function getReserveAmount(address asset) public view returns (uint256) {
        if (asset == address(0)) {
            revert Error.ZeroAddress();
        }
        HubSpokeStructs.DenormalizedVaultAmount memory globalAmounts = getGlobalAmounts(asset);
        return IERC20(asset).balanceOf(address(this)) + globalAmounts.borrowed - globalAmounts.deposited;
    }

    function getSpokeAddress(uint256 chainId) public view returns (address) {
        return fromWormholeFormat(registeredSenders[uint32(chainId)]);
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice fallback function to receive unwrapped native asset
     */
    fallback() external payable {}

    receive() external payable {}

    // OVERRIDES
    function _msgSender() internal view override(ContextUpgradeable) returns (address) {
        return msg.sender;
    }

    function _msgData() internal pure override(ContextUpgradeable) returns (bytes calldata) {
        return msg.data;
    }
}
