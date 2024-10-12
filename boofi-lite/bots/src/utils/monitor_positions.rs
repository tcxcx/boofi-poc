use ethers::prelude::*;
use ethers::contract::Contract;
use ethers::abi::Abi;
use ethers::providers::Middleware;
use std::sync::Arc;
use eyre::Result;
use serde_json;

#[derive(Debug)]
pub struct Vault {
    pub vault_address: Address,
    pub is_undercollateralized: bool,
}

pub struct Monitor<M> {
    pub client: Arc<M>,
    pub hub_contract: Contract<M>,
}

impl<M: Middleware + 'static> Monitor<M> {
    pub async fn new(client: Arc<M>, hub_address: Address) -> Result<Self> {
        let abi: Abi = serde_json::from_slice(include_bytes!("../../abi/Hub.json"))?;
        let contract = Contract::new(hub_address, abi, client.clone());
        Ok(Self {
            client,
            hub_contract: contract,
        })
    }

    pub async fn check_positions(&self) -> Result<Vec<Vault>> {
        let mut vaults = Vec::new();

        // Query the health factors of all positions
        let health_factors: Vec<U256> = self
            .hub_contract
            .method::<(), Vec<U256>>("getHealthFactors", ())?
            .call()
            .await?;

        // Check if each vault is undercollateralized
        for (index, health_factor) in health_factors.iter().enumerate() {
            let is_undercollateralized = *health_factor < U256::from(100); // Assuming 100 represents a risky health factor
            let vault_address = Address::from_low_u64_be(index as u64);
            vaults.push(Vault {
                vault_address,
                is_undercollateralized,
            });
        }

        Ok(vaults)
    }
}
