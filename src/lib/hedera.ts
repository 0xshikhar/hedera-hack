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
} from '@hashgraph/sdk';
import { Dataset, VerificationInfo } from './types';
import { hgraphClient } from './hgraph/client';
import {
  HEDERA_NETWORK,
  DATASET_NFT_TOKEN_ID,
  FILE_TOKEN_ID,
  PAYMENT_TOKEN_ID,
  DATASET_METADATA_TOPIC_ID,
  VERIFICATION_LOGS_TOPIC_ID,
  HEDERA_ACCOUNT_ID,
  FTUSD_TOKEN_ID
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
    
    // Get all dataset creation messages from HCS topic
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
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit verification',
    };
  }
}
