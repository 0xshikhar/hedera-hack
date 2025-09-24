import { TokenId, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HederaTokenService } from './token';
import { FiletheticHCS, DatasetMetadataMessage } from './consensus';
import { TopicId } from '@hashgraph/sdk';

/**
 * Dataset NFT Metadata Structure
 */
export interface DatasetNFTMetadata {
  name: string;
  description: string;
  category: string;
  schema: {
    fields: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  generation: {
    model: string;
    provider: string;
    timestamp: number;
    parameters: Record<string, unknown>;
  };
  storage: {
    ipfsCID: string;
    size: number;
    format: string;
  };
  quality: {
    verificationScore: number;
    verifiers: string[];
    verificationDate: number;
  };
  pricing: {
    price: number;
    currency: string;
    royaltyPercentage: number;
  };
}

/**
 * Parameters for minting a dataset NFT
 */
export interface MintDatasetNFTParams {
  name: string;
  description: string;
  category: string;
  ipfsCID: string;
  size: number;
  format: string;
  aiModel: string;
  aiProvider: string;
  generationParams: Record<string, unknown>;
  schema: {
    fields: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  price: number;
  currency?: string;
  royaltyPercentage?: number;
}

/**
 * Dataset NFT Service for FileThetic
 * Handles creation and management of dataset NFTs using HTS
 */
export class DatasetNFTService {
  /**
   * Create Dataset NFT Collection
   */
  static async createDatasetNFTCollection(
    name: string = 'FileThetic Dataset NFT',
    symbol: string = 'FTDS',
    royaltyPercentage: number = 5
  ): Promise<TokenId> {
    const tokenId = await HederaTokenService.createNFTCollection({
      name,
      symbol,
      royaltyFee: {
        numerator: royaltyPercentage,
        denominator: 100,
        fallbackFee: 1, // 1 HBAR fallback
      },
    });

    console.log(`✅ Dataset NFT Collection created: ${tokenId.toString()}`);
    return tokenId;
  }

  /**
   * Mint a new dataset NFT
   */
  static async mintDatasetNFT(
    tokenId: TokenId,
    params: MintDatasetNFTParams,
    supplyKey: PrivateKey,
    metadataTopicId?: TopicId
  ): Promise<{
    txId: string;
    serialNumber: number;
    metadata: DatasetNFTMetadata;
  }> {
    const {
      name,
      description,
      category,
      ipfsCID,
      size,
      format,
      aiModel,
      aiProvider,
      generationParams,
      schema,
      price,
      currency = 'HBAR',
      royaltyPercentage = 5,
    } = params;

    // Create metadata
    const metadata: DatasetNFTMetadata = {
      name,
      description,
      category,
      schema,
      generation: {
        model: aiModel,
        provider: aiProvider,
        timestamp: Date.now(),
        parameters: generationParams,
      },
      storage: {
        ipfsCID,
        size,
        format,
      },
      quality: {
        verificationScore: 0,
        verifiers: [],
        verificationDate: 0,
      },
      pricing: {
        price,
        currency,
        royaltyPercentage,
      },
    };

    // Convert metadata to JSON string for NFT
    const metadataJson = JSON.stringify(metadata);

    // Mint the NFT
    const result = await HederaTokenService.mintNFT({
      tokenId,
      metadata: metadataJson,
      supplyKey,
    });

    console.log(`✅ Minted Dataset NFT: ${tokenId.toString()} #${result.serialNumber}`);
    console.log(`   Name: ${name}`);
    console.log(`   IPFS CID: ${ipfsCID}`);
    console.log(`   AI Model: ${aiModel}`);

    // Publish metadata to HCS if topic provided
    if (metadataTopicId) {
      const hcsMessage: DatasetMetadataMessage = {
        version: '1.0',
        type: 'dataset.created',
        timestamp: Date.now(),
        datasetId: `${tokenId.toString()}-${result.serialNumber}`,
        nftTokenId: tokenId.toString(),
        nftSerialNumber: result.serialNumber,
        creator: supplyKey.publicKey.toStringDer(),
        metadata: {
          name,
          description,
          category,
          ipfsCID,
          size,
          format,
          aiModel,
          aiProvider,
        },
        signature: '', // TODO: Implement signature
      };

      await FiletheticHCS.publishDatasetMetadata(metadataTopicId, hcsMessage);
      console.log(`✅ Published metadata to HCS topic: ${metadataTopicId.toString()}`);
    }

    return {
      txId: result.txId,
      serialNumber: result.serialNumber,
      metadata,
    };
  }

  /**
   * Transfer dataset NFT
   */
  static async transferDatasetNFT(
    tokenId: TokenId,
    serialNumber: number,
    fromAccountId: AccountId,
    toAccountId: AccountId,
    fromPrivateKey: PrivateKey
  ): Promise<string> {
    const txId = await HederaTokenService.transferNFT({
      tokenId,
      serialNumber,
      fromAccountId,
      toAccountId,
      fromPrivateKey,
    });

    console.log(`✅ Transferred Dataset NFT ${tokenId.toString()} #${serialNumber}`);
    console.log(`   From: ${fromAccountId.toString()}`);
    console.log(`   To: ${toAccountId.toString()}`);

    return txId;
  }

  /**
   * Get dataset NFT metadata
   */
  static parseMetadata(metadataBuffer: Buffer): DatasetNFTMetadata {
    try {
      const metadataString = metadataBuffer.toString('utf-8');
      return JSON.parse(metadataString) as DatasetNFTMetadata;
    } catch (error) {
      throw new Error(`Failed to parse dataset NFT metadata: ${error}`);
    }
  }

  /**
   * Create metadata for IPFS storage
   */
  static createIPFSMetadata(metadata: DatasetNFTMetadata): string {
    return JSON.stringify(metadata, null, 2);
  }
}

/**
 * Helper function to create a complete dataset with NFT
 */
export async function createDatasetWithNFT(
  collectionTokenId: TokenId,
  params: MintDatasetNFTParams,
  supplyKey: PrivateKey,
  metadataTopicId?: TopicId
): Promise<{
  nftTokenId: TokenId;
  serialNumber: number;
  metadata: DatasetNFTMetadata;
  txId: string;
}> {
  const result = await DatasetNFTService.mintDatasetNFT(
    collectionTokenId,
    params,
    supplyKey,
    metadataTopicId
  );

  return {
    nftTokenId: collectionTokenId,
    serialNumber: result.serialNumber,
    metadata: result.metadata,
    txId: result.txId,
  };
}
