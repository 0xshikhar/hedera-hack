#!/bin/bash

# Script to migrate wagmi imports to Hedera wallet

echo "🔄 Migrating from wagmi to Hedera wallet..."

# Find all files using wagmi
files=$(grep -rl "from 'wagmi'" src/ 2>/dev/null || true)

for file in $files; do
  echo "📝 Processing: $file"
  
  # Replace wagmi import with Hedera wallet
  sed -i '' "s/import { useAccount } from 'wagmi';/import { useHederaWallet } from '@\/contexts\/HederaWalletContext';/g" "$file"
  
  # Replace useAccount destructuring patterns
  sed -i '' "s/const { isConnected, address }/const { isConnected, accountId: address }/g" "$file"
  sed -i '' "s/const { address, isConnected }/const { accountId: address, isConnected }/g" "$file"
  sed -i '' "s/const { address }/const { accountId: address }/g" "$file"
  sed -i '' "s/const { isConnected }/const { isConnected }/g" "$file"
  sed -i '' "s/const { address, chainId }/const { accountId: address, network: chainId }/g" "$file"
  
  echo "✅ Migrated: $file"
done

echo "✨ Migration complete!"
echo "📦 Running build..."

bun run build
