'use client';

import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { parseAbi } from 'viem';
import u2uTestnetDeployment from '@/deployments/u2uTestnet.json';
import u2uMainnetDeployment from '@/deployments/u2uMainnet.json';
import localhostDeployment from '@/deployments/localhost.json';
import FiletheticABI from '@/abi/Filethetic.json';

export interface Dataset {
  id: bigint;
  version: bigint;
  owner: string;
  name: string;
  description: string;
  price: bigint;
  isPublic: boolean;
  cid: string;
  numRows: bigint;
  numTokens: bigint;
  modelName: string;
  taskId: bigint;
  nodeId: bigint;
  computeUnitsPrice: bigint;
  maxComputeUnits: bigint;
  numDownloads: bigint;
}

export function useDatasetContract() {
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
    return deployment.filethetic as `0x${string}`;
  };

  const getDataset = async (datasetId: number): Promise<Dataset> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const contractAddress = getContractAddress();
    
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: FiletheticABI.abi,
      functionName: 'getDataset',
      args: [BigInt(datasetId)],
    }) as any;

    return {
      id: result[0],
      version: result[1],
      owner: result[2],
      name: result[3],
      description: result[4],
      price: result[5],
      isPublic: result[6],
      cid: result[7],
      numRows: result[8],
      numTokens: result[9],
      modelName: result[10],
      taskId: result[11],
      nodeId: result[12],
      computeUnitsPrice: result[13],
      maxComputeUnits: result[14],
      numDownloads: result[15],
    };
  };

  const getAllDatasets = async (): Promise<Dataset[]> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const contractAddress = getContractAddress();
    
    const count = await publicClient.readContract({
      address: contractAddress,
      abi: FiletheticABI.abi,
      functionName: 'getDatasetCount',
    }) as bigint;

    const datasets: Dataset[] = [];
    for (let i = 0; i < Number(count); i++) {
      try {
        const dataset = await getDataset(i);
        datasets.push(dataset);
      } catch (error) {
        console.error(`Error fetching dataset ${i}:`, error);
      }
    }

    return datasets;
  };

  const createDataset = async (
    name: string,
    description: string,
    price: bigint,
    isPublic: boolean,
    cid: string,
    numRows: bigint,
    numTokens: bigint,
    modelName: string
  ) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getContractAddress();
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: FiletheticABI.abi,
      functionName: 'createDataset',
      args: [name, description, price, isPublic, cid, numRows, numTokens, modelName],
    });

    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash });
    }

    return hash;
  };

  const lockDataset = async (datasetId: number) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getContractAddress();
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: FiletheticABI.abi,
      functionName: 'lockDataset',
      args: [BigInt(datasetId)],
    });

    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash });
    }

    return hash;
  };

  return {
    getDataset,
    getAllDatasets,
    createDataset,
    lockDataset,
  };
}
