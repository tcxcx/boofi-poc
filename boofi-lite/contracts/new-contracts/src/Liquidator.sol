// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FlashLoanAndAutoStake
 * @dev This contract allows users to request flash loans for a specific token
 * and automatically manages staking of idle funds. If the required funds for a
 * flash loan are staked, the contract will automatically withdraw them to fulfill
 * the loan. After the flash loan operation is completed, any unused funds are
 * automatically staked.
 */

// Required imports
import "lib/aave-v3-core/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "lib/aave-v3-core/contracts/interfaces/IPoolAddressesProvider.sol";
import "lib/aave-v3-core/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IStaking.sol";

contract FlashLoanAndAutoStake is FlashLoanSimpleReceiverBase, ReentrancyGuard {
    address public owner;
    IERC20 public token;
    IStaking public stakingContract;

    event FundsWithdrawnFromStaking(uint256 amount);
    event FundsStaked(uint256 amount);
    event FlashLoanExecuted(address initiator, uint256 amount, uint256 premium);

    /**
     * @dev Constructor initializes the contract with necessary addresses.
     * @param _addressProvider The address of the Aave PoolAddressesProvider
     * @param _tokenAddress The address of the ERC20 token to be used
     * @param _stakingContract The address of the staking contract
     */
    constructor(
        address _addressProvider,
        address _tokenAddress,
        address _stakingContract
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
        stakingContract = IStaking(_stakingContract);
    }

    /**
     * @dev Modifier to restrict functions to the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /**
     * @dev Function to request a flash loan of a specific amount.
     * If there are not enough tokens available, it will withdraw the required amount from staking.
     * @param amount The amount of tokens to borrow
     */
    function requestFlashLoan(uint256 amount) external nonReentrant {
        // Ensure there are enough available funds
        uint256 availableFunds = token.balanceOf(address(this));

        // If there are not enough funds in the contract, withdraw from staking
        if (availableFunds < amount) {
            uint256 requiredAmount = amount - availableFunds;
            uint256 stakedBalance = stakingContract.balanceOf(address(this));
            require(
                stakedBalance >= requiredAmount,
                "Insufficient funds in staking"
            );

            // Withdraw the required amount from staking
            stakingContract.withdraw(requiredAmount);
            emit FundsWithdrawnFromStaking(requiredAmount);
        }

        // Initiate the flash loan
        address receiverAddress = address(this);
        address asset = address(token);
        bytes memory params = ""; // Additional parameters if necessary
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    /**
     * @dev This function is called by Aave during the flash loan.
     * Implement your custom logic here using the borrowed funds.
     * @param asset The address of the asset being borrowed
     * @param amount The amount of tokens borrowed
     * @param premium The fee for the flash loan
     * @param initiator The address of the flash loan initiator
     * @param params Additional parameters passed to the function
     * @return Returns true if the operation is successful
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(asset == address(token), "Invalid asset");
        require(msg.sender == address(POOL), "Caller must be the Pool");

        // Implement your custom logic here

        // Repay the loan plus fees
        uint256 totalAmount = amount + premium;
        token.approve(address(POOL), totalAmount);

        // After repaying the loan, if there are any remaining funds, stake them
        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance > 0) {
            token.approve(address(stakingContract), contractBalance);
            stakingContract.stake(contractBalance);
            emit FundsStaked(contractBalance);
        }

        emit FlashLoanExecuted(initiator, amount, premium);

        return true;
    }

    /**
     * @dev Allows the owner to recover tokens from the contract.
     * If necessary, it will withdraw tokens from staking to fulfill the request.
     * @param amount The amount of tokens to recover
     */
    function recoverTokens(uint256 amount) external onlyOwner nonReentrant {
        // First, withdraw from staking if necessary
        uint256 availableFunds = token.balanceOf(address(this));
        if (availableFunds < amount) {
            uint256 requiredAmount = amount - availableFunds;
            uint256 stakedBalance = stakingContract.balanceOf(address(this));
            require(
                stakedBalance >= requiredAmount,
                "Insufficient funds to recover"
            );
            stakingContract.withdraw(requiredAmount);
            emit FundsWithdrawnFromStaking(requiredAmount);
        }

        // Transfer the tokens to the owner
        token.transfer(owner, amount);
    }

    /**
     * @dev Allows the current owner to transfer ownership to a new owner.
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /**
     * @dev Returns the amount of tokens currently staked.
     * @return The staked balance
     */
    function stakedBalance() external view returns (uint256) {
        return stakingContract.balanceOf(address(this));
    }

    /**
     * @dev Returns the amount of tokens available in the contract.
     * @return The available token balance
     */
    function availableBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
