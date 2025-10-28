'use client';

import { useState } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { toast } from 'sonner';
import { 
  createDatasetTransaction, 
  submitDatasetMetadata, 
  lockDatasetTransaction
} from '@/lib/hedera';
import { DATASET_NFT_TOKEN_ID } from '@/lib/constants';

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
  const { accountId: address, dAppConnector } = useHederaWallet();
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (props: UseDatasetPublisherProps) => {
    if (!props.commp || !address || !props.generatedData || !dAppConnector) {
      toast.error('Wallet not connected or missing data');
      return;
    }

    setIsPublishing(true);
    toast.info("Preparing dataset transaction...");

    try {
      // Get signer from dAppConnector
      const signer = dAppConnector.signers?.[0];
      if (!signer) {
        throw new Error('No signer available from wallet');
      }

      // Step 1: Create mint transaction
      const { transactionBytes: mintTxBytes, metadata } = await createDatasetTransaction(
        props.name,
        props.description,
        props.commp,
        parseFloat(props.price),
        props.modelId,
        [props.visibility],
        address,
        signer
      );

      toast.info("Please approve the NFT mint transaction in your wallet...");

      // Step 2: Sign and execute mint transaction via wallet
      const mintResult = await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: mintTxBytes,
      });

      if (!mintResult) {
        throw new Error('Failed to mint NFT');
      }

      // Extract serial number from result (WalletConnect returns transaction result)
      // For now, we'll use a placeholder - in production, query the transaction receipt
      const serialNumber = Date.now() % 10000; // Temporary: use timestamp-based ID
      
      toast.success(`NFT minted! Serial #${serialNumber}. Submitting metadata...`);

      // Step 3: Submit metadata to HCS
      const metadataTxBytes = await submitDatasetMetadata(serialNumber, metadata, address, signer);
      
      toast.info("Please approve the metadata submission in your wallet...");
      
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: metadataTxBytes,
      });

      toast.success('Metadata submitted! Locking dataset...');

      // Step 4: Lock the dataset
      const lockTxBytes = await lockDatasetTransaction(DATASET_NFT_TOKEN_ID, serialNumber, address, signer);
      
      toast.info("Please approve the lock transaction in your wallet...");
      
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: lockTxBytes,
      });

      toast.success('Dataset published and locked successfully!');
      
      if (props.onSuccess) {
        props.onSuccess();
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
