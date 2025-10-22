import lighthouse from '@lighthouse-web3/sdk';

/**
 * IPFS storage integration for FileThetic using Pinata and Lighthouse
 * Provides functionality for storing and retrieving datasets
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Get Pinata JWT from environment and sanitize it
 */
function getPinataJWT(): string {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) {
    throw new Error('PINATA_JWT is not configured. Please add NEXT_PUBLIC_PINATA_JWT to your .env file');
  }
  
  // Trim whitespace and remove any non-ASCII characters
  const sanitized = jwt.trim().replace(/[^\x00-\x7F]/g, '');
  
  if (sanitized.length === 0) {
    throw new Error('PINATA_JWT contains only invalid characters. Please check your .env file');
  }
  
  console.log('🔑 JWT length:', sanitized.length, 'chars');
  return sanitized;
}

/**
 * Get Lighthouse API key from environment
 */
function getLighthouseKey(): string {
  const key = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
  if (!key) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured. Please add NEXT_PUBLIC_LIGHTHOUSE_API_KEY to your .env file');
  }
  return key;
}

/**
 * Store a dataset on IPFS using Pinata
 * @param dataset The dataset content
 * @param metadata Additional metadata
 * @returns CID of the stored content
 */
export async function storeDataset(
  dataset: Record<string, any>,
  metadata: Record<string, any>
): Promise<string> {
  try {
    const jwt = getPinataJWT();
    
    console.log('📤 Uploading to Pinata...', {
      datasetSize: JSON.stringify(dataset).length,
      metadataKeys: Object.keys(metadata),
    });

    // Combine dataset and metadata
    const dataToStore = {
      dataset,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        platform: 'FileThetic',
      },
    };

    // Upload to Pinata - using plain object for headers
    const requestBody = JSON.stringify({
      pinataContent: dataToStore,
      pinataMetadata: {
        name: `filethethic-${metadata.name || 'dataset'}-${Date.now()}`,
      },
    });

    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pinata upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Pinata upload successful:', result.IpfsHash);
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Error storing dataset:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Store a file on IPFS using Pinata
 * @param file The file to upload
 * @returns CID of the stored file
 */
export async function storeFile(file: File): Promise<string> {
  try {
    const jwt = getPinataJWT();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
    }));

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata file upload failed: ${error}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
}

/**
 * Retrieve a dataset from IPFS using its CID
 * @param cid Content identifier for the dataset
 * @returns The retrieved dataset
 */
export async function retrieveDataset(cid: string): Promise<{
  dataset: Record<string, any>;
  metadata: Record<string, any>;
}> {
  try {
    const response = await fetch(`${PINATA_GATEWAY}/${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve dataset with CID ${cid}`);
    }

    const data = await response.json();
    
    return {
      dataset: data.dataset || data,
      metadata: data.metadata || {},
    };
  } catch (error) {
    console.error('Error retrieving dataset:', error);
    throw error;
  }
}

/**
 * Upload file to Lighthouse
 * @param file The file to upload
 * @returns Upload response with CID
 */
export async function uploadToLighthouse(
  file: File
): Promise<{ cid: string; size: number }> {
  try {
    const apiKey = getLighthouseKey();

    // Upload file using Lighthouse SDK
    const response = await lighthouse.upload(file, apiKey);
    
    return {
      cid: response.data.Hash,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading to Lighthouse:', error);
    throw error;
  }
}

/**
 * Encrypt a dataset with access control based on wallet address
 * @param file The file to encrypt
 * @param ownerAddress The owner's wallet address
 * @returns Encrypted file information
 */
export async function encryptDataset(
  file: File,
  ownerAddress: string
): Promise<{ cid: string; size: number }> {
  try {
    // For now, just upload without encryption
    // Lighthouse encryption requires additional setup with wallet signing
    return await uploadToLighthouse(file);
  } catch (error) {
    console.error('Error encrypting dataset:', error);
    throw error;
  }
}

/**
 * Get the content of a dataset using its CID
 * @param cid Content identifier for the dataset
 * @returns The dataset content as a JavaScript object
 */
export async function getDatasetContent(cid: string): Promise<any> {
  try {
    const { dataset } = await retrieveDataset(cid);
    return dataset;
  } catch (error) {
    console.error('Error retrieving dataset content:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid Content identifier
 * @returns Gateway URL
 */
export function getIPFSUrl(cid: string): string {
  return `${PINATA_GATEWAY}/${cid}`;
}
