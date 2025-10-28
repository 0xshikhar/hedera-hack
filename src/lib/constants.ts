// # Hedera FileThetic Configuration 

// store all details related to contracts here 

export const HEDERA_ACCOUNT_ID="0.0.7158221"

export const HEDERA_NETWORK="testnet"
export const DATASET_NFT_TOKEN_ID="0.0.7159775"
export const FILE_TOKEN_ID="0.0.7159776"
export const PAYMENT_TOKEN_ID="0.0.7159777"
export const DATASET_METADATA_TOPIC_ID="0.0.7159779"
export const VERIFICATION_LOGS_TOPIC_ID="0.0.7159780"
export const AGENT_COMMUNICATION_TOPIC_ID="0.0.7159781"
export const AUDIT_TRAIL_TOPIC_ID="0.0.7159782"
export const MARKETPLACE_EVENTS_TOPIC_ID="0.0.7159783"

export const FTUSD_TOKEN_ID="0.0.7159777" // payment token id

export const MARKETPLACE_CONTRACT_ID="0.0.7158321"
export const PROVIDER_REGISTRY_CONTRACT_ID="0.0.7158323"
export const VERIFICATION_ORACLE_CONTRACT_ID="0.0.7158325"


// ## Deployed Hedera Infrastructure

// ### Tokens (HTS)
// - **Dataset NFT**: `0.0.7158235` - AI dataset ownership
// - **FILE Token**: `0.0.7158236` - Utility & rewards
// - **FTUSD Token**: `0.0.7158237` - Payments

// ### Smart Contracts
// - **Marketplace**: `0.0.7158321` - FiletheticMarketplace.sol
// - **Provider Registry**: `0.0.7158323` - ProviderRegistry.sol
// - **Verification Oracle**: `0.0.7158325` - VerificationOracle.sol

// ### HCS Topics
// - **Dataset Metadata**: `0.0.7158238`
// - **Verification Logs**: `0.0.7158239`
// - **Agent Communication**: `0.0.7158240`
// - **Audit Trail**: `0.0.7158241`
// - **Marketplace Events**: `0.0.7158243`

// ### Operator Account
// - **Account ID**: `0.0.7158221`


// WARNING: Consider using fromStringECDSA() or fromStringED25519() on a HEX-encoded string and fromStringDer() on a HEX-encoded string with DER prefix instead.
// ✅ Hedera client initialized for testnet
//    Operator: 0.0.7158221
// 📡 Network: testnet
// 👤 Operator: 0.0.7158221

// 📦 Step 1: Creating Dataset NFT Collection...
// ✅ Created NFT collection: 0.0.7158235
//    Name: FileThetic Dataset NFT (FTDS)
//    Royalty: 5/100 (5.00%)
// ✅ Dataset NFT Collection created: 0.0.7158235
//    ✅ Dataset NFT Token ID: 0.0.7158235

// 💰 Step 2: Creating FILE Utility Token...
// ✅ Created fungible token: 0.0.7158236
//    Name: FileThetic Token (FILE)
//    Decimals: 18
//    Initial Supply: 0
//    ✅ FILE Token ID: 0.0.7158236

// 💵 Step 3: Creating Payment Token...
// ✅ Created fungible token: 0.0.7158237
//    Name: FileThetic USD (FTUSD)
//    Decimals: 6
//    Initial Supply: 1000000000000
//    ✅ Payment Token ID: 0.0.7158237

// 📝 Step 4: Creating HCS Topics...
// ✅ Created HCS topic: 0.0.7158238
//    Memo: FileThetic - dataset-metadata
//    ✅ Dataset Metadata Topic: 0.0.7158238
// ✅ Created HCS topic: 0.0.7158239
//    Memo: FileThetic - verification-logs
//    ✅ Verification Logs Topic: 0.0.7158239
// ✅ Created HCS topic: 0.0.7158240
//    Memo: FileThetic - agent-communication
//    ✅ Agent Communication Topic: 0.0.7158240
// ✅ Created HCS topic: 0.0.7158241
//    Memo: FileThetic - audit-trail
//    ✅ Audit Trail Topic: 0.0.7158241
// ✅ Created HCS topic: 0.0.7158243
//    Memo: FileThetic - marketplace-events
//    ✅ Marketplace Events Topic: 0.0.7158243

// 💾 Step 5: Saving configuration...
//    ✅ Configuration saved to: /Users/shikharsingh/Downloads/code/hedera/ai/filethetic-hedera/hedera-config.json

// 📝 Step 6: Updating .env file...
//    ✅ .env file updated

// ✨ Hedera initialization complete!

// 📋 Summary:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tokens:
//   • Dataset NFT: 0.0.7158235
//   • FILE Token: 0.0.7158236
//   • Payment Token: 0.0.7158237

// Topics:
//   • Dataset Metadata: 0.0.7158238
//   • Verification Logs: 0.0.7158239
//   • Agent Communication: 0.0.7158240
//   • Audit Trail: 0.0.7158241
//   • Marketplace Events: 0.0.7158243
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 🎉 Next steps:
//   1. Review hedera-config.json
//   2. Deploy smart contracts (coming soon)
//   3. Start the development server: bun run dev
//   4. Test the integration
