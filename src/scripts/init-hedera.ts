/**
 * Initialize Hedera Environment for FileThetic
 * This script creates the necessary HTS tokens and HCS topics
 * Run with: bun run src/scripts/init-hedera.ts
 */

import { HederaClient } from '../lib/hedera/client';
import { HederaTokenService } from '../lib/hedera/token';
import { HederaConsensusService, FiletheticTopicType } from '../lib/hedera/consensus';
import { DatasetNFTService } from '../lib/hedera/dataset-nft';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface HederaConfig {
  network: string;
  operatorAccountId: string;
  tokens: {
    datasetNFT: string;
    fileToken: string;
    paymentToken: string;
  };
  topics: {
    datasetMetadata: string;
    verificationLogs: string;
    agentCommunication: string;
    auditTrail: string;
    marketplaceEvents: string;
  };
  contracts: {
    marketplace: string;
    providerRegistry: string;
    verificationOracle: string;
  };
}

async function initializeHedera() {
  console.log('🚀 Initializing Hedera environment for FileThetic...\n');

  try {
    // Initialize client
    const client = HederaClient.initialize();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();
    const network = HederaClient.getNetwork();

    console.log(`📡 Network: ${network}`);
    console.log(`👤 Operator: ${operatorId.toString()}\n`);

    const config: HederaConfig = {
      network,
      operatorAccountId: operatorId.toString(),
      tokens: {
        datasetNFT: '',
        fileToken: '',
        paymentToken: '',
      },
      topics: {
        datasetMetadata: '',
        verificationLogs: '',
        agentCommunication: '',
        auditTrail: '',
        marketplaceEvents: '',
      },
      contracts: {
        marketplace: '',
        providerRegistry: '',
        verificationOracle: '',
      },
    };

    // Step 1: Create Dataset NFT Collection
    console.log('📦 Step 1: Creating Dataset NFT Collection...');
    const datasetNFTTokenId = await DatasetNFTService.createDatasetNFTCollection(
      'FileThetic Dataset NFT',
      'FTDS',
      5 // 5% royalty
    );
    config.tokens.datasetNFT = datasetNFTTokenId.toString();
    console.log(`   ✅ Dataset NFT Token ID: ${datasetNFTTokenId.toString()}\n`);

    // Step 2: Create FILE Utility Token
    console.log('💰 Step 2: Creating FILE Utility Token...');
    const fileTokenId = await HederaTokenService.createFungibleToken({
      name: 'FileThetic Token',
      symbol: 'FILE',
      decimals: 18,
      initialSupply: 0,
      maxSupply: 1_000_000_000 * Math.pow(10, 18), // 1 billion tokens
    });
    config.tokens.fileToken = fileTokenId.toString();
    console.log(`   ✅ FILE Token ID: ${fileTokenId.toString()}\n`);

    // Step 3: Create Payment Token (USDC-like for testnet)
    console.log('💵 Step 3: Creating Payment Token...');
    const paymentTokenId = await HederaTokenService.createFungibleToken({
      name: 'FileThetic USD',
      symbol: 'FTUSD',
      decimals: 6,
      initialSupply: 1_000_000 * Math.pow(10, 6), // 1 million initial supply
      maxSupply: 1_000_000_000 * Math.pow(10, 6), // 1 billion max supply
    });
    config.tokens.paymentToken = paymentTokenId.toString();
    console.log(`   ✅ Payment Token ID: ${paymentTokenId.toString()}\n`);

    // Step 4: Create HCS Topics
    console.log('📝 Step 4: Creating HCS Topics...');

    // Dataset Metadata Topic
    const datasetMetadataTopicId = await HederaConsensusService.createTopic({
      memo: `FileThetic - ${FiletheticTopicType.DATASET_METADATA}`,
    });
    config.topics.datasetMetadata = datasetMetadataTopicId.toString();
    console.log(`   ✅ Dataset Metadata Topic: ${datasetMetadataTopicId.toString()}`);

    // Verification Logs Topic
    const verificationLogsTopicId = await HederaConsensusService.createTopic({
      memo: `FileThetic - ${FiletheticTopicType.VERIFICATION_LOGS}`,
    });
    config.topics.verificationLogs = verificationLogsTopicId.toString();
    console.log(`   ✅ Verification Logs Topic: ${verificationLogsTopicId.toString()}`);

    // Agent Communication Topic
    const agentCommunicationTopicId = await HederaConsensusService.createTopic({
      memo: `FileThetic - ${FiletheticTopicType.AGENT_COMMUNICATION}`,
    });
    config.topics.agentCommunication = agentCommunicationTopicId.toString();
    console.log(`   ✅ Agent Communication Topic: ${agentCommunicationTopicId.toString()}`);

    // Audit Trail Topic
    const auditTrailTopicId = await HederaConsensusService.createTopic({
      memo: `FileThetic - ${FiletheticTopicType.AUDIT_TRAIL}`,
    });
    config.topics.auditTrail = auditTrailTopicId.toString();
    console.log(`   ✅ Audit Trail Topic: ${auditTrailTopicId.toString()}`);

    // Marketplace Events Topic
    const marketplaceEventsTopicId = await HederaConsensusService.createTopic({
      memo: `FileThetic - ${FiletheticTopicType.MARKETPLACE_EVENTS}`,
    });
    config.topics.marketplaceEvents = marketplaceEventsTopicId.toString();
    console.log(`   ✅ Marketplace Events Topic: ${marketplaceEventsTopicId.toString()}\n`);

    // Step 5: Save configuration
    console.log('💾 Step 5: Saving configuration...');
    const configPath = path.join(process.cwd(), 'hedera-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`   ✅ Configuration saved to: ${configPath}\n`);

    // Step 6: Update .env file
    console.log('📝 Step 6: Updating .env file...');
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    const envUpdates = [
      `\n# Hedera FileThetic Configuration (Generated on ${new Date().toISOString()})`,
      `NEXT_PUBLIC_HEDERA_NETWORK=${network}`,
      `NEXT_PUBLIC_DATASET_NFT_TOKEN_ID=${config.tokens.datasetNFT}`,
      `NEXT_PUBLIC_FILE_TOKEN_ID=${config.tokens.fileToken}`,
      `NEXT_PUBLIC_PAYMENT_TOKEN_ID=${config.tokens.paymentToken}`,
      `NEXT_PUBLIC_DATASET_METADATA_TOPIC_ID=${config.topics.datasetMetadata}`,
      `NEXT_PUBLIC_VERIFICATION_LOGS_TOPIC_ID=${config.topics.verificationLogs}`,
      `NEXT_PUBLIC_AGENT_COMMUNICATION_TOPIC_ID=${config.topics.agentCommunication}`,
      `NEXT_PUBLIC_AUDIT_TRAIL_TOPIC_ID=${config.topics.auditTrail}`,
      `NEXT_PUBLIC_MARKETPLACE_EVENTS_TOPIC_ID=${config.topics.marketplaceEvents}`,
    ];

    // Remove old FileThetic config if exists
    envContent = envContent.replace(/\n# Hedera FileThetic Configuration[\s\S]*?(?=\n#|\n$|$)/g, '');
    
    // Add new config
    envContent += '\n' + envUpdates.join('\n') + '\n';
    
    fs.writeFileSync(envPath, envContent);
    console.log(`   ✅ .env file updated\n`);

    // Summary
    console.log('✨ Hedera initialization complete!\n');
    console.log('📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Tokens:');
    console.log(`  • Dataset NFT: ${config.tokens.datasetNFT}`);
    console.log(`  • FILE Token: ${config.tokens.fileToken}`);
    console.log(`  • Payment Token: ${config.tokens.paymentToken}`);
    console.log('\nTopics:');
    console.log(`  • Dataset Metadata: ${config.topics.datasetMetadata}`);
    console.log(`  • Verification Logs: ${config.topics.verificationLogs}`);
    console.log(`  • Agent Communication: ${config.topics.agentCommunication}`);
    console.log(`  • Audit Trail: ${config.topics.auditTrail}`);
    console.log(`  • Marketplace Events: ${config.topics.marketplaceEvents}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Next steps:');
    console.log('  1. Review hedera-config.json');
    console.log('  2. Deploy smart contracts (coming soon)');
    console.log('  3. Start the development server: bun run dev');
    console.log('  4. Test the integration\n');

    // Close client
    await HederaClient.close();

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeHedera();
