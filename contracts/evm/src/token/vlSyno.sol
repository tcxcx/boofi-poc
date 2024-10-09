// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title vlSYNO
 * @dev staking for balancer pool tokens with lock periods
 */
contract vlSYNO is Initializable, OwnableUpgradeable {
    enum LockPeriod {
        ONE_MONTH,
        THREE_MONTHS,
        SIX_MONTHS,
        TWELVE_MONTHS
    }

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        LockPeriod lockPeriod;
        uint256 unstakeRequestTimestamp;
    }

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    address public poolToken;
    mapping(address => Stake[]) public stakes;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Staked(address indexed staker, uint256 indexed index, uint256 amount, LockPeriod lockPeriod);
    event Restaked(address indexed staker, uint256 indexed index, uint256 amount, LockPeriod lockPeriod);
    event UnstakeRequested(address indexed staker, uint256 indexed index);
    event Unstaked(address indexed staker, uint256 indexed index, uint256 amount);

    error StakeNotFound();
    error StakeLocked();
    error CooldownPeriod();
    error InvalidInput();
    error RequestUnstakeNotCalled();

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev contract initializer
     * @param _poolToken The pool token address
     */
    function initialize(address _poolToken) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);
        if (_poolToken == address(0)) {
            revert InvalidInput();
        }
        poolToken = _poolToken;
    }

    /**
     * @dev Allows a user to stake a certain amount of tokens for a specified lock period.
     * @param amount The amount of tokens to stake.
     * @param lockPeriod The lock period for the staked tokens.
     */
    function stake(uint256 amount, LockPeriod lockPeriod) external {
        if (amount == 0) {
            revert InvalidInput();
        }

        // stake
        IERC20(poolToken).transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].push(Stake(amount, block.timestamp, lockPeriod, 0));
        emit Staked(msg.sender, stakes[msg.sender].length - 1, amount, lockPeriod);

        // mint vlSYNO
        uint256 tokenAmount = amount;
        totalSupply += tokenAmount;
        balanceOf[msg.sender] += tokenAmount;
        emit Transfer(address(0), msg.sender, tokenAmount);
    }

    /**
     * @dev Allows a user to request unstaking of their tokens.
     * @param index The index of the stake in the user's stake array.
     */
    function requestUnstake(uint256 index) external {
        Stake storage _stake = stakes[msg.sender][index];
        if (block.timestamp < _stake.timestamp + getLockPeriod(_stake.lockPeriod)) {
            revert StakeLocked();
        }
        _stake.unstakeRequestTimestamp = block.timestamp;
        emit UnstakeRequested(msg.sender, index);
    }

    /**
     * @dev Allows a user to unstake their tokens after the cooldown period.
     * @param index The index of the stake in the user's stake array.
     */
    function unstake(uint256 index) external {
        // unstake
        Stake memory _stake = stakes[msg.sender][index];

        if(_stake.unstakeRequestTimestamp == 0) {
            revert RequestUnstakeNotCalled();
        }

        if (block.timestamp < _stake.unstakeRequestTimestamp + 7 days) {
            revert CooldownPeriod();
        }
        delete stakes[msg.sender][index];
        emit Unstaked(msg.sender, index, _stake.amount);

        // burn vlSYNO
        uint256 tokenAmount = _stake.amount;
        totalSupply -= tokenAmount;
        balanceOf[msg.sender] -= tokenAmount;
        IERC20(poolToken).transfer(msg.sender, _stake.amount);
        emit Transfer(msg.sender, address(0), tokenAmount);
    }

    /**
     * @dev Allows a user to restake their tokens.
     * @param index The index of the stake in the user's stake array.
     */
    function restake(uint256 index) external {
        Stake storage _stake = stakes[msg.sender][index];
        if (_stake.amount == 0) {
            revert StakeNotFound();
        }

        if (block.timestamp < _stake.timestamp + getLockPeriod(_stake.lockPeriod)) {
            revert StakeLocked();
        }

        _stake.timestamp = block.timestamp;
        _stake.unstakeRequestTimestamp = 0;
        emit Restaked(msg.sender, index, _stake.amount, _stake.lockPeriod);
    }

    /**
     * @notice returns the the total vote locked power of a user: staked tokens * lock period multiplier
     * @param owner the address of the user
     * @return power the total vote locked power of the user
     */
    function vlPower(address owner) external view returns (uint256 power) {
        for (uint256 i = 0; i < stakes[owner].length; i++) {
            Stake memory _stake = stakes[msg.sender][i];
            if (block.timestamp < _stake.timestamp + getLockPeriod(_stake.lockPeriod)) {
                power += _stake.amount * getLockPeriodMultiplier(_stake.lockPeriod);
            }
        }
    }

    // INTERNAL FUNCTIONS

    /**
     * @dev Returns the lock period in days based on the provided LockPeriod enum value.
     * @param lockPeriod The period for which the tokens are locked.
     * @return The lock period in days.
     */
    function getLockPeriod(LockPeriod lockPeriod) internal pure returns (uint256) {
        if (lockPeriod == LockPeriod.ONE_MONTH) {
            return 30 days;
        } else if (lockPeriod == LockPeriod.THREE_MONTHS) {
            return 90 days;
        } else if (lockPeriod == LockPeriod.SIX_MONTHS) {
            return 180 days;
        }

        return 365 days; // lockPeriod == LockPeriod.TWELVE_MONTHS
    }

    /**
     * @dev Calculates the bonus for locking up tokens for a certain period.
     * @param lockPeriod The period for which the tokens are locked.
     * @return The bonus multiplier for the lock period.
     */
    function getLockPeriodMultiplier(LockPeriod lockPeriod) internal pure returns (uint256) {
        if (lockPeriod == LockPeriod.ONE_MONTH) {
            return 2;
        } else if (lockPeriod == LockPeriod.THREE_MONTHS) {
            return 5;
        } else if (lockPeriod == LockPeriod.SIX_MONTHS) {
            return 11;
        }

        return 25; // lockPeriod == LockPeriod.TWELVE_MONTHS
    }
}
