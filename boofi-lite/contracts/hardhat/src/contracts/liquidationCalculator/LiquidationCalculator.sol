// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/ILiquidationCalculator.sol";
import "../../interfaces/IHubPriceUtilities.sol";
import "../../interfaces/IAssetRegistry.sol";
import "../../interfaces/IHub.sol";

contract LiquidationCalculator is ILiquidationCalculator, Ownable {
    IHub hub;

    // internal storage

    // defines the maximum post-liquidation health factor
    // e.g. let:
    // s_deposit = sum of all deposit notional values
    // s_borrow = sum of all borrow notional values
    // l_repay = sum of all repaid notional values
    // l_receive = sum of all received notional values
    // maxHealthFactor = 105%
    // then the post liquidation deposit to borrow ratio can't exceed 105%
    // (s_deposit - l_receive) / (s_borrow - l_repay) <= maxHealthFactor
    // this is to prevent over-liquidation
    uint256 maxHealthFactor;
    uint256 maxHealthFactorPrecision;

    // errors
    error VaultCantBeZero();
    error UnregisteredAsset();
    error DuplicateAddresses();
    error ArrayLengthsDoNotMatch();
    error VaultNotUnderwater();
    error OnlyMaxLiquidationBonus();
    error OnlyMaxLiquidationPortion();
    error OverLiquidated();

    constructor(address _hub, uint256 _maxHealthFactor, uint256 _maxHealthFactorPrecision) Ownable(msg.sender) {
        hub = IHub(_hub);
        setMaxHealthFactor(_maxHealthFactor, _maxHealthFactorPrecision);
    }

    function getPriceUtilities() internal view returns (IHubPriceUtilities) {
        return IHubPriceUtilities(hub.getPriceUtilities());
    }

    function getAssetRegistry() internal view returns (IAssetRegistry) {
        return IAssetRegistry(hub.getAssetRegistry());
    }

    function getAssetInfo(address asset) internal view returns (IAssetRegistry.AssetInfo memory) {
        return getAssetRegistry().getAssetInfo(asset);
    }

    /**
     * @notice Checks if the inputs for a liquidation are valid.
     * Specifically, checks if each address is a registered asset and both address arrays do not contain duplicate
     * addresses. All the checks in this function should throw an error.
     *
     * @param input - The liquidation input, which includes the vault and the assets involved in the liquidation.
     */
    function checkLiquidationInputsValid(LiquidationInput calldata input) external view override {
        if (input.vault == address(0)) {
            revert VaultCantBeZero();
        }

        IAssetRegistry assetRegistry = getAssetRegistry();
        for (uint256 i = 0; i < input.assets.length;) {
            address addr = input.assets[i].assetAddress;
            if (!assetRegistry.getAssetInfo(addr).exists) {
                revert UnregisteredAsset();
            }

            for (uint256 j = 0; j < i;) {
                if (addr == input.assets[j].assetAddress) {
                    revert DuplicateAddresses();
                }

                unchecked {
                    ++j;
                }
            }

            unchecked {
                i++;
            }
        }
    }

    /**
     * @notice Checks if a liquidation is allowed.
     *
     * This function checks if the vault is underwater (borrowed value > deposited value). If it is not, the function reverts.
     * It then calculates the notional repaid and received amounts for each asset in the liquidation input.
     * Finally, it checks if the liquidation portion is valid.
     *
     * @param input - The liquidation input, which includes the vault and the assets involved in the liquidation. Input amounts should be normalized
     */
    function checkAllowedToLiquidate(LiquidationInput calldata input) external view override {
        HubSpokeStructs.NotionalVaultAmount memory notionals = getPriceUtilities().getVaultEffectiveNotionals(input.vault, true);
        HubSpokeStructs.NotionalVaultAmount memory notionalsWithoutRatios = getPriceUtilities().getVaultEffectiveNotionals(input.vault, false);

        if (notionals.deposited >= notionals.borrowed) revert VaultNotUnderwater();

        IAssetRegistry assetRegistry = getAssetRegistry();
        uint256 trueNotionalRepaid;
        uint256 colatNotionalRepaid;
        uint256 colatNotionalReceived;
        uint256[] memory notionalReceivedArray = new uint256[](input.assets.length);
        uint256[] memory maxLiquidationBonusArray = new uint256[](input.assets.length);
        DenormalizedLiquidationAsset memory asset;
        for (uint256 i = 0; i < input.assets.length;) {
            asset = input.assets[i];
            if (asset.repaidAmount > 0) {
                (uint256 _trueNotionalRepaid, uint256 _colatNotionalRepaid) = calculateNotionalRepaid(input.vault, asset);
                checkLiquidationPortion(asset.assetAddress, _trueNotionalRepaid, notionalsWithoutRatios);
                trueNotionalRepaid += _trueNotionalRepaid;
                colatNotionalRepaid += _colatNotionalRepaid;
            }

            if (asset.receivedAmount > 0) {
                (uint256 trueNotionalReceived, uint256 _colatNotionalReceived) = calculateNotionalReceived(
                    input.vault,
                    asset
                );
                notionalReceivedArray[i] = trueNotionalReceived;
                colatNotionalReceived += _colatNotionalReceived;
                maxLiquidationBonusArray[i] = assetRegistry.getAssetInfo(asset.assetAddress).maxLiquidationBonus;
            }

            unchecked {
                i++;
            }
        }

        checkLiquidationBonusValidity(notionalReceivedArray, maxLiquidationBonusArray, trueNotionalRepaid);

        if (
            ((notionals.deposited - colatNotionalReceived) * maxHealthFactorPrecision)
                / (notionals.borrowed - colatNotionalRepaid) > maxHealthFactor
        ) {
            revert OverLiquidated();
        }
    }

    // INTERNAL FUNCTIONS

    /**
     * @dev Checks the validity of the liquidation bonus params. It then calculates the total limit used for all assets involved in the liquidation.
     * If the notional received for an asset is greater than the limit for that asset, or if the total limit used is greater than 1, it reverts.
     * @param notionalReceived - An array of the notional amounts received for each asset involved in the liquidation.
     * @param maxLiquidationBonus - An array of the maximum liquidation bonuses for each asset involved in the liquidation.
     * @param notionalRepaid - The total notional amount repaid in the liquidation.
     */
    function checkLiquidationBonusValidity(
        uint256[] memory notionalReceived,
        uint256[] memory maxLiquidationBonus,
        uint256 notionalRepaid
    ) internal view {
        if (notionalReceived.length != maxLiquidationBonus.length) revert ArrayLengthsDoNotMatch();

        uint256 totalLimitUsed = 0;
        uint256 precision = getAssetRegistry().getCollateralizationRatioPrecision();
        for (uint256 i = 0; i < notionalReceived.length; i++) {
            if (notionalReceived[i] == 0) {
                continue;
            }
            uint256 limitForThisAsset = notionalRepaid * maxLiquidationBonus[i] / precision;
            if (notionalReceived[i] > limitForThisAsset) revert OnlyMaxLiquidationBonus();

            uint256 limitUsedForThisAsset = precision * notionalReceived[i] / limitForThisAsset;
            totalLimitUsed += limitUsedForThisAsset;

            if (totalLimitUsed > precision) revert OnlyMaxLiquidationBonus();
        }
    }

    /**
     * @dev Calculates the notional amount repaid during a liquidation.
     *
     * This function first retrieves the address of the asset being repaid and its corresponding accrual indices.
     * It then normalizes the amount of the asset being repaid.
     * Next, it checks if the vault is allowed to repay this amount of the asset. If not, it reverts.
     * Finally, it calculates and returns the notional amount repaid, which is the product of the normalized repay amount,
     * the borrowed accrual index, the price of the asset, and a factor to account for decimal differences.
     *
     * @param liquidationAsset - The liquidation asset being repaid. The amounts are real amounts, not normalized.
     * @param vault - The address of the vault being liquidated.
     * @return trueValue - The notional amount repaid.
     * @return collatRatioValue - The collateralization ratio value adjusted amount of the notional repaid.
     */
    function calculateNotionalRepaid(address vault, DenormalizedLiquidationAsset memory liquidationAsset)
        internal
        view
        returns (uint256 trueValue, uint256 collatRatioValue)
    {
        IHubPriceUtilities hubPriceUtilities = getPriceUtilities();
        hubPriceUtilities.checkAllowedToRepay(vault, liquidationAsset.assetAddress, liquidationAsset.repaidAmount, true);

        trueValue = hubPriceUtilities.calculateNotionals(liquidationAsset.assetAddress, HubSpokeStructs.DenormalizedVaultAmount(0, liquidationAsset.repaidAmount)).borrowed;
        collatRatioValue = hubPriceUtilities.applyCollateralizationRatios(liquidationAsset.assetAddress, HubSpokeStructs.NotionalVaultAmount(0, trueValue)).borrowed;
    }

    /**
     * @dev Calculates the notional amount received during a liquidation.
     *
     * This function first retrieves the address of the asset being received and its corresponding accrual indices.
     * It then normalizes the amount of the asset being received.
     * Next, it checks if the vault has enough of this asset and if the protocol globally has enough of this asset. If not, it reverts.
     * Finally, it calculates and returns the notional amount received, which is the product of the normalized receipt amount,
     * the deposited accrual index, the price of the asset, and a factor to account for decimal differences.
     *
     * @param vault - The address of the vault being liquidated.
     * @param liquidationAsset - The liquidation asset being received.
     * @return trueValue - The notional amount received. Amount should be normalized.
     * @return collatRatioValue - The collateralization ratio value adjusted amount of the notional received.
     */
    function calculateNotionalReceived(address vault, DenormalizedLiquidationAsset memory liquidationAsset)
        internal
        view
        returns (uint256 trueValue, uint256 collatRatioValue)
    {
        IHubPriceUtilities hubPriceUtilities = getPriceUtilities();
        hub.checkVaultHasAssets(vault, liquidationAsset.assetAddress, liquidationAsset.receivedAmount, true);
        if (!liquidationAsset.depositTakeover) {
            // checking if the amount of asset in the protocol post repayment is greater than the value the liquidator wants to receive
            // the formula is (deposits - borrows) + repayment >= received
            // it's rearranged to avoid underflows
            // this is a variation of HubChecks::checkProtocolGloballyHasAssets that takes into account the amount being repaid
            HubSpokeStructs.DenormalizedVaultAmount memory globalAmounts = hub.getGlobalAmounts(liquidationAsset.assetAddress);
            require(globalAmounts.deposited + liquidationAsset.repaidAmount >= liquidationAsset.receivedAmount + globalAmounts.borrowed, "GlobalInsufficientAssets");
        }

        trueValue = hubPriceUtilities.calculateNotionals(liquidationAsset.assetAddress, HubSpokeStructs.DenormalizedVaultAmount(liquidationAsset.receivedAmount, 0)).deposited;
        collatRatioValue = hubPriceUtilities.applyCollateralizationRatios(liquidationAsset.assetAddress, HubSpokeStructs.NotionalVaultAmount(trueValue, 0)).deposited;
    }

    /**
     * @dev Checks if the liquidation portion is valid.
     *
     * It checks if the notional repaid is greater than the maximum allowed liquidation portion of the vault's borrowed value.
     * If it is, the function reverts.
     *
     * @param assetAddress - The address of the asset being repaid.
     * @param notionalRepaid - The notional amount repaid.
     * @param notionals - The notional amounts of the vault.
     */
    function checkLiquidationPortion(address assetAddress, uint256 notionalRepaid, HubSpokeStructs.NotionalVaultAmount memory notionals)
        internal
        view
    {
        uint256 maxLiquidationPortion = getAssetInfo(assetAddress).maxLiquidationPortion;

        if (notionalRepaid > (maxLiquidationPortion * notionals.borrowed) / getAssetRegistry().getMaxLiquidationPortionPrecision()) {
            revert OnlyMaxLiquidationPortion();
        }
    }

    function getMaxHealthFactor() external view override returns (uint256, uint256) {
        return (maxHealthFactor, maxHealthFactorPrecision);
    }

    // OWNER FUNCTIONS

    /**
     * @notice Sets the maximum health factor and its precision.
     * @dev Can only be called by the contract owner.
     * @param _maxHealthFactor The maximum health factor to be set.
     * @param _maxHealthFactorPrecision The precision of the maximum health factor.
     */
    function setMaxHealthFactor(uint256 _maxHealthFactor, uint256 _maxHealthFactorPrecision) public onlyOwner {
        maxHealthFactor = _maxHealthFactor;
        maxHealthFactorPrecision = _maxHealthFactorPrecision;
    }
}
