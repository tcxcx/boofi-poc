# boofi-poc-finance-contracts

## install tools

### install yarn

```bash
npm install -g yarn
```

### install nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

### use node version
```bash
nvm use
```

### install make MacOS / Linux

If you're using MacOS or Linux use simply your package manager

### install make Windows

Intstall MinGW (it comes with a package manger mingw-get)

Add MinGW to the Path

```
C:\MinGW\bin
```

Then install make:

```bash
mingw-get install mingw32-make
```

### Install foundry

https://book.getfoundry.sh/getting-started/installation

Add Foundry to the Path:

```
C:\Users\your_user\.foundry\bin
```

## Setup .env

You need at least an empty `.env` file to run the scripts

## install dependencies + compile

MacOS / Linux

```bash
make
```

Windows

```bash
mingw32-make
```

## run tests

quick

```bash
make test
```

specific function

```bash
make forge-test-function mt=<FUNCTION_REGEX>
```

ex: testing borrow functionality with wormhole generic relayer

```bash
make forge-test-function mt=testBorrow
```

## deploy to testnet (Hub on avalanche fuji / Spoke on op-goerli, goerli, and mumbai)

1. Make sure you have secrets in `.env` set
2. The deployment scripts overwrite contract addresses in `.env`. Make a backup if you need to keep the old values for whatever reason.
3. Make sure you have Tenderly CLI installed https://github.com/Tenderly/tenderly-cli#installation
4. Log in to Tenderly using `tenderly login`
5. Run:

```bash
yarn testnet-deploy-boofi
```

There are several steps taken by this script:
1. The Hub is deployed to Base Sepolia. The Hub contract is verified through Tenderly. The Hub contract registers 4 assets (Wormhole wrapped WETH from Optimism Goerli, native WETH from Arbitrum Goerli, Wormhole wrapped WETH from Ethereum Goerli, native USDC from Base Sepolia).
2. A Spoke is deployed to Optimism Goerli (this step sometimes freezes for some reason and needs to be re-run. in that case just run the remaining steps from `testnet-deploy-boofi` task in `package.json` manually).
3. The Op Goerli Spoke contract is verified through Tenderly
4. The Op Goerli Spoke is registered in the Hub
5. The Eth Goerli Spoke is deployed
6. The Eth Goerli Spoke is verified through Tenderly
7. The Eth Goerli Spoke is registered in the hub

The new deployment addresses are written to `.env`. If you wish to publish the new deployment, paste the addresses to `testnet.env` and `evm/subgraph/networks.json` replacing the old values and commit to the repo.

## transferring the deployed contracts to a multisig

A multisig is an address like any other, so you just need to use the transfer scripts.

```bash
npx hardhat transfer-ownership --network arb-goerli CONTRACT_ADDR NEW_OWNER
```

To transfer both the `Hub` and the `ProxyAdmin` for a given network use:

```bash
npx hardhat transfer-hub-and-proxy-admin --network arb-goerli HUB_ADDR NEW_OWNER
```

As this is potentially disastrous, the script will ask you to confirm the action before executing.

Once the ownership is held by a multisig, you can use the multisig wallet interface to perform upgrades and contract parameter changes. A good example how to do this can be found [here](https://medium.com/@msvstj/how-to-upgrade-proxies-in-multisig-safe-b09f03cbce4c).

To interact with the `ProxyAdmin` you can use the ABI in `evm/abi/ProxyAdmin.json`. To interact with the `Hub` use the ABI from `evm/artifacts/src/contracts/lendingHub/Hub.sol/Hub.json`.

## testing on testnet

### Run a basic deposit/borrow test

The `testnet-deposit-borrow` makefile rule contains several commented out variations of user actions.

```bash
make testnet-deposit-borrow
```

### Print the wormhole relay status of a specific transaction.

Use the mainnet name for `sourceChain` as this is the convention used by Wormhole SDK in `RPCS_BY_CHAIN` here: `evm/node_modules/@certusone/wormhole-sdk/lib/esm/relayer/consts.js` (ex. use `ethereum` if you want to target `Ethereum Goerli`).

TODO: add `--env=MAINNET` support

```bash
npx ts-node ./ts-scripts/getWormholeStatus.ts --sourceChain=ethereum --tx=0x3799920c1bf24156e9f6f0c8bf00fd7fd8cfd60666deae747c765368cd5d0760
```

## using testnet assets

couple of things to know about these assets

### token attestation

any asset sent using the Wormhole token bridge must first be attested. chances are someone already attested a popular asset, although on testnets it might not be the case. read more about token attestation in the [wormhole docs](https://book.wormhole.com/technical/typescript/attestingToken.html).

this means that for every asset we want supported on a Spoke chain, we must have attested it on the Token Bridge.

### asset address on source chain vs wrapped asset address on target chain

when performing an action on the Spoke (source chain), the user does so with the asset whose attested wrapped equivalent has been registered on the Hub. this wrapped asset is the one received on the Hub, and stored there as liquidity.

### registered assets

in the case of testnet where we have a Spoke deployed on avalanche testnet (fuji), we have these three assets

**these are the addresses to use when interacting with the Spoke on fuji**

- [AVAX_TESTNET_EUROE_address](https://testnet.snowtrace.io/address/0xA089a21902914C3f3325dBE2334E9B466071E5f1)
- [AVAX_TESTNET_USDC_address](https://testnet.snowtrace.io/address/0xaf82969ecf299c1f1bb5e1d12ddacc9027431160)
- [AVAX_TESTNET_ALOT_address](https://testnet.snowtrace.io/address/0x9983f755bbd60d1886cbfe103c98c272aa0f03d6)

**these are the addresses to use when interacting with the Spoke on op-goerli**

- WETH: `0x4200000000000000000000000000000000000006`

**these are the addresses to use when interacting with the Spoke on goerli**

- WETH: `0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6`

### registering a new asset

1. have a balance of the token on the Spoke chain, you can get some for fuji here: https://core.app/tools/testnet-faucet/
2. use the testnet token bridge ui to attest it, you can trigger by sending to the Hub chain: https://wormhole-foundation.github.io/example-token-bridge-ui/#/transfer
3. take the wrapped asset address on the Hub chain
4. get the associated pyth price feed id: pyth.network/developers/price-feed-ids#pyth-evm-testnet
5. call `Hub.registerAsset()` as the contract owner (see example script: `script/testnet/RegisterAsset.s.sol`)

## flow for making cross-chain calls

in general, this is what a cross-chain flow looks like

1. user initiates tx on Spoke on fuji
2. automatic relayer relays our message to the Hub target chain
3. Hub receives the message and processes
4. sends tokens to the user on their chain
5. relayer relays
6. Spoke receives the message and transfers tokens to the user