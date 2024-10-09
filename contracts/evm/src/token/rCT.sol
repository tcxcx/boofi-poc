// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title IrCT
 */
interface IrCT {
    function staked(address account) external view returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function stake() external;
    function unstake() external;
}

/**
 * @title rCT
 * @notice Rewards Claim Token - Non-transferrable token that can be claimed by holders of NEWO at the snapshot.
 * @dev This contract is ownable only to set the tSyno contract after deployment
 */
contract rCT is IrCT, Initializable, OwnableUpgradeable {
    string public constant name = "Rewards Claim Token";
    string public constant symbol = "rCT";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    mapping(address => bool) public staked;

    address public tokenConverter;
    address public tSyno;

    error OnlyTokenConverter();
    error OnlyTSyno();
    error InsufficientBalance();
    error InvalidInput();
    error NotStaked();

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event StakedOrUnstaked(address indexed account, bool staked);

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev contract initializer
     * @param _tokenConverter The Token Converter contract that can call this contract's `mint()` function
     */
    function initialize(address _tokenConverter) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);

        if (_tokenConverter == address(0)) revert InvalidInput();

        tokenConverter = _tokenConverter;
    }

    /**
     * @notice Allows the contract owner to set the `tSyno` address
     * @param _tSyno Staked SYNO contract address
     */
    function setTSyno(address _tSyno) external onlyOwner {
        if (_tSyno == address(0)) revert InvalidInput();

        tSyno = _tSyno;
    }

    /**
     * @notice Mints rCT tokens. Only callable by the token converter contract.
     * @param to Address to receive the rCT
     * @param amount Amount of rCT to mint
     */
    function mint(address to, uint256 amount) external {
        if (msg.sender != tokenConverter) revert OnlyTokenConverter();

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Transfer(address(0), to, amount);
    }

    /**
     * @notice Burns rCT tokens. Only callable by the tSYNO contract.
     * @param from Address to receive the rCT
     * @param amount Amount of rCT to mint
     */
    function burn(address from, uint256 amount) external {
        if (msg.sender != tSyno) revert OnlyTSyno();
        if (amount > balanceOf[from]) revert InsufficientBalance();

        totalSupply -= amount;
        balanceOf[from] -= amount;

        emit Transfer(from, address(0), amount);
    }

    /**
     * @notice Allows the caller to stake their rCT tokens
     */
    function stake() external {
        address sender = msg.sender;

        if (balanceOf[sender] == 0) revert InsufficientBalance();

        staked[sender] = true;
        emit StakedOrUnstaked(sender, true);
    }

    /**
     * @notice Allows the caller to unstake their rCT tokens
     */
    function unstake() external {
        address sender = msg.sender;

        if (!staked[sender]) revert NotStaked();

        staked[sender] = false;
        emit StakedOrUnstaked(sender, false);
    }
}
