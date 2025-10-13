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
  TokenId,
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

  // Try multiple paths for compiled contracts
  const possiblePaths = [
    path.join(__dirname, `../out/${contractName}.sol/${contractName}.json`), // Foundry
    path.join(__dirname, `../artifacts/hedera/${contractName}.sol/${contractName}.json`), // Hardhat
    path.join(__dirname, `../artifacts/contracts/hedera/${contractName}.sol/${contractName}.json`), // Hardhat alt
  ];

  let contractBytecode;
  let foundPath;

  for (const bytecodePath of possiblePaths) {
    if (fs.existsSync(bytecodePath)) {
      console.log(`   Found bytecode at: ${bytecodePath}`);
      const bytecode = fs.readFileSync(bytecodePath, 'utf-8');
      const parsed = JSON.parse(bytecode);
      contractBytecode = parsed.bytecode?.object || parsed.bytecode;
      foundPath = bytecodePath;
      break;
    }
  }

  if (!contractBytecode) {
    throw new Error(
      `Contract bytecode not found for ${contractName}. Please compile contracts first:\n` +
      `  cd contracts && npm install && npm run compile\n` +
      `Searched paths:\n${possiblePaths.map(p => `  - ${p}`).join('\n')}`
    );
  }

  // Remove 0x prefix if present
  if (contractBytecode.startsWith('0x')) {
    contractBytecode = contractBytecode.slice(2);
  }

  console.log(`   Bytecode length: ${contractBytecode.length} characters`);

  // Create contract
  const contractCreateTx = new ContractCreateFlow()
    .setBytecode(contractBytecode)
    .setGas(2000000)
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
    // Convert token IDs to Solidity addresses
    const datasetNFTAddress = TokenId.fromString(hederaConfig.tokens.datasetNFT).toSolidityAddress();
    const fileTokenAddress = TokenId.fromString(hederaConfig.tokens.fileToken).toSolidityAddress();
    const paymentTokenAddress = TokenId.fromString(hederaConfig.tokens.paymentToken).toSolidityAddress();
    const treasuryAddress = accountId.toSolidityAddress();

    console.log('📝 Converting token IDs to Solidity addresses...');
    console.log(`   Treasury: ${treasuryAddress}`);
    console.log(`   Dataset NFT: ${datasetNFTAddress}`);
    console.log(`   FILE Token: ${fileTokenAddress}`);
    console.log(`   Payment Token: ${paymentTokenAddress}\n`);

    // Deploy FiletheticMarketplace
    const marketplaceParams = new ContractFunctionParameters()
      .addAddress(treasuryAddress) // treasury
      .addAddress(datasetNFTAddress) // datasetNFTToken
      .addAddress(fileTokenAddress) // fileToken
      .addAddress(paymentTokenAddress); // paymentToken

    const marketplaceId = await deployContract(
      client,
      'FiletheticMarketplace',
      marketplaceParams
    );

    // Deploy ProviderRegistry
    const providerRegistryParams = new ContractFunctionParameters()
      .addAddress(fileTokenAddress);

    const providerRegistryId = await deployContract(
      client,
      'ProviderRegistry',
      providerRegistryParams
    );

    // Deploy VerificationOracle
    const verificationOracleParams = new ContractFunctionParameters()
      .addAddress(fileTokenAddress);

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
