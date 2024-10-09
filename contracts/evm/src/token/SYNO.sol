// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract SYNO is ERC20Upgradeable {

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev contract initializer
     */
    function initialize() public initializer {
        ERC20Upgradeable.__ERC20_init("Synonym Finance", "SYNO");

        _mint(msg.sender, 800_000_000 ether);
    }
}
