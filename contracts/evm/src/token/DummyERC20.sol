// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {
  uint8 _decimals;

  constructor(string memory _name, string memory _symbol, uint8 _tokenDecimals) ERC20(_name, _symbol) {
    mint(msg.sender, 100_000_000_000 * 10**_tokenDecimals );
    _decimals = _tokenDecimals;
  }

  function mint(address account, uint256 amount) public {
    _mint(account, amount);
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }
}
