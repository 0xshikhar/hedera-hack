/**
 * Hedera-native integration for FileThetic
 * Replaces EVM/web3 implementation with Hedera Token Service (HTS) and Hedera Consensus Service (HCS)
 */

import {
  Client,
  AccountId,
  TokenId,
  TopicId,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
  ContractExecuteTransaction,
  ContractFunctionParameters,
} from '@hashgraph/sdk';
import { Dataset, VerificationInfo } from './types';
import {
  HEDERA_NETWORK,
  DATASET_NFT_TOKEN_ID,
  FILE_TOKEN_ID,
  PAYMENT_TOKEN_ID,
  DATASET_METADATA_TOPIC_ID,
  VERIFICATION_LOGS_TOPIC_ID,
  HEDERA_ACCOUNT_ID,
  FTUSD_TOKEN_ID,
  PROVIDER_REGISTRY_CONTRACT_ID,
} from './constants';

/**
 * Get Hedera client without operator for wallet-based transactions
 */
export function getHederaClient(): Client {
  const client = HEDERA_NETWORK === 'testnet'
    ? Client.forTestnet()
    : Client.forMainnet();

  return client;
}

/**
 * Check if wallet is connected (Hedera wallet)
 */
export function isWalletConnected(): boolean {
  // Check if we have account ID in session/context
  if (typeof window !== 'undefined') {
    return !!window.localStorage.getItem('hedera_account_id');
  }
  return false;
}

/**
 * Get wallet address (Hedera account ID)
 */
export function getWalletAddress(): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('hedera_account_id');
  }
  return null;
}

/**
 * Create a dataset NFT on Hedera - Returns transaction bytes for wallet signing
 */
export async function createDatasetTransaction(
  name: string,
  description: string,
  ipfsHash: string,
  price: number,
  category: string,
  tags: string[],
  userAccountId: string,
  signer: any
): Promise<{ transactionBytes: string; metadata: any }> {
  // Create minimal metadata for the NFT (just IPFS hash to avoid METADATA_TOO_LONG)
  const nftMetadata = ipfsHash.substring(0, 100);

  // Create mint transaction
  const mintTx = new TokenMintTransaction()
    .setTokenId(TokenId.fromString(DATASET_NFT_TOKEN_ID))
    .addMetadata(Buffer.from(nftMetadata))
    .setTransactionMemo('FileThetic Dataset NFT')
    .setMaxTransactionFee(new Hbar(2))
    .setNodeAccountIds([AccountId.fromString('0.0.3')]);

  // Freeze with signer from wallet
  const frozenTx = await mintTx.freezeWithSigner(signer);
  const txBytes = Buffer.from(frozenTx.toBytes()).toString('base64');

  // Prepare metadata for HCS (will be submitted after mint)
  const metadata = {
    name: name.substring(0, 100),
    description: description.substring(0, 200),
    ipfsHash,
    price,
    category,
    tags,
    creator: userAccountId,
  };

  return { transactionBytes: txBytes, metadata };
}

/**
 * Submit dataset metadata to HCS topic after minting
 */
export async function submitDatasetMetadata(
  serialNumber: number,
  metadata: any,
  userAccountId: string,
  signer: any
): Promise<string> {
  const topicMessage = {
    t: 'ds_created',
    tid: DATASET_NFT_TOKEN_ID,
    sn: serialNumber,
    n: metadata.name,
    d: metadata.description,
    ipfs: metadata.ipfsHash,
    p: metadata.price,
    c: metadata.category,
    tags: metadata.tags,
    cr: metadata.creator,
    ts: Date.now(),
  };

  const topicTx = new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(DATASET_METADATA_TOPIC_ID))
    .setMessage(JSON.stringify(topicMessage))
    .setTransactionMemo('FileThetic Metadata')
    .setMaxTransactionFee(new Hbar(1))
    .setNodeAccountIds([AccountId.fromString('0.0.3')]);

  const frozenTx = await topicTx.freezeWithSigner(signer);
  return Buffer.from(frozenTx.toBytes()).toString('base64');
}

/**
 * Lock a dataset (mark as finalized) - Returns transaction bytes
 */
export async function lockDatasetTransaction(
  tokenId: string,
  serialNumber: number,
  userAccountId: string,
  signer: any
): Promise<string> {
  const topicTx = new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(DATASET_METADATA_TOPIC_ID))
    .setMessage(JSON.stringify({
      t: 'ds_locked',
      tid: tokenId,
      sn: serialNumber,
      by: userAccountId,
      ts: Date.now(),
    }))
    .setTransactionMemo('FileThetic Lock')
    .setMaxTransactionFee(new Hbar(1))
    .setNodeAccountIds([AccountId.fromString('0.0.3')]);

  const frozenTx = await topicTx.freezeWithSigner(signer);
  return Buffer.from(frozenTx.toBytes()).toString('base64');
}

/**
 * Purchase a dataset
 */
export async function purchaseDataset(
  tokenId: string,
  serialNumber: number,
  price: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getHederaClient();
    const accountId = getWalletAddress();

    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    const buyerAccountId = AccountId.fromString(accountId);
    const datasetTokenId = TokenId.fromString(tokenId);
    const paymentTokenId = TokenId.fromString(FTUSD_TOKEN_ID);

    // Associate tokens if needed
    try {
      await new TokenAssociateTransaction()
        .setAccountId(buyerAccountId)
        .setTokenIds([datasetTokenId, paymentTokenId])
        .freezeWith(client)
        .execute(client);
    } catch (e) {
      // Token might already be associated
      console.log('Token association skipped (might already be associated)');
    }

    // Transfer payment and receive NFT
    // Note: This is simplified - in production, use atomic swap or escrow
    const transferTx = await new TransferTransaction()
      .addTokenTransfer(paymentTokenId, buyerAccountId, -price)
      .addTokenTransfer(paymentTokenId, AccountId.fromString(HEDERA_ACCOUNT_ID!), price)
      .addNftTransfer(datasetTokenId, serialNumber, AccountId.fromString(HEDERA_ACCOUNT_ID!), buyerAccountId)
      .freezeWith(client)
      .execute(client);

    await transferTx.getReceipt(client);

    // Log purchase to HCS
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(DATASET_METADATA_TOPIC_ID))
      .setMessage(JSON.stringify({
        type: 'dataset_purchased',
        tokenId,
        serialNumber,
        buyer: accountId,
        price,
        timestamp: new Date().toISOString(),
      }))
      .freezeWith(client)
      .execute(client);

    await topicTx.getReceipt(client);

    return { success: true };
  } catch (error: any) {
    console.error('Error purchasing dataset:', error);
    return {
      success: false,
      error: error.message || 'Failed to purchase dataset',
    };
  }
}

/**
 * Check if user has access to a dataset
 */
export async function hasAccessToDataset(
  tokenId: string,
  serialNumber: number
): Promise<boolean> {
  try {
    const accountId = getWalletAddress();
    if (!accountId) return false;

    // Query HGraph to check NFT ownership
    const query = `
      query CheckNFTOwnership($tokenId: String!, $accountId: String!, $serialNumber: bigint!) {
        nft(
          where: {
            token_id: { _eq: $tokenId }
            account_id: { _eq: $accountId }
            serial_number: { _eq: $serialNumber }
          }
        ) {
          token_id
          serial_number
        }
      }
    `;

    const { hgraphClient } = await import('./hgraph/client');
    const { data } = await hgraphClient['client'].query<{ nft: any[] }>({
      query,
      variables: { tokenId, accountId, serialNumber },
    });

    return !!(data?.nft && data.nft.length > 0);
  } catch (error) {
    console.error('Error checking dataset access:', error);
    return false;
  }
}

/**
 * Get all datasets from HCS topic
 */
export async function getAllDatasets(): Promise<Dataset[]> {
  try {
    console.log('📡 Fetching from HCS topic:', DATASET_METADATA_TOPIC_ID);
    
    // Use dynamic import to avoid server-side issues
    const { hgraphClient } = await import('./hgraph/client');
    const messages = await hgraphClient.getTopicMessages(DATASET_METADATA_TOPIC_ID, 1000);
    
    console.log('📨 Raw HCS messages received:', messages.length);
    console.log('📨 First few messages:', messages.slice(0, 3));

    const datasets: Dataset[] = [];
    const datasetMap = new Map<string, Dataset>();

    // Process messages in order
    let processedCount = 0;
    
    for (const msg of messages) {
      try {
        // HGraph returns hex-encoded messages (with \\x prefix), not base64
        let decoded: string;
        if (msg.message.startsWith('\\x')) {
          // Remove \\x prefix and convert hex to string
          const hexString = msg.message.slice(2);
          decoded = Buffer.from(hexString, 'hex').toString('utf-8');
        } else {
          // Fallback to base64 if not hex
          decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
        }
        
        console.log('🔓 Decoded message:', decoded.substring(0, 200));
        
        const data = JSON.parse(decoded);
        
        console.log('🔓 Decoded message:', decoded.substring(0, 200));

        // Handle shortened field names (t, tid, sn, etc.)
        const type = data.t || data.type;
        const tokenId = data.tid || data.tokenId;
        const serialNumber = data.sn || data.serialNumber;

        const key = `${tokenId}-${serialNumber}`;

        if (type === 'ds_created' || type === 'dataset_created') {
          processedCount++;
          console.log('✅ Processing dataset:', { type, tokenId, serialNumber });
          
          datasetMap.set(key, {
            id: serialNumber,
            tokenId: tokenId,
            name: data.n || data.metadata?.name || 'Unnamed Dataset',
            description: data.d || data.metadata?.description || '',
            ipfsHash: data.ipfs || data.metadata?.ipfsHash || '',
            cid: data.ipfs || data.metadata?.ipfsHash || '',
            price: data.p || data.metadata?.price || 0,
            category: data.c || data.metadata?.category || 'general',
            tags: data.tags || data.metadata?.tags || [],
            creator: data.cr || data.metadata?.creator || '',
            owner: data.cr || data.metadata?.creator || '',
            createdAt: data.ts || data.metadata?.createdAt || Date.now(),
            locked: false,
            verified: false,
            purchaseCount: 0,
          });
        } else if (type === 'ds_locked' || type === 'dataset_locked') {
          const dataset = datasetMap.get(key);
          if (dataset) {
            dataset.locked = true;
          }
        } else if (type === 'dataset_purchased') {
          const dataset = datasetMap.get(key);
          if (dataset) {
            dataset.purchaseCount = (dataset.purchaseCount || 0) + 1;
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e, msg);
      }
    }

    const finalDatasets = Array.from(datasetMap.values());
    console.log(`✅ Successfully processed ${processedCount} dataset messages`);
    console.log(`📊 Final datasets array:`, finalDatasets);
    console.log(`🔗 Verify topic manually: https://hashscan.io/testnet/topic/${DATASET_METADATA_TOPIC_ID}`);
    
    return finalDatasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
}

/**
 * Get dataset verification info
 */
export async function getDatasetVerificationInfo(
  tokenId: string,
  serialNumber: number
): Promise<VerificationInfo> {
  try {
    // Get verification logs from HCS topic
    const { hgraphClient } = await import('./hgraph/client');
    const messages = await hgraphClient.getTopicMessages(VERIFICATION_LOGS_TOPIC_ID, 1000);

    let verificationCount = 0;
    let totalScore = 0;
    const verifiers: string[] = [];

    for (const msg of messages) {
      try {
        const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
        const data = JSON.parse(decoded);

        if (
          data.type === 'verification_submitted' &&
          data.tokenId === tokenId &&
          data.serialNumber === serialNumber
        ) {
          verificationCount++;
          totalScore += data.score || 0;
          verifiers.push(data.verifier);
        }
      } catch (e) {
        console.error('Error parsing verification message:', e);
      }
    }

    const averageScore = verificationCount > 0 ? totalScore / verificationCount : 0;
    const isVerified = verificationCount >= 3 && averageScore >= 70;

    return {
      isVerified,
      verificationCount,
      averageScore,
      verifiers,
    };
  } catch (error) {
    console.error('Error fetching verification info:', error);
    return {
      isVerified: false,
      verificationCount: 0,
      averageScore: 0,
      verifiers: [],
    };
  }
}

/**
 * Check dataset verification status
 */
export async function checkDatasetVerification(
  tokenId: string,
  serialNumber: number
): Promise<boolean> {
  const info = await getDatasetVerificationInfo(tokenId, serialNumber);
  return info.isVerified;
}

/**
 * Submit verification for a dataset
 */
export async function submitVerification(
  tokenId: string,
  serialNumber: number,
  score: number,
  comments: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getHederaClient();
    const accountId = getWalletAddress();

    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    // Submit verification to HCS topic
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(VERIFICATION_LOGS_TOPIC_ID))
      .setMessage(JSON.stringify({
        type: 'verification_submitted',
        tokenId,
        serialNumber,
        verifier: accountId,
        score,
        comments,
        timestamp: new Date().toISOString(),
      }))
      .freezeWith(client)
      .execute(client);

    await topicTx.getReceipt(client);

    return { success: true };
  } catch (error) {
    console.error('Error submitting verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit verification',
    };
  }
}

// ============ Provider Registry Functions ============

export interface Provider {
  providerId: number;
  owner: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  stakedAmount: string;
  uptime: number;
  totalJobs: number;
  successfulJobs: number;
  totalRewards: string;
  registeredAt: number;
  isActive: boolean;
  isSlashed: boolean;
}

/**
 * Register as a storage provider - Returns transaction bytes for wallet signing
 */
export async function registerProviderTransaction(
  bandwidthMbps: number,
  storageTB: number,
  ipfsGateway: string,
  location: string,
  stakeAmount: number,
  userAccountId: string,
  signer: any
): Promise<string> {
  const name = `Provider-${location}`;
  const endpoint = ipfsGateway;
  const capabilities = ['storage', 'ipfs'];
  
  // Convert stake to smallest unit (assuming 18 decimals like FILE token)
  const stakeInSmallestUnit = stakeAmount * Math.pow(10, 18);

  // Create contract execute transaction
  const contractTx = new ContractExecuteTransaction()
    .setContractId(PROVIDER_REGISTRY_CONTRACT_ID)
    .setGas(500000)
    .setFunction(
      'registerProvider',
      new ContractFunctionParameters()
        .addString(name)
        .addString(endpoint)
        .addStringArray(capabilities)
        .addUint256(stakeInSmallestUnit)
    )
    .setTransactionMemo('FileThetic Provider Registration')
    .setMaxTransactionFee(new Hbar(5))
    .setNodeAccountIds([AccountId.fromString('0.0.3')]);

  // Freeze with signer from wallet
  const frozenTx = await contractTx.freezeWithSigner(signer);
  return Buffer.from(frozenTx.toBytes()).toString('base64');
}

/**
 * Get all providers from the ProviderRegistry contract using Mirror Node
 */
export async function getAllProviders(): Promise<Provider[]> {
  try {
    console.log('📊 Fetching providers from contract:', PROVIDER_REGISTRY_CONTRACT_ID);
    
    const mirrorNodeUrl = HEDERA_NETWORK === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet-public.mirrornode.hedera.com';
    
    // Step 1: Get provider IDs from ProviderRegistered events
    const eventsUrl = `${mirrorNodeUrl}/api/v1/contracts/${PROVIDER_REGISTRY_CONTRACT_ID}/results/logs?order=asc&limit=100`;
    
    console.log('🔍 Step 1: Fetching ProviderRegistered events...');
    
    const response = await fetch(eventsUrl);
    const data = await response.json();
    
    console.log('📡 Events response:', data);
    
    const providerIds = new Set<number>();
    
    // Parse ProviderRegistered events to get provider IDs
    if (data.logs && Array.isArray(data.logs)) {
      for (const log of data.logs) {
        try {
          if (log.topics && log.topics.length >= 3) {
            const providerIdHex = log.topics[1];
            const providerId = parseInt(providerIdHex, 16);
            providerIds.add(providerId);
            console.log(`✅ Found provider ID: ${providerId}`);
          }
        } catch (e) {
          console.error('❌ Error parsing log:', e);
        }
      }
    }
    
    console.log(`📋 Total provider IDs found: ${providerIds.size}`);
    
    // Step 2: Parse provider details from events (like marketplace does with HCS)
    // Event data contains: providerId (indexed), owner (indexed), name, stakedAmount
    const providerMap = new Map<number, Provider>();
    
    // Filter out provider ID 0 (doesn't exist in Solidity, counter starts at 1)
    const validProviderIds = Array.from(providerIds).filter(id => id > 0);
    console.log(`📋 Valid provider IDs (excluding 0): ${validProviderIds.length}`);
    
    if (validProviderIds.length === 0) {
      console.warn('⚠️ No valid provider IDs found');
      return [];
    }
    
    // Parse each ProviderRegistered event
    for (const log of data.logs) {
      try {
        if (!log.topics || log.topics.length < 3) continue;
        
        const providerIdHex = log.topics[1];
        const providerId = parseInt(providerIdHex, 16);
        
        // Skip provider ID 0
        if (providerId === 0) continue;
        
        console.log(`🔍 Step 2: Parsing event for provider ${providerId}...`);
        
        // Parse owner address from topics[2]
        const ownerHex = log.topics[2];
        const addressHex = ownerHex.slice(-40);
        const owner = `0.0.${parseInt(addressHex.slice(-8), 16)}`;
        
        // Parse event data (contains name and stakedAmount)
        // Event data is ABI-encoded: string name + uint256 stakedAmount
        let name = `Provider-${providerId}`;
        let endpoint = '';
        let stakedAmount = '1000000000000000000000'; // Default 1000 FILE
        
        if (log.data && log.data !== '0x') {
          try {
            // Simple ABI decoding for string + uint256
            const dataHex = log.data.startsWith('0x') ? log.data.slice(2) : log.data;
            
            // First 32 bytes = offset to string
            // Next 32 bytes = stakedAmount
            // Then string data
            
            if (dataHex.length >= 128) {
              // Get stakedAmount (bytes 32-64)
              const stakeHex = dataHex.slice(64, 128);
              stakedAmount = BigInt('0x' + stakeHex).toString();
              
              // Get string offset (bytes 0-32)
              const stringOffset = parseInt(dataHex.slice(0, 64), 16) * 2;
              
              // Get string length (at offset)
              const stringLength = parseInt(dataHex.slice(stringOffset, stringOffset + 64), 16) * 2;
              
              // Get string data
              const stringData = dataHex.slice(stringOffset + 64, stringOffset + 64 + stringLength);
              name = Buffer.from(stringData, 'hex').toString('utf-8');
              
              // Extract location from name (format: "Provider-{location}")
              if (name.startsWith('Provider-')) {
                const location = name.substring(9);
                // Endpoint was passed as location during registration
                endpoint = `https://ipfs-${location.toLowerCase().replace(/\s+/g, '-')}.io/{redacted}`;
              }
            }
          } catch (e) {
            console.warn(`⚠️ Could not decode event data for provider ${providerId}:`, e);
          }
        }
        
        const provider: Provider = {
          providerId,
          owner,
          name,
          endpoint: endpoint || `https://ipfs-gateway-${providerId}.io/`,
          capabilities: ['storage', 'ipfs'],
          stakedAmount,
          uptime: 10000, // 100% (default)
          totalJobs: 0,
          successfulJobs: 0,
          totalRewards: '0',
          registeredAt: log.timestamp ? Math.floor(new Date(log.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
          isActive: true,
          isSlashed: false,
        };
        
        providerMap.set(providerId, provider);
        console.log(`✅ Provider ${providerId} parsed:`, provider);
      } catch (e) {
        console.error(`❌ Error parsing provider event:`, e);
      }
    }
    
    const finalProviders = Array.from(providerMap.values());
    console.log(`✅ Total providers parsed: ${finalProviders.length}`);
    return finalProviders;
  } catch (error) {
    console.error('❌ Error fetching providers:', error);
    return [];
  }
}

/**
 * Get provider by ID
 */
export async function getProviderById(providerId: number): Promise<Provider | null> {
  try {
    const allProviders = await getAllProviders();
    return allProviders.find(p => p.providerId === providerId) || null;
  } catch (error) {
    console.error('Error fetching provider:', error);
    return null;
  }
}

/**
 * Get network statistics
 */
export async function getProviderNetworkStats() {
  try {
    const providers = await getAllProviders();
    
    const activeProviders = providers.filter(p => p.isActive);
    
    return {
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
      totalStaked: providers.reduce((sum, p) => sum + Number(p.stakedAmount), 0),
      averageUptime: activeProviders.length > 0 
        ? activeProviders.reduce((sum, p) => sum + Number(p.uptime), 0) / activeProviders.length / 100
        : 0,
    };
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return {
      totalProviders: 0,
      activeProviders: 0,
      totalStaked: 0,
      averageUptime: 0,
    };
  }
}
