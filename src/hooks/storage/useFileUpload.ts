'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useHederaWallet } from "@/contexts/HederaWalletContext";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  cid?: string;
  commp?: string;
};

/**
 * Simplified file upload hook (stub for compatibility)
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const { accountId: address } = useHederaWallet();

  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async (file: File) => {
      if (!address) throw new Error("Please connect your wallet");
      
      setStatus("Uploading file...");
      setProgress(50);
      
      // TODO: Implement IPFS file upload
      console.log("File upload not yet implemented:", file.name);
      
      const info: UploadedInfo = {
        fileName: file.name,
        fileSize: file.size,
        cid: "placeholder-cid",
        commp: "placeholder-cid",
      };
      
      setUploadedInfo(info);
      setProgress(100);
      return info;
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    status,
    uploadedInfo,
    handleReset,
  };
};
