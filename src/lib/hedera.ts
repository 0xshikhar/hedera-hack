/**
 * Hedera-native integration for FileThetic
 * Replaces EVM/web3 implementation with Hedera Token Service (HTS) and Hedera Consensus Service (HCS)
 */

import {
  Client,
  AccountId,
  PrivateKey,
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

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;

// Token IDs from environment
const DATASET_NFT_TOKEN_ID = process.env.NEXT_PUBLIC_DATASET_NFT_TOKEN_ID || '0.0.7158235';
const FILE_TOKEN_ID = process.env.NEXT_PUBLIC_FILE_TOKEN_ID || '0.0.7158236';
const FTUSD_TOKEN_ID = process.env.NEXT_PUBLIC_FTUSD_TOKEN_ID || '0.0.7158237';

// Topic IDs from environment
const DATASET_METADATA_TOPIC_ID = process.env.NEXT_PUBLIC_DATASET_METADATA_TOPIC_ID || '0.0.7158238';
const VERIFICATION_LOGS_TOPIC_ID = process.env.NEXT_PUBLIC_VERIFICATION_LOGS_TOPIC_ID || '0.0.7158239';

/**
 * Get Hedera client
 */
export function getHederaClient(): Client {
  const client = HEDERA_NETWORK === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();

  if (HEDERA_ACCOUNT_ID && HEDERA_PRIVATE_KEY) {
    client.setOperator(
      AccountId.fromString(HEDERA_ACCOUNT_ID),
      PrivateKey.fromString(HEDERA_PRIVATE_KEY)
    );
  }

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
 * Create a dataset NFT on Hedera
 */
export async function createDataset(
  name: string,
  description: string,
  ipfsHash: string,
  price: number,
  category: string,
  tags: string[]
): Promise<{ success: boolean; tokenId?: string; serialNumber?: number; error?: string }> {
  try {
    const client = getHederaClient();
    const accountId = getWalletAddress();

    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    // Create metadata for the NFT
    const metadata = {
      name,
      description,
      ipfsHash,
      price,
      category,
      tags,
      creator: accountId,
      createdAt: new Date().toISOString(),
    };

    // Mint NFT on Hedera
    const mintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(DATASET_NFT_TOKEN_ID))
      .setMetadata([Buffer.from(JSON.stringify(metadata))])
      .execute(client);

    const receipt = await mintTx.getReceipt(client);
    const serialNumber = receipt.serials[0].toNumber();

    // Submit metadata to HCS topic
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(DATASET_METADATA_TOPIC_ID))
      .setMessage(JSON.stringify({
        type: 'dataset_created',
        tokenId: DATASET_NFT_TOKEN_ID,
        serialNumber,
        metadata,
        timestamp: new Date().toISOString(),
      }))
      .execute(client);

    await topicTx.getReceipt(client);

    return {
      success: true,
      tokenId: DATASET_NFT_TOKEN_ID,
      serialNumber,
    };
  } catch (error: any) {
    console.error('Error creating dataset:', error);
    return {
      success: false,
      error: error.message || 'Failed to create dataset',
    };
  }
}

/**
 * Lock a dataset (mark as finalized)
 */
export async function lockDataset(
  tokenId: string,
  serialNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getHederaClient();
    const accountId = getWalletAddress();

    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    // Submit lock event to HCS topic
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(DATASET_METADATA_TOPIC_ID))
      .setMessage(JSON.stringify({
        type: 'dataset_locked',
        tokenId,
        serialNumber,
        lockedBy: accountId,
        timestamp: new Date().toISOString(),
      }))
      .execute(client);

    await topicTx.getReceipt(client);

    return { success: true };
  } catch (error: any) {
    console.error('Error locking dataset:', error);
    return {
      success: false,
      error: error.message || 'Failed to lock dataset',
    };
  }
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
    // Get all dataset creation messages from HCS topic
    const messages = await hgraphClient.getTopicMessages(DATASET_METADATA_TOPIC_ID, 1000);

    const datasets: Dataset[] = [];
    const datasetMap = new Map<string, Dataset>();

    // Process messages in order
    for (const msg of messages) {
      try {
        const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
        const data = JSON.parse(decoded);

        const key = `${data.tokenId}-${data.serialNumber}`;

        if (data.type === 'dataset_created') {
          datasetMap.set(key, {
            id: data.serialNumber,
            tokenId: data.tokenId,
            name: data.metadata.name,
            description: data.metadata.description,
            ipfsHash: data.metadata.ipfsHash,
            cid: data.metadata.ipfsHash, // Alias
            price: data.metadata.price,
            category: data.metadata.category,
            tags: data.metadata.tags || [],
            creator: data.metadata.creator,
            owner: data.metadata.creator, // Initially owned by creator
            createdAt: data.metadata.createdAt,
            locked: false,
            verified: false,
            purchaseCount: 0,
          });
        } else if (data.type === 'dataset_locked') {
          const dataset = datasetMap.get(key);
          if (dataset) {
            dataset.locked = true;
          }
        } else if (data.type === 'dataset_purchased') {
          const dataset = datasetMap.get(key);
          if (dataset) {
            dataset.purchaseCount = (dataset.purchaseCount || 0) + 1;
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    }

    return Array.from(datasetMap.values());
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
