/**
 * Type adapters for converting between legacy and modern dataset formats
 */

import { Dataset as LegacyDataset } from "@/lib/types";
import { Dataset as ModernDataset } from "@/types/dataset";

/**
 * Convert legacy dataset format to modern format
 * @param legacy Legacy dataset
 * @returns Modern dataset
 */
export function legacyToModernDataset(legacy: LegacyDataset): ModernDataset {
  return {
    id: legacy.id.toString(),
    name: legacy.name,
    description: legacy.description,
    owner: legacy.owner,
    size: (legacy.numRows || 0) * 1000, // Estimate size
    numRows: legacy.numRows,
    numColumns: 0, // Not available in legacy format
    tokenCount: legacy.numTokens,
    model: legacy.modelName,
    downloads: legacy.numDownloads,
    createdAt: legacy.createdAt ? new Date(legacy.createdAt) : new Date(),
    price: typeof legacy.price === 'string' ? parseFloat(legacy.price) : legacy.price,
    verified: legacy.verified,
    isVerified: legacy.verified,
    categories: legacy.tags || [],
    isPrivate: legacy.isPublic === false,
    ipfsHash: legacy.ipfsHash || legacy.cid,
    cid: legacy.cid || legacy.ipfsHash,
    tokenId: legacy.tokenId,
    locked: legacy.locked,
    purchaseCount: legacy.purchaseCount,
    verifier: legacy.verifier,
    metadata: {
      ipfsHash: legacy.ipfsHash || legacy.cid,
      isVerified: legacy.verified || false,
      verifier: legacy.verifier,
      name: legacy.name,
      description: legacy.description,
      isPublic: legacy.isPublic
    }
  };
}

/**
 * Convert modern dataset format to legacy format
 * @param modern Modern dataset
 * @returns Legacy dataset
 */
export function modernToLegacyDataset(modern: ModernDataset): LegacyDataset {
  return {
    id: parseInt(modern.id) || 0,
    tokenId: modern.tokenId,
    name: modern.name,
    description: modern.description || "",
    price: modern.price !== undefined ? modern.price.toString() : "0",
    owner: modern.owner,
    ipfsHash: modern.ipfsHash || modern.cid,
    cid: modern.cid || modern.ipfsHash,
    category: modern.categories?.[0],
    tags: modern.categories,
    creator: modern.owner,
    createdAt: typeof modern.createdAt === 'string' ? modern.createdAt : modern.createdAt?.toISOString(),
    locked: modern.locked,
    verified: modern.verified || modern.isVerified,
    purchaseCount: modern.purchaseCount,
    version: 1,
    isPublic: !modern.isPrivate,
    numRows: modern.numRows,
    numTokens: modern.tokenCount,
    modelName: modern.model,
    taskId: 0,
    nodeId: 0,
    computeUnitsPrice: 0,
    maxComputeUnits: 0,
    numDownloads: modern.downloads,
    verificationTimestamp: typeof modern.createdAt === 'string' 
      ? new Date(modern.createdAt).getTime() 
      : modern.createdAt?.getTime(),
    verifier: modern.verifier
  };
}
