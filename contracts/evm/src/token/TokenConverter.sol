// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@solmate/utils/MerkleProofLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IrCT} from "./../token/rCT.sol";
import {ItSYNO} from "./../token/tSYNO.sol";
import "../libraries/Disclaimer.sol";

/**
 * @title ITokenConverter
 */
interface ITokenConverter {
    enum Network {
        ETHEREUM,
        AVALANCHE
    }

    struct ClaimInput {
        uint256 amount;
        bytes32[] proof;
        uint256 index;
        uint256 rCTCap;
        uint16 multiplier;
    }

    struct ClaimableRewards {
        uint256 claimed;
        uint256 burned;
        uint256 burnedTsyno;
        uint256 rCTCap;
        uint256 totalNewo;
        uint256 multiplier;
    }

    function rewards(address account) external view returns (ClaimableRewards memory);
    function updateBurned(address account, uint256 rewards, uint256 tSyno) external;
    function conversionMultiplierPrecision() external view returns (uint256);
}

/**
 * @title TokenConverter
 * @notice Contract for converting NEWO to SYNO and claiming rCT
 * @dev This contract is ownable only to set the token contracts after deployment
 */
contract TokenConverter is ITokenConverter, Initializable, OwnableUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    mapping(Network => bytes32) public root;
    ItSYNO public tSyno;
    IrCT public rCT;
    mapping(Network => IERC20) public newo;

    uint256 public constant conversionMultiplierPrecision = 10000;

    mapping(address => ClaimableRewards) private _rewards; // account => claimable rewards data
    mapping(address => bool) public acceptedDisclaimer;

    string public disclaimer;
    bytes32 public disclaimerMessageHash;

    error InvalidInput();
    error AlreadyClaimed();
    error InvalidProof();
    error OnlyTSyno();

    event Converted(address indexed recipient, uint256 amount);
    event RewardsClaimed(address indexed recipient, uint256 amount);

    /**
     * @notice contract constructor; prevent initialize() from being invoked on the implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev contract initializer
     * @param _ethereumRoot The merkle tree root for claiming rCT for NEWO from Ethereum
     * @param _avalancheRoot The merkle tree root for claiming rCT for NEWO from Avalanche
     * @param _newoFromEthereum The WH wrapped NEWO token from Ethereum
     * @param _newoFromAvalanche The WH wrapped NEWO token from Avalanche
     * @param _disclaimer The disclaimer to sign
     */
    function initialize(
        bytes32 _ethereumRoot,
        bytes32 _avalancheRoot,
        address _newoFromEthereum,
        address _newoFromAvalanche,
        string calldata _disclaimer
    ) public initializer {
        OwnableUpgradeable.__Ownable_init(msg.sender);
        PausableUpgradeable.__Pausable_init();

        if (_ethereumRoot == bytes32("") || _avalancheRoot == bytes32("") || _newoFromEthereum == address(0) || _newoFromAvalanche == address(0)) revert InvalidInput();

        root[Network.ETHEREUM] = _ethereumRoot;
        root[Network.AVALANCHE] = _avalancheRoot;
        newo[Network.ETHEREUM] = IERC20(_newoFromEthereum);
        newo[Network.AVALANCHE] = IERC20(_newoFromAvalanche);
        setDisclaimer(_disclaimer);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Allows the contract owner to set the `tSyno` and `rCT` contract addresses
     * @param _tSyno Staked Syno contract
     * @param _rCT Rewards Claim Token
     */
    function setTokens(address _tSyno, address _rCT) external onlyOwner {
        if (_tSyno == address(0) || _rCT == address(0)) revert InvalidInput();

        tSyno = ItSYNO(_tSyno);
        rCT = IrCT(_rCT);
    }

    /**
     * @notice Allows for updating of the merkle tree roots
     * @param _ethereumRoot The new merkle tree root for claiming rCT for NEWO from Ethereum
     * @param _avalancheRoot The new merkle tree root for claiming rCT for NEWO from Avalanche
     */
    function setMerkleRoots(bytes32 _ethereumRoot, bytes32 _avalancheRoot) external onlyOwner {
        if (_ethereumRoot == bytes32("") || _avalancheRoot == bytes32("")) revert InvalidInput();

        root[Network.ETHEREUM] = _ethereumRoot;
        root[Network.AVALANCHE] = _avalancheRoot;
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

    /**
     * @notice Returns the `ClaimableRewards` set in storage for `account` - if any
     */
    function rewards(address account) public view override returns (ClaimableRewards memory) {
        return _rewards[account];
    }

    /**
     * @notice Allows the caller to convert their NEWO _and_ claim a portion of their rCT tokens by providing a merkle
     * proof, which contains their max claimable amount of rCT and their conversion multiplier
     * @param ethereumClaim The ClaimInput for NEWO that came from Ethereum
     * @param avalancheClaim The ClaimInput for NEWO that came from Avalanche
     * @param disclaimerSignature The signature of the disclaimer
     */
    function convertWithProof(
        ClaimInput calldata ethereumClaim,
        ClaimInput calldata avalancheClaim,
        bytes calldata disclaimerSignature
    ) public whenNotPaused {
        address recipient = msg.sender;
        ClaimableRewards storage __rewards = _rewards[recipient];
        // user can only call this function to set storage once; subsequent conversions should use `convert()`
        if (__rewards.rCTCap != 0) revert AlreadyClaimed();
        if (ethereumClaim.rCTCap + avalancheClaim.rCTCap == 0) revert InvalidInput(); // revert if neither proof is provided

        requireDisclaimerAccepted(disclaimerSignature);

        _convert(Network.ETHEREUM, ethereumClaim.amount, recipient);
        _convert(Network.AVALANCHE, avalancheClaim.amount, recipient);

        // validate the proofs
        if (ethereumClaim.rCTCap > 0) {
            if (ethereumClaim.multiplier == 0) revert InvalidInput();
            verifyProof(root[Network.ETHEREUM], ethereumClaim);
            __rewards.rCTCap += ethereumClaim.rCTCap;
            __rewards.totalNewo = ethereumClaim.rCTCap * conversionMultiplierPrecision / ethereumClaim.multiplier;
        }

        if (avalancheClaim.rCTCap > 0) {
            if (avalancheClaim.multiplier == 0) revert InvalidInput();
            verifyProof(root[Network.AVALANCHE], avalancheClaim);
            __rewards.rCTCap += avalancheClaim.rCTCap;
            __rewards.totalNewo += avalancheClaim.rCTCap * conversionMultiplierPrecision / avalancheClaim.multiplier;
        }

        uint256 totalBurnedNewoAmountInSnapshots = ethereumClaim.amount + avalancheClaim.amount;

        __rewards.multiplier = __rewards.rCTCap * conversionMultiplierPrecision / __rewards.totalNewo;

        // mint rCT
        _handleRewards(totalBurnedNewoAmountInSnapshots, msg.sender);
    }

    /**
     * @notice Transfers NEWO tokens from the caller, burns them, and mints them tSYNO tokens. Also handle any rewards
     * for users that have previously claimed
     * @param network The network the NEWO token came from
     * @param amount Amount of NEWO to convert
     * @param disclaimerSignature The signature of the disclaimer
     */
    function convert(Network network, uint256 amount, bytes calldata disclaimerSignature) public whenNotPaused {
        requireDisclaimerAccepted(disclaimerSignature);

        _convert(network, amount, msg.sender);

        _handleRewards(amount, msg.sender);
    }

    function requireDisclaimerAccepted(bytes calldata disclaimerSignature) internal view {
        if (!acceptedDisclaimer[msg.sender]) {
            Disclaimer.requireDisclaimerSignature(disclaimerSignature, disclaimerMessageHash, msg.sender);
        }
    }

    function acceptDisclaimer(string calldata _disclaimer) external {
        if (Disclaimer.getDisclaimerMessageHash(_disclaimer) != disclaimerMessageHash) {
            revert Disclaimer.InvalidSignature();
        }
        acceptedDisclaimer[msg.sender] = true;
    }

    /**
     * @notice Update storage for rewards burned for the given `user`; only callable by the tSYNO contract
     * @param user The user to update storage for
     * @param amountRewards The amount of rCT burned
     * @param _tSyno The amount of tSYNO that is unstaked and also contributes to the rCT burning
     */
    function updateBurned(address user, uint256 amountRewards, uint256 _tSyno) external whenNotPaused {
        if (msg.sender != address(tSyno)) revert OnlyTSyno();

        _rewards[user].burned += amountRewards;
        _rewards[user].burnedTsyno += _tSyno;
    }

    function verifyProof(bytes32 _root, ClaimInput calldata claim) internal view {
        if (!MerkleProofLib.verify(claim.proof, _root, keccak256(abi.encodePacked(claim.index, msg.sender, claim.rCTCap, claim.multiplier))))
        {
            revert InvalidProof();
        }
    }

    function getRemainingClaimable(address recipient) internal view returns (uint256) {
        ClaimableRewards storage __rewards = _rewards[recipient];
        return __rewards.rCTCap - __rewards.claimed;
    }

    /**
     * @dev Perform NEWO => SYNO conversion
     * @param network The network the NEWO token came from
     * @param amount amount of tokens to convert
     * @param recipient the account to receive tSYNO
     */
    function _convert(Network network, uint256 amount, address recipient) internal {
        if (address(newo[network]) == address(0)) {
            revert InvalidInput();
        }

        newo[network].safeTransferFrom(recipient, address(0xdead), amount);

        tSyno.mint(recipient, amount);

        emit Converted(recipient, amount);
    }

    /**
     * @dev Mint the `recipient` rCT if they have previously claimed and their amount claimed is under their cap
     * @param amountConverted amount of tokens converted
     * @param recipient the account to receive rCT
     */
    function _handleRewards(uint256 amountConverted, address recipient) internal {
        ClaimableRewards storage __rewards = _rewards[recipient];
        uint256 remainingClaimable = getRemainingClaimable(recipient);

        // early return if not previously claimed or at the cap
        if (__rewards.rCTCap == 0 || remainingClaimable == 0) return;

        uint256 rewardAmount = (amountConverted * __rewards.multiplier) / conversionMultiplierPrecision;
        uint256 amount = rewardAmount <= remainingClaimable ? rewardAmount : remainingClaimable;

        rCT.mint(recipient, amount);

        _rewards[recipient].claimed += amount;

        emit RewardsClaimed(recipient, amount);
    }
}
