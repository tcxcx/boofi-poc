// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IrCT} from "./rCT.sol";
import {ITokenConverter} from "./TokenConverter.sol";

/**
 * @title ItSYNO
 */
interface ItSYNO {
  function mint(address _to, uint256 _amount) external;
}

/**
 * @title tSYNO
 * @dev Staking contract for SYNO. Upon converting NEWO to SYNO, users receive a balance of tSYNO, which can be
 * unstaked for SYNO. Anyone can unstake their tSYNO, but incur a penalty based on a linear formula.
 */
contract tSYNO is ItSYNO, Initializable, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    string public constant name = "Staked SYNO";
    string public constant symbol = "tSYNO";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    address public treasury;
    ITokenConverter public tokenConverter;
    IERC20 public SYNO;
    IrCT public rCT;

    uint256 public stakingPeriodStart;
    uint256 public stakingPeriodEnd;

    error InvalidInput();
    error OnlyTokenConverter();
    error InsufficientBalance();

    event Transfer(address indexed from, address indexed to, uint256 amount);

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev contract initializer
     * @param _tokenConverter The Token Converter contract that can call this contract's `mint()` function
     * @param _SYNO The SYNO token contract
     * @param _treasury The treasury address to receive "burned" SYNO tokens as part of the unstaking penalty
     * @param _rCT Rewards Claim Token
     * @param _stakingPeriodStart When staking period starts (unix timestamp)
     * @param stakingPeriodLength Length of staking period (seconds)
     */
    function initialize(
        address _tokenConverter,
        address _SYNO,
        address _treasury,
        address _rCT,
        uint256 _stakingPeriodStart,
        uint256 stakingPeriodLength
    ) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);

        if (_tokenConverter == address(0)
            || _SYNO == address(0)
            || _treasury == address(0)
            || _rCT == address(0)
            || _stakingPeriodStart == 0
            || stakingPeriodLength == 0
        ) revert InvalidInput();

        treasury = _treasury;
        tokenConverter = ITokenConverter(_tokenConverter);
        SYNO = IERC20(_SYNO);
        rCT = IrCT(_rCT);

        stakingPeriodStart = _stakingPeriodStart;
        stakingPeriodEnd = _stakingPeriodStart + stakingPeriodLength;
    }

    /**
     * @notice Mints tSYNO tokens for `_to`. Only callable by the token converter contract.
     * @param _to Address to receive the tSYNO
     * @param _amount Amount of tSYNO to mint
     */
    function mint(address _to, uint256 _amount) external {
        if (msg.sender != address(tokenConverter)) revert OnlyTokenConverter();

        totalSupply += _amount;
        balanceOf[_to] += _amount;

        emit Transfer(address(0), _to, _amount);
    }

    /**
     * @notice Calculates the penalty (in bps) for unstaking tokens at the currrent block timestamp. The
     * penalty at `stakingPeriodStart` is 9000 bps and decreases linearly until `stakingPeriodEnd`.
     * @return the penalty in bps
     */
    function calculatePenalty() public view returns (uint256) {
        if (block.timestamp >= stakingPeriodEnd) {
            return 0;
        } else {
            uint256 totalDuration = stakingPeriodEnd - stakingPeriodStart;
            uint256 elapsedDuration = block.timestamp - stakingPeriodStart;

            // Calculate the penalty linearly decreasing from 9000 to 0
            return ((9000 * (totalDuration - elapsedDuration) * 1e18) / totalDuration) / 1e18;
        }
    }

    /**
     * @notice Allows the caller to unstake their tSYNO to receive SYNO (minus penalty); also burns a portion of the
     * caller's rCT tokens. The penalty amount of SYNO is sent to the `treasury` address.
     * @param _amount The amount of tSYNO to unstake
     */
    function unstake(uint256 _amount) external {
        address sender = msg.sender;

        if (_amount > balanceOf[sender]) revert InsufficientBalance();

        uint256 balanceBefore = balanceOf[sender];

        balanceOf[sender] -= _amount;
        totalSupply -= _amount;

        // calculate the penalty and determine the amount that goes to the treasury
        uint256 penaltyBps = calculatePenalty();
        uint256 penaltyAmount = (_amount * penaltyBps) / 10000;
        uint256 remainingAmount = _amount - penaltyAmount;

        SYNO.safeTransfer(sender, remainingAmount);
        SYNO.safeTransfer(treasury, penaltyAmount);

        _handleRewardsBurning(sender, _amount, balanceBefore);

        emit Transfer(sender, address(0), _amount);
    }

    /**
     * @dev burns a portion of the caller's rCT, if any
     * @param sender the account that is unstaking their tSYNO
     * @param unstakeAmount the amount being unstaked
     * @param balanceBefore the balance in tSyno before unstaking
     */
    function _handleRewardsBurning(address sender, uint256 unstakeAmount, uint256 balanceBefore) internal {
        if (rCT.balanceOf(sender) == 0) return;

        ITokenConverter.ClaimableRewards memory rewards = tokenConverter.rewards(sender);

        // If has more tSYNO than the newoSnapshotBalance, no rCTs are burned
        if (balanceOf[sender] > rewards.totalNewo) return;

        uint256 tSYNOBurnedAlongWithRCTs = rewards.burnedTsyno;

        // Calculate the amount of tSYNO that can be unstaked without burning any rCTs
        uint256 tSYNOToBurnWithoutBurningRCT = balanceBefore + tSYNOBurnedAlongWithRCTs > rewards.totalNewo
            ? balanceBefore + tSYNOBurnedAlongWithRCTs - rewards.totalNewo
            : 0;

        // Calculate the amount of tSYNO that is unstaked and also contributes to the rCT burning
        uint256 tSYNOToBurnAlongWithRCTs = unstakeAmount > tSYNOToBurnWithoutBurningRCT
            ? unstakeAmount - tSYNOToBurnWithoutBurningRCT
            : 0;

        // Calculate the amount of rCT tokens to burn based on the tSYNOToBurnAlongWithRCTs and the conversion rate
        uint256 rctToBurn = (tSYNOToBurnAlongWithRCTs * rewards.multiplier) / tokenConverter.conversionMultiplierPrecision();

        if (balanceBefore == unstakeAmount) {
            // If the user is unstaking all of their tSYNO, burn all of their rCTs
            // this is to prevent rounding errors introduced by using multipliers
            rctToBurn = rCT.balanceOf(sender);
        }

        rCT.burn(sender, rctToBurn);

        tokenConverter.updateBurned(sender, rctToBurn, tSYNOToBurnAlongWithRCTs);
    }
}
