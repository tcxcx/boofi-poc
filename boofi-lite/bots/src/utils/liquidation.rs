use ethers::prelude::*;
use ethers::contract::Contract;
use ethers::abi::Abi;
use std::sync::Arc;
use eyre::Result;
use serde_json;

#[derive(Debug, Default)]
pub struct LiquidationInput {
    pub vault: Address,
    pub asset_repay_addresses: Vec<Address>,
    pub asset_repay_amounts: Vec<U256>,
    pub asset_receipt_addresses: Vec<Address>,
    pub asset_receipt_amounts: Vec<U256>,
}

pub struct Liquidation<M> {
    pub client: Arc<M>,
    pub liquidation_contract: Contract<M>,
}

impl<M: Middleware + 'static> Liquidation<M> {
    pub async fn new(client: Arc<M>, contract_address: Address) -> Result<Self> {
        let abi: Abi = serde_json::from_slice(include_bytes!("../../abi/LiquidatorFlashLoan.json"))?;
        let contract = Contract::new(contract_address, abi, client.clone());
        Ok(Self {
            client,
            liquidation_contract: contract,
        })
    }

    pub async fn trigger_liquidation(&self, liquidation_input: LiquidationInput) -> Result<()> {
        self.liquidation_contract
            .method::<_, ()>(
                "liquidation",
                (liquidation_input.vault,
                 liquidation_input.asset_repay_addresses,
                 liquidation_input.asset_repay_amounts,
                 liquidation_input.asset_receipt_addresses,
                 liquidation_input.asset_receipt_amounts)
            )?
            .send()
            .await?;

        Ok(())
    }
}

pub fn construct_liquidation_input(
    vault: Address,
    asset_repay_addresses: Vec<Address>,
    asset_repay_amounts: Vec<U256>,
    asset_receipt_addresses: Vec<Address>,
    asset_receipt_amounts: Vec<U256>,
) -> LiquidationInput {
    LiquidationInput {
        vault,
        asset_repay_addresses,
        asset_repay_amounts,
        asset_receipt_addresses,
        asset_receipt_amounts,
    }
}
