// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import {IBooFiPriceOracle} from "../../interfaces/IBooFiPriceOracle.sol";
import "../../interfaces/IHub.sol";
import "../../interfaces/IHubPriceUtilities.sol";
import "../HubSpokeStructs.sol";
import "../wormhole/TokenBridgeUtilities.sol";

/**
 * @title HubPriceUtilities
 * @notice Contract defining price-related utility functions for the Hub contract
 */
contract HubPriceUtilities is IHubPriceUtilities, Ownable {

    IHub hub;
    IBooFiPriceOracle priceOracle;

    // the amount of confidence intervals to use for the lower and upper bounds of the price
    uint256 priceStandardDeviations;
    uint256 priceStandardDeviationsPrecision;

    string public constant ERROR_DEPOSIT_LIMIT_EXCEEDED = "DepositLimitExceeded";
    string public constant ERROR_VAULT_UNDER_COLLAT = "VaultUnderCollateralized";
    string public constant ERROR_VAULT_INSUFFICIENT_BORROWS = "VaultInsufficientBorrows";

    error DepositLimitExceeded();
    error NoZeroOrNegativePrices();

    constructor(
        address _hub,
        address _priceOracle,
        uint256 _priceStandardDeviations,
        uint256 _priceStandardDeviationsPrecision
    ) Ownable(msg.sender) {
        require(_hub != address(0));
        require(_priceOracle != address(0));
        hub = IHub(_hub);
        priceOracle = IBooFiPriceOracle(_priceOracle);
        priceStandardDeviations = _priceStandardDeviations;
        priceStandardDeviationsPrecision = _priceStandardDeviationsPrecision;
    }

    function getAssetRegistry() public view override returns (IAssetRegistry) {
        return IAssetRegistry(hub.getAssetRegistry());
    }

    function getAssetInfo(address asset) internal view returns (IAssetRegistry.AssetInfo memory) {
        return getAssetRegistry().getAssetInfo(asset);
    }

    /**
     * @dev Gets priceCollateral and priceDebt, which are price - c*stdev and price + c*stdev, respectively
     * where c is a constant specified by the protocol (priceStandardDeviations/priceStandardDeviationPrecision),
     * and stdev is the standard deviation of the price.
     * Multiplies each of these values by getPriceStandardDeviationsPrecision().
     * These values are used as lower and upper bounds of the price when determining whether to allow
     * borrows and withdraws
     *
     * @param assetAddress the address of the relevant asset
     * @return truePrice - the price of the asset
     * @return priceCollateral - the price of the asset when used as collateral [true price reduced by c*stdev]
     * @return priceDebt - the price of the asset when used as debt [true price increased by c*stdev]
     * @return pricePrecision - the precision of the price
     */
    function getPrices(address assetAddress)
        public
        view
        override
        returns (uint256 truePrice, uint256 priceCollateral, uint256 priceDebt, uint256 pricePrecision)
    {
        (uint256 price, uint256 conf, uint256 _pricePrecision) = getOraclePrices(assetAddress);
        // use conservative (from protocol's perspective) prices for collateral (low) and debt (high)--see https://docs.pyth.network/consume-data/best-practices#confidence-intervals
        uint256 confidenceInterval = conf * priceStandardDeviations / priceStandardDeviationsPrecision;

        if (price <= confidenceInterval) {
            revert NoZeroOrNegativePrices();
        }

        truePrice = price;
        priceCollateral = price - confidenceInterval;
        priceDebt = price + confidenceInterval;
        pricePrecision = _pricePrecision;
    }

    /**
     * @dev Get the price, through Pyth, of the asset at address assetAddress
     * @param assetAddress - The address of the relevant asset
     * @return The price (in USD) of the asset, from Pyth;
     * @return The confidence (in USD) of the asset's price
     */
    function getOraclePrices(address assetAddress) internal view returns (uint256, uint256, uint256) {
        IBooFiPriceOracle.Price memory oraclePrice = priceOracle.getPrice(assetAddress);
        return (oraclePrice.price, oraclePrice.confidence, oraclePrice.precision);
    }

    /**
     * @dev Using the pyth prices, get the total price of the assets deposited into the vault, and
     * total price of the assets borrowed from the vault (multiplied by their respecetive collateralization ratios)
     * The result will be multiplied by interestAccrualIndexPrecision * priceStandardDeviationsPrecision * 10^(maxDecimals) * (collateralizationRatioPrecision if collateralizationRatios is true, otherwise 1)
     * because we are denormalizing without dividing by this value, and we are (maybe) multiplying by collateralizationRatios without dividing
     * by the precision, and we are using getPrices which returns the prices multiplied by priceStandardDeviationsPrecision
     * and we are multiplying by 10^maxDecimals to keep integers when we divide by 10^(decimals of each asset).
     *
     * @param vaultOwner - The address of the owner of the vault
     * @param collateralizationRatios - Whether or not to multiply by collateralizationRatios in the computation
     * @return NotionalVaultAmount memory The total value of the assets deposited into and borrowed from the vault
     */
    function getVaultEffectiveNotionals(address vaultOwner, bool collateralizationRatios)
        public
        view
        override
        returns (HubSpokeStructs.NotionalVaultAmount memory)
    {
        HubSpokeStructs.NotionalVaultAmount memory totalNotionalValues = HubSpokeStructs.NotionalVaultAmount(0, 0);
        address[] memory allowList = getAssetRegistry().getRegisteredAssets();
        for (uint256 i = 0; i < allowList.length;) {
            address asset = allowList[i];
            HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount = hub.getVaultAmounts(vaultOwner, asset);
            HubSpokeStructs.NotionalVaultAmount memory notionalValues = calculateNotionals(asset, vaultAmount);
            if (collateralizationRatios) {
                notionalValues = applyCollateralizationRatios(asset, notionalValues);
            }
            totalNotionalValues.deposited += notionalValues.deposited;
            totalNotionalValues.borrowed += notionalValues.borrowed;

            unchecked {
                i++;
            }
        }

        return totalNotionalValues;
    }

    /**
     * @dev Calculates the effective notional values for the assets deposited and borrowed from the vault.
     * The function takes into account the collateralization ratios if specified.
     * The effective notional values are used to determine the total price of the assets in the vault.
     * Precision: 1e36 = protocol precision 1e18 * price precision 1e18
     *
     * @param asset - The address of the asset in the vault
     * @param vaultAmount - The struct with amount deposited and borrowed
     * @return VaultAmount - the notional amount deposited and borrowed
     */
    function calculateNotionals(
        address asset,
        HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount
    ) public view override returns (HubSpokeStructs.NotionalVaultAmount memory) {
        IAssetRegistry assetRegistry = getAssetRegistry();
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(asset);
        (,uint256 priceCollateral, uint256 priceDebt,) = getPrices(asset);
        uint256 expVal = 10 ** (assetRegistry.getMaxDecimals() - assetInfo.decimals);

        return HubSpokeStructs.NotionalVaultAmount(
            vaultAmount.deposited * priceCollateral * expVal,
            vaultAmount.borrowed * priceDebt * expVal
        );
    }

    function invertNotionals(
        address asset,
        HubSpokeStructs.NotionalVaultAmount memory realValues
    ) public view override returns (HubSpokeStructs.DenormalizedVaultAmount memory) {
        IAssetRegistry assetRegistry = getAssetRegistry();
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(asset);
        (,uint256 priceCollateral, uint256 priceDebt,) = getPrices(asset);
        uint256 expVal = 10 ** (assetRegistry.getMaxDecimals() - assetInfo.decimals);

        return HubSpokeStructs.DenormalizedVaultAmount(
            realValues.deposited / (priceCollateral * expVal),
            realValues.borrowed / (priceDebt * expVal)
        );
    }

    function applyCollateralizationRatios(address asset, HubSpokeStructs.NotionalVaultAmount memory vaultAmount) public view override returns (HubSpokeStructs.NotionalVaultAmount memory) {
        IAssetRegistry assetRegistry = getAssetRegistry();
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(asset);
        uint256 collateralizationRatioPrecision = assetRegistry.getCollateralizationRatioPrecision();
        vaultAmount.deposited = vaultAmount.deposited * collateralizationRatioPrecision / assetInfo.collateralizationRatioDeposit;
        vaultAmount.borrowed = vaultAmount.borrowed * assetInfo.collateralizationRatioBorrow / collateralizationRatioPrecision;
        return vaultAmount;
    }

    function removeCollateralizationRatios(address asset, HubSpokeStructs.NotionalVaultAmount memory vaultAmount) public view override returns (HubSpokeStructs.NotionalVaultAmount memory) {
        IAssetRegistry assetRegistry = getAssetRegistry();
        IAssetRegistry.AssetInfo memory assetInfo = assetRegistry.getAssetInfo(asset);
        uint256 collateralizationRatioPrecision = assetRegistry.getCollateralizationRatioPrecision();
        vaultAmount.deposited = vaultAmount.deposited * assetInfo.collateralizationRatioDeposit / collateralizationRatioPrecision;
        vaultAmount.borrowed = vaultAmount.borrowed * collateralizationRatioPrecision / assetInfo.collateralizationRatioBorrow;
        return vaultAmount;
    }

    function calculateEffectiveNotionals(address asset, HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount) public view override returns (HubSpokeStructs.NotionalVaultAmount memory) {
        return applyCollateralizationRatios(asset, calculateNotionals(asset, vaultAmount));
    }

    /**
     * @dev Check if a deposit of a certain amount of a certain asset is allowed
     *
     * @param assetAddress - The address of the relevant asset
     * @param assetAmount - The amount of the relevant asset
     * @param shouldRevert - Whether we should revert or simply log the error
     * Only returns if this deposit does not exceed the deposit limit for the asset
     * @return success - Whether the deposit is allowed
     * @return error - The error message if the deposit is not allowed
     */
    function checkAllowedToDeposit(address assetAddress, uint256 assetAmount, bool shouldRevert)
        external
        view
        override
        returns (bool success, string memory error)
    {
        IAssetRegistry.AssetInfo memory assetInfo = getAssetInfo(assetAddress);
        if (assetInfo.supplyLimit < type(uint256).max) {
            HubSpokeStructs.DenormalizedVaultAmount memory globalAmounts = hub.getGlobalAmounts(assetAddress);

            if (globalAmounts.deposited + assetAmount > assetInfo.supplyLimit) {
                if (shouldRevert) {
                    revert DepositLimitExceeded();
                }
                return (false, ERROR_DEPOSIT_LIMIT_EXCEEDED);
            }
        }

        return (true, error);
    }

    /**
     * @dev Check if vaultOwner is allowed to withdraw assetAmount of assetAddress from their vault
     *
     * @param vaultOwner - The address of the owner of the vault
     * @param assetAddress - The address of the relevant asset
     * @param assetAmount - The amount of the relevant asset
     * @param shouldRevert - Whether we should revert or simply log the error
     * Only returns if this withdrawal keeps the vault at a nonnegative notional value (worth >= $0 according to Pyth prices)
     * (where the deposit values are divided by the deposit collateralization ratio and the borrow values are multiplied by the borrow collateralization ratio)
     * and also if there is enough asset in the vault to complete the withdrawal
     * and also if there is enough asset in the total reserve of the protocol to complete the withdrawal
     * @return success - Whether the vault owner is allowed to withdraw
     * @return error - The error message if the vault owner is not allowed to withdraw
     */
    function checkAllowedToWithdraw(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert)
        external
        view
        override
        returns (bool success, string memory error)
    {
        (success, error) = hub.checkVaultHasAssets(vaultOwner, assetAddress, assetAmount, shouldRevert);

        if (success) {
            // checkProtocolGloballyHasAssets internally assumes the amount is denormalized
            (success, error) =
                hub.checkProtocolGloballyHasAssets(assetAddress, assetAmount, shouldRevert);
        }

        if (success) {
            HubSpokeStructs.NotionalVaultAmount memory effectiveValue = calculateEffectiveNotionals(
                assetAddress,
                HubSpokeStructs.DenormalizedVaultAmount(assetAmount, 0)
            );
            HubSpokeStructs.NotionalVaultAmount memory notionals = getVaultEffectiveNotionals(vaultOwner, true);

            bool overCollat = notionals.deposited >= notionals.borrowed + effectiveValue.deposited;

            if (shouldRevert) {
                require(overCollat, ERROR_VAULT_UNDER_COLLAT);
            }

            return (overCollat, ERROR_VAULT_UNDER_COLLAT);
        }
    }

    /**
     * @dev Check if vaultOwner is allowed to borrow assetAmount of assetAddress from their vault
     *
     * @param vaultOwner - The address of the owner of the vault
     * @param assetAddress - The address of the relevant asset
     * @param assetAmount - The amount of the relevant asset
     * @param shouldRevert - Whether we should revert or simply log the error
     * Only returns (otherwise reverts) if this borrow keeps the vault at a nonnegative notional value (worth >= $0 according to Pyth prices)
     * (where the deposit values are divided by the deposit collateralization ratio and the borrow values are multiplied by the borrow collateralization ratio)
     * and also if there is enough asset in the total reserve of the protocol to complete the borrow
     * @return success - Whether the vault owner is allowed to borrow
     * @return error - The error message if the vault owner is not allowed to borrow
     */
    function checkAllowedToBorrow(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert)
        external
        view
        override
        returns (bool success, string memory error)
    {
        IAssetRegistry.AssetInfo memory assetInfo = getAssetInfo(assetAddress);

        HubSpokeStructs.NotionalVaultAmount memory notionals = getVaultEffectiveNotionals(vaultOwner, true);

        (success, error) = hub.checkProtocolGloballyHasAssets(
            assetAddress, assetAmount, shouldRevert, assetInfo.borrowLimit
        );

        if (success) {
            HubSpokeStructs.NotionalVaultAmount memory effectiveValue = calculateEffectiveNotionals(
                assetAddress,
                HubSpokeStructs.DenormalizedVaultAmount(0, assetAmount)
            );
            bool overCollat = notionals.deposited >= notionals.borrowed + effectiveValue.borrowed;

            if (shouldRevert) {
                require(overCollat, ERROR_VAULT_UNDER_COLLAT);
            }

            return (overCollat, ERROR_VAULT_UNDER_COLLAT);
        }
    }

    /**
     * @dev Check if vaultOwner is allowed to repay assetAmount of assetAddress to their vault;
     * they must have outstanding borrows of at least assetAmount for assetAddress to enable repayment
     * @param vaultOwner - The address of the owner of the vault
     * @param assetAddress - The address of the relevant asset
     * @param assetAmount - The amount of the relevant asset
     * @param shouldRevert - Whether we should revert or simply log the error
     * @return success - Whether the vault owner is allowed to repay
     * @return error - The error message if the vault owner is not allowed to repay
     */
    function checkAllowedToRepay(address vaultOwner, address assetAddress, uint256 assetAmount, bool shouldRevert)
        external
        view
        override
        returns (bool success, string memory error)
    {
        HubSpokeStructs.DenormalizedVaultAmount memory vaultAmount = hub.getVaultAmounts(vaultOwner, assetAddress);
        IAssetRegistry.AssetInfo memory assetInfo = getAssetInfo(assetAddress);

        bool allowed;
        if (shouldRevert || assetInfo.decimals <= TokenBridgeUtilities.MAX_DECIMALS) {
            // this is a same chain operation or the bridged token has less decimals than the bridge
            // there can be no dust truncation here
            // require that the debt is strictly greater or equal to the amount being repaid
            allowed = vaultAmount.borrowed >= assetAmount;
        } else {
            // This is a cross-chain operation and Wormhole truncates the sent token to 8 decimals, so we allow for slight overpaying of the debt (by up to 1e-8)
            // This allows vault owner to always be able to fully repay outstanding borrows.
            uint256 allowedRepay = TokenBridgeUtilities.trimDust(vaultAmount.borrowed, assetInfo.decimals);
            allowedRepay += 10 ** (assetInfo.decimals - TokenBridgeUtilities.MAX_DECIMALS);
            allowed = allowedRepay >= assetAmount;
        }

        if (shouldRevert) {
            require(allowed, ERROR_VAULT_INSUFFICIENT_BORROWS);
        }

        return (allowed, ERROR_VAULT_INSUFFICIENT_BORROWS);
    }

    // Getter for hub
    function getHub() public view override returns (IHub) {
        return hub;
    }

    function setHub(IHub _hub) public override onlyOwner {
        require(address(_hub) != address(0));
        hub = _hub;
    }

    function getPriceOracle() public view override returns (IBooFiPriceOracle) {
        return priceOracle;
    }

    function setPriceOracle(IBooFiPriceOracle _priceOracle) public override onlyOwner {
        require(address(_priceOracle) != address(0));
        priceOracle = _priceOracle;
    }

    function getPriceStandardDeviations() public view override returns (uint256, uint256) {
        return (priceStandardDeviations, priceStandardDeviationsPrecision);
    }

    function setPriceStandardDeviations(uint256 _priceStandardDeviations, uint256 _precision) public override onlyOwner {
        priceStandardDeviations = _priceStandardDeviations;
        priceStandardDeviationsPrecision = _precision;
    }
}
