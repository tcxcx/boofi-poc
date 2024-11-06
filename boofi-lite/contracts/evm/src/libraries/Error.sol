// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Error {
    error TransferFailed();
    error MustSendEther();
    error RenounceOwnershipDisabled();
    error ZeroAddress();
    error InvalidAction();
    error UnusedParameterMustBeZero();
    error InsufficientMsgValue();
    error InvalidPayloadOrVaa();
    error InvalidPrecision();
    error UnregisteredAsset();
    error VaultInsufficientAssets();
    error GlobalInsufficientAssets();
    error HubPaused();
    error InvalidSignature();
    error DepositCollateralizationRatioTooLow();
    error BorrowCollateralizationRatioTooLow();
    error AssetAlreadyRegistered();
    error AssetNotRegistered();
    error TooManyDecimalsInAnAsset();
}