'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/storage/useConfetti";
import { useAccount } from "wagmi";
import { storeDataset } from "@/lib/ipfs";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  cid?: string;
  commp?: string; // For compatibility
};

/**
 * Simplified hook to upload data to IPFS (no Synapse SDK)
 * Optimized for U2U blockchain - direct IPFS upload
 */
export const useDataUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);

  const { triggerConfetti } = useConfetti();
  const { address, chainId } = useAccount();

  const mutation = useMutation({
    mutationKey: ["data-upload", address, chainId],
    mutationFn: async (data: any) => {
      if (!address) throw new Error("Please connect your wallet");
      
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Preparing dataset for upload...");

      // Create metadata
      const metadata = {
        name: data.name || 'dataset',
        timestamp: Date.now(),
        creator: address,
        chainId: chainId || 0,
      };

      setStatus("📤 Uploading to IPFS via Pinata...");
      setProgress(30);

      // Direct IPFS upload via Pinata
      const cid = await storeDataset(data, metadata);

      setProgress(80);
      setStatus("✅ Dataset uploaded to IPFS successfully!");

      const fileSize = JSON.stringify(data).length;
      
      setUploadedInfo({
        fileName: 'dataset.json',
        fileSize,
        cid,
        commp: cid, // Use CID as commp for compatibility
      });

      setProgress(100);
      return { cid, fileSize };
    },
    onSuccess: () => {
      setStatus("🎉 Dataset successfully uploaded!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
    mutation.reset();
  };

  return {
    uploadDataMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    resetUpload: handleReset, // Alias for compatibility
    status,
  };
};
