'use client';

import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import u2uTestnetDeployment from '@/deployments/u2uTestnet.json';
import u2uMainnetDeployment from '@/deployments/u2uMainnet.json';
import localhostDeployment from '@/deployments/localhost.json';
import FilethethicVerifierABI from '@/abi/FilethethicVerifier.json';

export interface VerificationInfo {
  isVerified: boolean;
  verifier: string;
  verifiedAt: bigint;
  datasetHash: string;
}

export function useVerifierContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const getContractAddress = () => {
    const deploymentMap: Record<number, any> = {
      2484: u2uTestnetDeployment,
      39: u2uMainnetDeployment,
      31337: localhostDeployment,
    };

    const deployment = deploymentMap[chainId] || u2uTestnetDeployment;
    return deployment.filethethicVerifier as `0x${string}`;
  };

  const verifyDataset = async (
    datasetId: number,
    datasetHash: string,
    signature: string,
    signerAddress: string
  ) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getContractAddress();
    
    // Convert hex string to bytes32
    const hashBytes32 = datasetHash.startsWith('0x') ? datasetHash : `0x${datasetHash}`;
    
    // Convert signature to bytes
    const signatureBytes = signature.startsWith('0x') ? signature : `0x${signature}`;
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: FilethethicVerifierABI.abi,
      functionName: 'verifyDataset',
      args: [BigInt(datasetId), hashBytes32 as `0x${string}`, signatureBytes as `0x${string}`, signerAddress as `0x${string}`],
    });

    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash });
    }

    return hash;
  };

  const getDatasetVerificationInfo = async (datasetId: number): Promise<VerificationInfo> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const contractAddress = getContractAddress();
    
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: FilethethicVerifierABI.abi,
      functionName: 'getVerificationInfo',
      args: [BigInt(datasetId)],
    }) as any;

    return {
      isVerified: result[0],
      verifier: result[1],
      verifiedAt: result[2],
      datasetHash: result[3],
    };
  };

  const isDatasetVerified = async (datasetId: number): Promise<boolean> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const contractAddress = getContractAddress();
    
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: FilethethicVerifierABI.abi,
      functionName: 'isVerified',
      args: [BigInt(datasetId)],
    }) as boolean;

    return result;
  };

  return {
    verifyDataset,
    getDatasetVerificationInfo,
    isDatasetVerified,
  };
}
