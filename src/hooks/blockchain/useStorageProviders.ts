'use client';

import { useState, useEffect } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import u2uTestnetDeployment from '@/deployments/u2uTestnet.json';
import u2uMainnetDeployment from '@/deployments/u2uMainnet.json';
import localhostDeployment from '@/deployments/localhost.json';
import { STORAGE_NETWORK_ABI } from '@/contracts/FiletheticStorageNetworkABI';

interface Provider {
  provider: string;
  stakedAmount?: bigint;
  bandwidthMbps?: bigint;
  storageTB?: bigint;
  uptime?: bigint;
  ipfsGateway?: string;
  location?: string;
  isActive: boolean;
  registeredAt?: bigint;
  totalEarnings?: bigint;
  datasetsHosted?: bigint;
}

interface NetworkStats {
  totalProviders: number;
  activeProviders: number;
  networkBandwidth: number;
  networkStorage: number;
}


export function useStorageProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const fetchProviders = async () => {
    if (!publicClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get deployment info based on chain ID
      const deploymentMap: Record<number, any> = {
        2484: u2uTestnetDeployment,
        39: u2uMainnetDeployment,
        31337: localhostDeployment,
      };

      const deployment = deploymentMap[chainId] || u2uTestnetDeployment;

      if (!deployment.filetheticStorageNetwork) {
        console.log('Storage network not deployed yet');
        setProviders([]);
        setNetworkStats({
          totalProviders: 0,
          activeProviders: 0,
          networkBandwidth: 0,
          networkStorage: 0
        });
        setIsLoading(false);
        return;
      }

      const contractAddress = deployment.filetheticStorageNetwork as `0x${string}`;

      // Get provider count
      const providerCount = await publicClient.readContract({
        address: contractAddress,
        abi: STORAGE_NETWORK_ABI,
        functionName: 'getProviderCount',
      }) as bigint;

      console.log('Provider count:', providerCount.toString());

      // Fetch all providers
      const providerPromises = [];
      for (let i = 0; i < Number(providerCount); i++) {
        providerPromises.push(
          publicClient.readContract({
            address: contractAddress,
            abi: STORAGE_NETWORK_ABI,
            functionName: 'getProviderByIndex',
            args: [BigInt(i)],
          })
        );
      }

      const providersData = await Promise.all(providerPromises);
      
      const formattedProviders = providersData
        .map((data: any) => {
          // Handle both array and object responses from the contract
          const isArray = Array.isArray(data);
          return {
            provider: isArray ? data[0] : data.provider,
            stakedAmount: isArray ? data[1] : data.stakedAmount,
            bandwidthMbps: isArray ? data[2] : data.bandwidthMbps,
            storageTB: isArray ? data[3] : data.storageTB,
            uptime: isArray ? data[4] : data.uptime,
            ipfsGateway: isArray ? data[5] : data.ipfsGateway,
            location: isArray ? data[6] : data.location,
            isActive: isArray ? data[7] : data.isActive,
            registeredAt: isArray ? data[8] : data.registeredAt,
            totalEarnings: isArray ? data[9] : data.totalEarnings,
            datasetsHosted: isArray ? data[10] : data.datasetsHosted,
          };
        })
        .filter(p => p.provider); // Filter out any invalid providers

      setProviders(formattedProviders);

      // Get network stats
      const stats = await publicClient.readContract({
        address: contractAddress,
        abi: STORAGE_NETWORK_ABI,
        functionName: 'getNetworkStats',
      }) as [bigint, bigint, bigint, bigint];

      setNetworkStats({
        totalProviders: Number(stats[0]),
        activeProviders: Number(stats[1]),
        networkBandwidth: Number(stats[2]),
        networkStorage: Number(stats[3]),
      });

    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError(err.message || 'Failed to fetch providers');
      setProviders([]);
      setNetworkStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, chainId]);

  return {
    providers,
    networkStats,
    isLoading,
    error,
    refetch: fetchProviders,
  };
}
