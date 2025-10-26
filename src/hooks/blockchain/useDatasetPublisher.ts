'use client';

import { useState } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { toast } from 'sonner';
import { createDataset, lockDataset } from '@/lib/hedera';

interface UseDatasetPublisherProps {
  name: string;
  description: string;
  price: string;
  visibility: 'public' | 'private';
  modelId: string;
  generatedData: unknown[] | null;
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

      const result = await createDataset(
        props.name,
        props.description,
        props.commp, // IPFS hash/CID
        parseFloat(props.price),
        props.modelId, // category
        [props.visibility] // tags
      );

      if (result.success && result.tokenId && result.serialNumber) {
        toast.info(`Dataset created with Token ID: ${result.tokenId}, Serial: ${result.serialNumber}. Locking...`);
        
        const lockResult = await lockDataset(
          result.tokenId,
          result.serialNumber
        );
        
        if (!lockResult.success) {
          throw new Error(lockResult.error || 'Failed to lock dataset');
        }
        toast.success('Dataset published and locked successfully!');
        if (props.onSuccess) {
          props.onSuccess();
        }
      } else {
        throw new Error(result.error || "Failed to create dataset on-chain.");
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
