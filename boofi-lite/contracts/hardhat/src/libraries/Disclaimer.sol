// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Disclaimer
 * @notice Library for verifying a disclaimer
 */
library Disclaimer {
    using MessageHashUtils for bytes;

    event DisclaimerSet(string disclaimer);

    error InvalidSignature();

    /**
     * @notice Allows the contract owner to set the disclaimer. The signed message hash is saved in the contract
     * for recoveries
     * @param _disclaimer The new disclaimer
     */
    function getDisclaimerMessageHash(string calldata _disclaimer) internal returns (bytes32 disclaimerMessageHash) {
        disclaimerMessageHash = bytes(_disclaimer).toEthSignedMessageHash();
        emit DisclaimerSet(_disclaimer);
    }

    /**
     * @dev Validate the disclaimer signature
     * @param signature The signature to validate
     * @param signer The signer of the disclaimer
     */
    function requireDisclaimerSignature(bytes calldata signature, bytes32 disclaimerMessageHash, address signer)
        internal
        view
    {
        if (!SignatureChecker.isValidSignatureNow(signer, disclaimerMessageHash, signature)) {
            revert InvalidSignature();
        }
    }
}
