// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importaciones necesarias
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IStaking.sol";

contract FlashLoanAndAutoStake is FlashLoanSimpleReceiverBase, ReentrancyGuard {
    address public owner;
    IERC20 public token;
    IStaking public stakingContract;

    event FundsWithdrawnFromStaking(uint256 amount);
    event FundsStaked(uint256 amount);
    event FlashLoanExecuted(address initiator, uint256 amount, uint256 premium);

    constructor(
        address _addressProvider,
        address _tokenAddress,
        address _stakingContract
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
        stakingContract = IStaking(_stakingContract);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    // Función para solicitar un flash loan
    function requestFlashLoan(uint256 amount) external nonReentrant {
        // Asegurarse de que haya suficientes fondos disponibles
        uint256 availableFunds = token.balanceOf(address(this));

        // Si no hay suficientes fondos en el contrato, retirar del staking
        if (availableFunds < amount) {
            uint256 requiredAmount = amount - availableFunds;
            uint256 stakedBalance = stakingContract.balanceOf(address(this));
            require(
                stakedBalance >= requiredAmount,
                "Fondos insuficientes en staking"
            );

            // Retirar la cantidad necesaria del staking
            stakingContract.withdraw(requiredAmount);
            emit FundsWithdrawnFromStaking(requiredAmount);
        }

        // Iniciar el flash loan
        address receiverAddress = address(this);
        address asset = address(token);
        bytes memory params = ""; // Parámetros adicionales si es necesario
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    // Función que Aave llama durante el flash loan
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(asset == address(token), "Asset no valido");
        require(msg.sender == address(POOL), "Solo el Pool puede llamar");

        // Implementa aquí la lógica que deseas ejecutar con el flash loan
        // Por ejemplo, arbitraje, liquidaciones, etc.

        // Reembolsar el préstamo más las tarifas
        uint256 totalAmount = amount + premium;
        token.approve(address(POOL), totalAmount);

        // Después de devolver el préstamo, si hay fondos no utilizados, ponerlos en staking
        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance > 0) {
            token.approve(address(stakingContract), contractBalance);
            stakingContract.stake(contractBalance);
            emit FundsStaked(contractBalance);
        }

        emit FlashLoanExecuted(initiator, amount, premium);

        return true;
    }

    // Función para recuperar tokens del contrato (solo propietario)
    function recoverTokens(uint256 amount) external onlyOwner nonReentrant {
        // Primero retirar del staking si es necesario
        uint256 availableFunds = token.balanceOf(address(this));
        if (availableFunds < amount) {
            uint256 requiredAmount = amount - availableFunds;
            uint256 stakedBalance = stakingContract.balanceOf(address(this));
            require(
                stakedBalance >= requiredAmount,
                "Fondos insuficientes para recuperar"
            );
            stakingContract.withdraw(requiredAmount);
            emit FundsWithdrawnFromStaking(requiredAmount);
        }

        // Transferir los tokens al propietario
        token.transfer(owner, amount);
    }

    // Función para cambiar el propietario (solo propietario actual)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Direccion no valida");
        owner = newOwner;
    }

    // Función para obtener el balance en staking
    function stakedBalance() external view returns (uint256) {
        return stakingContract.balanceOf(address(this));
    }

    // Función para obtener el balance disponible en el contrato
    function availableBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
