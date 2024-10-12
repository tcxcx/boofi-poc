use ethers::prelude::*;
use std::sync::Arc;
use std::env;
use eyre::Result;
use tokio::time::{self, Duration};

mod utils;
use utils::{liquidation::{Liquidation, construct_liquidation_input}, monitor_positions::Monitor};

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();
    
    // Set up Ethereum provider
    let provider_url = env::var("BASE_SEPOLIA_RPC_URL").expect("Missing BASE_SEPOLIA_RPC_URL");
    let provider = Provider::<Http>::try_from(provider_url)?.interval(Duration::from_millis(10));
    
    // Set up wallet (private key should be securely handled)
    let wallet: LocalWallet = env::var("PRIVATE_KEY")?
        .parse::<LocalWallet>()?
        .with_chain_id(84532u64);

    let client = Arc::new(SignerMiddleware::new(provider, wallet));
    
    // Set up contract addresses
    let liquidator_address = env::var("LIQUIDATOR_FLASHLOAN_ADDRESS").expect("Missing LIQUIDATOR_FLASHLOAN_ADDRESS");
    let hub_address = env::var("HUB_CONTRACT_ADDRESS").expect("Missing HUB_CONTRACT_ADDRESS");

    // Instantiate Liquidation and Monitor
    let liquidator = Liquidation::new(client.clone(), liquidator_address.parse().unwrap()).await?;
    let monitor = Monitor::new(client.clone(), hub_address.parse().unwrap()).await?;

    // Monitoring loop
    loop {
        let vaults = monitor.check_positions().await?;
        for vault in vaults {
            if vault.is_undercollateralized {
                let liquidation_input = construct_liquidation_input(
                    vault.vault_address,
                    vec![/* repay addresses */],
                    vec![/* repay amounts */],
                    vec![/* receipt addresses */],
                    vec![/* receipt amounts */],
                );

                match liquidator.trigger_liquidation(liquidation_input).await {
                    Ok(_) => println!("Successfully liquidated vault: {:?}", vault.vault_address),
                    Err(e) => println!("Failed to liquidate vault: {:?} due to {:?}", vault.vault_address, e),
                }
            }
        }

        // Sleep for a defined period before checking again
        time::sleep(Duration::from_secs(30)).await;
    }
}
