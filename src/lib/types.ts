/**
 * Type definitions for the FileThetic application
 */

// Hedera-native Dataset type
export interface Dataset {
  id: number; // Serial number of the NFT
  tokenId?: string; // Hedera token ID (e.g., "0.0.7158235")
  name: string;
  description: string;
  ipfsHash?: string; // IPFS CID for dataset content
  cid?: string; // Alias for ipfsHash
  price: string | number; // Price in FTUSD
  category?: string;
  tags?: string[];
  creator?: string; // Hedera account ID of creator
  owner: string; // Current owner (Hedera account ID)
  createdAt?: string;
  locked?: boolean; // Whether dataset is finalized
  verified?: boolean;
  purchaseCount?: number;
  
  // Legacy EVM fields (deprecated but kept for compatibility)
  version?: number;
  isPublic?: boolean;
  numRows?: number;
  numTokens?: number;
  modelName?: string;
  taskId?: number;
  nodeId?: number;
  computeUnitsPrice?: number;
  maxComputeUnits?: number;
  numDownloads?: number;
  verificationTimestamp?: number;
  verifier?: string;
}

export interface VerificationInfo {
  isVerified: boolean;
  verificationCount: number;
  averageScore: number;
  verifiers: string[];
  verifiedAt?: number; // Legacy field
  verifier?: string; // Legacy field
  datasetHash?: string; // Legacy field
}

export type HFDataset = {
  path: string;
  config: string;
  split: string;
  features: string[];
}

export type GenerationConfig = {
  model: string;
  inputFeature: string;
  maxTokens: number;
  prompt: string;
  jsonSchema?: any;
}

export interface DatasetSortOptions {
  field: 'name' | 'price' | 'numRows' | 'numTokens' | 'numDownloads' | 'timestamp';
  direction: 'asc' | 'desc';
}

export interface DatasetFilterOptions {
  verified?: boolean;
  minPrice?: number;
  maxPrice?: number;
  ownedOnly?: boolean;
  searchTerm?: string;
  taskId?: number;
  modelName?: string;
}

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
  cid?: string;
}

export interface Web3ProviderState {
  account: string | null;
  chainId: number;
  isConnecting: boolean;
  error: Error | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

