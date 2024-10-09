// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "../libraries/Disclaimer.sol";

contract DelegateAddress is Initializable, PausableUpgradeable, OwnableUpgradeable {

    mapping(address => address) public delegations;

    bytes32 public disclaimerMessageHash;
    string public disclaimer;

    event Delegated(address indexed delegatedFrom, address indexed delegatedTo);

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract during upgrade
     */
    function initialize(string calldata _disclaimer) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);
        PausableUpgradeable.__Pausable_init();
        setDisclaimer(_disclaimer);
    }

    /**
     * @notice Delegate an address
     * @param _addr The address to delegate
     * @param disclaimerSignature The signature of the disclaimer
     */
    function delegate(address _addr, bytes calldata disclaimerSignature) external whenNotPaused {
        Disclaimer.requireDisclaimerSignature(disclaimerSignature, disclaimerMessageHash, msg.sender);
        delegations[msg.sender] = _addr;
        emit Delegated(msg.sender, _addr);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Allows the contract owner to set the disclaimer. The signed message hash is saved in the contract
     * for recoveries
     * @param _disclaimer The new disclaimer
     */
    function setDisclaimer(string calldata _disclaimer) public onlyOwner {
        disclaimer = _disclaimer;
        disclaimerMessageHash = Disclaimer.getDisclaimerMessageHash(_disclaimer);
    }
}
