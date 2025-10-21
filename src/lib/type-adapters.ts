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
    size: legacy.numRows * 1000, // Estimate size
    numRows: legacy.numRows,
    numColumns: 0, // Not available in legacy format
    tokenCount: legacy.numTokens,
    model: legacy.modelName,
    downloads: legacy.numDownloads,
    createdAt: new Date(),
    price: parseFloat(legacy.price),
    isVerified: legacy.isVerified || false,
    categories: [],
    isPrivate: !legacy.isPublic,
    metadata: {
      ipfsHash: legacy.cid,
      isVerified: legacy.isVerified || false,
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
    version: 1,
    owner: modern.owner,
    name: modern.name,
    description: modern.description || "",
    price: modern.price?.toString() || "0",
    isPublic: !modern.isPrivate,
    cid: modern.metadata?.ipfsHash || "",
    numRows: modern.numRows || 0,
    numTokens: modern.tokenCount || 0,
    modelName: modern.model || "",
    taskId: 0,
    nodeId: 0,
    computeUnitsPrice: 0,
    maxComputeUnits: 0,
    numDownloads: modern.downloads || 0,
    isVerified: modern.isVerified,
    verificationTimestamp: modern.metadata?.verificationTimestamp,
    verifier: modern.metadata?.verifier
  };
}
