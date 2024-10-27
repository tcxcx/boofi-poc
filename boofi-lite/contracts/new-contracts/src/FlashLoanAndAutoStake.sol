// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title FlashLoanAndLender
 * @dev This contract automatically deposits received tokens into Aave to earn interest
 *      and offers flash loans to users using the deposited funds.
 */

// Required imports
import "lib/aave-v3-core/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "lib/aave-v3-core/contracts/interfaces/IPoolAddressesProvider.sol";
import "lib/aave-v3-core/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlashLoanAndLender is FlashLoanSimpleReceiverBase, ReentrancyGuard {
    address public owner;
    IERC20 public token; // The ERC20 token (e.g., USDC)
    IERC20 public aToken; // The corresponding aToken (e.g., aUSDC)

    mapping(address => bool) public authorizedCallers;

    event FundsDeposited(uint256 amount);
    event FundsWithdrawn(uint256 amount);
    event FlashLoanExecuted(address initiator, uint256 amount, uint256 premium);

    /**
     * @dev Constructor initializes the contract with necessary addresses.
     * @param _addressProvider The address of the Aave PoolAddressesProvider
     * @param _tokenAddress The address of the ERC20 token to be used
     * @param _aTokenAddress The address of the corresponding aToken
     */
    constructor(
        address _addressProvider,
        address _tokenAddress,
        address _aTokenAddress
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
        aToken = IERC20(_aTokenAddress);
        authorizedCallers[msg.sender] = true; // Owner is authorized by default
    }

    /**
     * @dev Modifier to restrict functions to the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /**
     * @dev Modifier to restrict functions to authorized callers.
     */
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Not authorized");
        _;
    }

    /**
     * @dev Allows the owner to add an authorized caller.
     * @param _caller The address to authorize
     */
    function addAuthorizedCaller(address _caller) external onlyOwner {
        authorizedCallers[_caller] = true;
    }

    /**
     * @dev Allows the owner to remove an authorized caller.
     * @param _caller The address to remove authorization
     */
    function removeAuthorizedCaller(address _caller) external onlyOwner {
        authorizedCallers[_caller] = false;
    }

    /**
     * @dev Function to handle received tokens and deposit them into Aave.
     * Can only be called by authorized callers.
     * @param _amount The amount of tokens received
     */
    function handleReceivedTokens(
        uint256 _amount
    ) external onlyAuthorized nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        // Transfer tokens from the caller to this contract
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Approve the Aave pool to spend tokens
        token.approve(address(POOL), _amount);

        // Deposit tokens into Aave
        POOL.deposit(address(token), _amount, address(this), 0);

        emit FundsDeposited(_amount);
    }

    /**
     * @dev Function to request a flash loan of a specific amount.
     * @param amount The amount of tokens to borrow
     */
    // function requestFlashLoan(uint256 amount) external nonReentrant {
    //     require(amount > 0, "Amount must be greater than zero");

    //     // Initiate the flash loan
    //     address receiverAddress = address(this);
    //     address asset = address(token);
    //     bytes memory params = abi.encode(msg.sender); // Pass the initiator's address
    //     uint16 referralCode = 0;

    //     POOL.flashLoanSimple(
    //         receiverAddress,
    //         asset,
    //         amount,
    //         params,
    //         referralCode
    //     );
    // }

    /**
     * @dev This function is called by Aave during the flash loan.
     * It forwards the funds to the borrower and expects repayment within the same transaction.
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

        // Decode the borrower address from params
        address borrower = abi.decode(params, (address));

        // Transfer the borrowed amount to the borrower
        require(
            token.transfer(borrower, amount),
            "Transfer to borrower failed"
        );

        // The borrower is expected to have executed their logic and returned the funds plus premium by now

        // Collect the funds back from the borrower
        uint256 totalDebt = amount + premium;
        require(
            token.transferFrom(borrower, address(this), totalDebt),
            "Repayment failed"
        );

        // Approve the Pool to pull the owed amount
        token.approve(address(POOL), totalDebt);

        emit FlashLoanExecuted(borrower, amount, premium);

        return true;
    }

    /**
     * @dev Allows the owner to withdraw tokens from Aave.
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        // Withdraw tokens from Aave
        uint256 withdrawnAmount = POOL.withdraw(address(token), amount, owner);
        emit FundsWithdrawn(withdrawnAmount);
    }

    /**
     * @dev Allows the owner to transfer ownership to a new owner.
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /**
     * @dev Returns the amount of tokens currently deposited in Aave (principal + interest).
     * @return The deposited balance
     */
    function depositedBalance() external view returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    /**
     * @dev Returns the amount of tokens available in the contract.
     * @return The available token balance
     */
    function availableBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
