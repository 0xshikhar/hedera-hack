/**
 * Check Hedera Account Balance
 * Run with: bun run src/scripts/check-balance.ts
 */

import { HederaClient } from '../lib/hedera/client';
import { AccountBalanceQuery } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkBalance() {
  console.log('🔍 Checking Hedera Account Balance...\n');

  try {
    const client = HederaClient.initialize();
    const accountId = HederaClient.getOperatorId();

    // Get balance
    console.log('📊 Fetching account information...');
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    console.log('\n✅ Account Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Account ID: ${accountId.toString()}`);
    console.log(`Balance: ${balance.hbars.toString()}`);
    console.log(`Balance (tinybars): ${balance.hbars.toTinybars().toString()}`);
    console.log(`Network: ${HederaClient.getNetwork()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if account has enough balance
    const hbarBalance = balance.hbars.toTinybars().toNumber();
    const requiredBalance = 10 * 100_000_000; // 10 HBAR in tinybars

    if (hbarBalance < requiredBalance) {
      console.log('⚠️  WARNING: Low Balance!');
      console.log(`   Current: ${balance.hbars.toString()}`);
      console.log(`   Recommended: 10 HBAR or more`);
      console.log('\n💡 Get free testnet HBAR:');
      console.log('   1. Visit: https://portal.hedera.com/faucet');
      console.log(`   2. Enter your account ID: ${accountId.toString()}`);
      console.log('   3. Receive 10,000 testnet HBAR\n');
    } else {
      console.log('✅ Balance is sufficient for initialization!');
      console.log(`   You have: ${balance.hbars.toString()}`);
      console.log('   Ready to run: bun run hedera:init\n');
    }

    // Show token balances if any
    if (balance.tokens && balance.tokens.size > 0) {
      console.log('🪙 Token Balances:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      for (const [tokenId, amount] of balance.tokens) {
        console.log(`   ${tokenId.toString()}: ${amount.toString()}`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Show HashScan link
    const network = HederaClient.getNetwork();
    const hashscanUrl = network === 'mainnet'
      ? `https://hashscan.io/mainnet/account/${accountId.toString()}`
      : `https://hashscan.io/testnet/account/${accountId.toString()}`;

    console.log('🔗 View on HashScan:');
    console.log(`   ${hashscanUrl}\n`);

    await HederaClient.close();
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your .env file has correct values');
    console.log('   2. Verify HEDERA_ACCOUNT_ID is set');
    console.log('   3. Verify HEDERA_PRIVATE_KEY is set');
    console.log('   4. Ensure you have internet connection\n');
    process.exit(1);
  }
}

checkBalance();
