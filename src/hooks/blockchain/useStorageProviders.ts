'use client';

import { useState, useEffect } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';

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
  
  const { isConnected } = useHederaWallet();

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement Hedera smart contract call to ProviderRegistry
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock providers data
      const mockProviders: Provider[] = [
        {
          provider: '0.0.12345',
          stakedAmount: BigInt(1000),
          bandwidthMbps: BigInt(100),
          storageTB: BigInt(5),
          uptime: BigInt(9900), // 99%
          ipfsGateway: 'https://ipfs-gateway-1.example.com',
          location: 'Singapore',
          isActive: true,
          registeredAt: BigInt(Date.now() - 30 * 24 * 60 * 60 * 1000),
          totalEarnings: BigInt(500),
          datasetsHosted: BigInt(25),
        },
        {
          provider: '0.0.12346',
          stakedAmount: BigInt(2000),
          bandwidthMbps: BigInt(200),
          storageTB: BigInt(10),
          uptime: BigInt(9950), // 99.5%
          ipfsGateway: 'https://ipfs-gateway-2.example.com',
          location: 'USA',
          isActive: true,
          registeredAt: BigInt(Date.now() - 60 * 24 * 60 * 60 * 1000),
          totalEarnings: BigInt(1200),
          datasetsHosted: BigInt(50),
        },
        {
          provider: '0.0.12347',
          stakedAmount: BigInt(1500),
          bandwidthMbps: BigInt(150),
          storageTB: BigInt(8),
          uptime: BigInt(9800), // 98%
          ipfsGateway: 'https://ipfs-gateway-3.example.com',
          location: 'Germany',
          isActive: true,
          registeredAt: BigInt(Date.now() - 45 * 24 * 60 * 60 * 1000),
          totalEarnings: BigInt(800),
          datasetsHosted: BigInt(35),
        },
      ];

      setProviders(mockProviders);

      // Mock network stats
      const mockStats: NetworkStats = {
        totalProviders: mockProviders.length,
        activeProviders: mockProviders.filter(p => p.isActive).length,
        networkBandwidth: mockProviders.reduce((sum, p) => sum + Number(p.bandwidthMbps || 0), 0),
        networkStorage: mockProviders.reduce((sum, p) => sum + Number(p.storageTB || 0), 0),
      };

      setNetworkStats(mockStats);

    } catch (err) {
      console.error('Error fetching providers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch providers';
      setError(errorMessage);
      setProviders([]);
      setNetworkStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return {
    providers,
    networkStats,
    isLoading,
    error,
    refetch: fetchProviders,
  };
}
