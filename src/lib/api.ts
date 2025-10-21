/**
 * API module for dataset operations
 * Provides functions to interact with datasets on Hedera
 */

import { Dataset } from "@/types/dataset";
import { mockDatasets } from "@/lib/mock-data";

/**
 * Get a dataset by its ID
 * @param id Dataset ID
 * @returns Dataset or null if not found
 */
export async function getDatasetById(id: string): Promise<Dataset | null> {
  try {
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find dataset in mock data
    const dataset = mockDatasets.find(ds => ds.id === id);
    
    if (!dataset) {
      console.warn(`Dataset with ID ${id} not found`);
      return null;
    }
    
    return dataset;
  } catch (error) {
    console.error("Error fetching dataset by ID:", error);
    throw error;
  }
}

/**
 * Get all datasets
 * @returns Array of datasets
 */
export async function getAllDatasets(): Promise<Dataset[]> {
  try {
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockDatasets;
  } catch (error) {
    console.error("Error fetching all datasets:", error);
    return [];
  }
}

/**
 * Create a new dataset
 * @param dataset Dataset to create
 * @returns Created dataset
 */
export async function createDataset(dataset: Partial<Dataset>): Promise<Dataset> {
  try {
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDataset: Dataset = {
      id: `dataset_${Date.now()}`,
      name: dataset.name || "Untitled Dataset",
      description: dataset.description || "",
      owner: dataset.owner || "0x0",
      size: dataset.size || 0,
      numRows: dataset.numRows || 0,
      numColumns: dataset.numColumns || 0,
      tokenCount: dataset.tokenCount || 0,
      model: dataset.model,
      downloads: 0,
      createdAt: new Date(),
      price: dataset.price || 0,
      isVerified: false,
      categories: dataset.categories || [],
      isPrivate: dataset.isPrivate || false,
      metadata: dataset.metadata
    };
    
    return newDataset;
  } catch (error) {
    console.error("Error creating dataset:", error);
    throw error;
  }
}

/**
 * Update a dataset
 * @param id Dataset ID
 * @param updates Updates to apply
 * @returns Updated dataset
 */
export async function updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset> {
  try {
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dataset = await getDatasetById(id);
    
    if (!dataset) {
      throw new Error(`Dataset with ID ${id} not found`);
    }
    
    const updatedDataset = {
      ...dataset,
      ...updates
    };
    
    return updatedDataset;
  } catch (error) {
    console.error("Error updating dataset:", error);
    throw error;
  }
}

/**
 * Delete a dataset
 * @param id Dataset ID
 * @returns Success status
 */
export async function deleteDataset(id: string): Promise<boolean> {
  try {
    // Mock delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dataset = await getDatasetById(id);
    
    if (!dataset) {
      throw new Error(`Dataset with ID ${id} not found`);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting dataset:", error);
    throw error;
  }
}
