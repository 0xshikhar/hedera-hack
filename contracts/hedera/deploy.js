/**
 * Deploy FileThetic Smart Contracts to Hedera
 * Run with: node contracts/hedera/deploy.js
 */

const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractFunctionParameters,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction,
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Hedera config
const hederaConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../hedera-config.json'), 'utf-8')
);

async function deployContract(client, contractName, constructorParams) {
  console.log(`\n📦 Deploying ${contractName}...`);

  // Read compiled contract bytecode
  const bytecode = fs.readFileSync(
    path.join(__dirname, `../out/${contractName}.sol/${contractName}.json`),
    'utf-8'
  );
  const contractBytecode = JSON.parse(bytecode).bytecode.object;

  // Create contract
  const contractCreateTx = new ContractCreateFlow()
    .setBytecode(contractBytecode)
    .setGas(1000000)
    .setConstructorParameters(constructorParams);

  const contractCreateSubmit = await contractCreateTx.execute(client);
  const contractCreateRx = await contractCreateSubmit.getReceipt(client);
  const contractId = contractCreateRx.contractId;

  console.log(`✅ ${contractName} deployed!`);
  console.log(`   Contract ID: ${contractId.toString()}`);

  return contractId;
}

async function main() {
  console.log('🚀 Deploying FileThetic Smart Contracts to Hedera...\n');

  // Initialize client
  const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  const network = process.env.HEDERA_NETWORK || 'testnet';

  const client =
    network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  client.setOperator(accountId, privateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));

  console.log(`📡 Network: ${network}`);
  console.log(`👤 Operator: ${accountId.toString()}\n`);

  try {
    // Deploy FiletheticMarketplace
    const marketplaceParams = new ContractFunctionParameters()
      .addAddress(accountId.toSolidityAddress()) // treasury
      .addAddress(hederaConfig.tokens.datasetNFT) // datasetNFTToken
      .addAddress(hederaConfig.tokens.fileToken) // fileToken
      .addAddress(hederaConfig.tokens.paymentToken); // paymentToken

    const marketplaceId = await deployContract(
      client,
      'FiletheticMarketplace',
      marketplaceParams
    );

    // Deploy ProviderRegistry
    const providerRegistryParams = new ContractFunctionParameters().addAddress(
      hederaConfig.tokens.fileToken
    );

    const providerRegistryId = await deployContract(
      client,
      'ProviderRegistry',
      providerRegistryParams
    );

    // Deploy VerificationOracle
    const verificationOracleParams = new ContractFunctionParameters().addAddress(
      hederaConfig.tokens.fileToken
    );

    const verificationOracleId = await deployContract(
      client,
      'VerificationOracle',
      verificationOracleParams
    );

    // Update config
    hederaConfig.contracts.marketplace = marketplaceId.toString();
    hederaConfig.contracts.providerRegistry = providerRegistryId.toString();
    hederaConfig.contracts.verificationOracle = verificationOracleId.toString();

    // Save updated config
    fs.writeFileSync(
      path.join(__dirname, '../../hedera-config.json'),
      JSON.stringify(hederaConfig, null, 2)
    );

    console.log('\n✨ Deployment complete!\n');
    console.log('📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Contracts:');
    console.log(`  • Marketplace: ${marketplaceId.toString()}`);
    console.log(`  • Provider Registry: ${providerRegistryId.toString()}`);
    console.log(`  • Verification Oracle: ${verificationOracleId.toString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Next steps:');
    console.log('  1. Review hedera-config.json');
    console.log('  2. Test contract interactions');
    console.log('  3. Build Hedera Agent Kit plugins');
    console.log('  4. Integrate with frontend\n');

    client.close();
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main();
