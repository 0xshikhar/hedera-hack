'use client';

import { useState, useEffect } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { createDataset, lockDataset } from '@/lib/hedera';
import { GenerationResult } from '@/lib/models';

interface UseDatasetPublisherProps {
  name: string;
  description: string;
  price: string;
  visibility: 'public' | 'private';
  modelId: string;
  generatedData: any[] | null;
  totalTokens?: number;
  commp: string | null;
  onSuccess?: () => void;
}

export function useDatasetPublisher() {
  const { accountId: address } = useHederaWallet();
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (props: UseDatasetPublisherProps) => {
    if (!props.commp || !address || !props.generatedData) {
      return;
    }

    setIsPublishing(true);
    toast.info("Publishing dataset to the blockchain...");

    try {
      // Debug logs to track parameters
      console.log('Publishing dataset with parameters:', {
        name: props.name,
        description: props.description,
        price: props.price,
        isPublic: props.visibility !== 'private',
        modelId: props.modelId,
        taskId: 1,
        nodeId: 1,
        computeUnitsPrice: 100,
        maxComputeUnits: 1000000
      });

      const { datasetId } = await createDataset(
        props.name,
        props.description,
        props.price, // Pass price as-is, will be parsed in createDataset
        props.visibility !== 'private',
        props.modelId,
        1, // taskId (default)
        1, // nodeId (default)
        100, // computeUnitsPrice (default)
        1000000 // maxComputeUnits (default)
      );

      if (datasetId) {
        toast.info(`Dataset created with ID: ${datasetId}. Locking with IPFS CID...`);
        // Use provided totalTokens or default to 0 if not available
        const totalTokens = props.totalTokens || 0;
        await lockDataset(
          datasetId,
          props.commp,
          props.generatedData.length,
          totalTokens
        );
        toast.success('Dataset published and locked successfully!');
        if (props.onSuccess) {
          props.onSuccess();
        }
      } else {
        throw new Error("Failed to create dataset on-chain.");
      }
    } catch (error) {
      console.error('Error publishing dataset:', error);
      toast.error(`Failed to publish dataset: ${(error as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return { isPublishing, publish };
}
