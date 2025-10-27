'use client';

import { useState, useEffect } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { getAllProviders, getProviderNetworkStats, Provider as HederaProvider } from '@/lib/hedera';
import { UIProvider, NetworkStats } from '@/types/provider';

export function useStorageProviders() {
  const [providers, setProviders] = useState<UIProvider[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useHederaWallet();

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Fetching providers from Hedera blockchain...');
      console.log('📍 Contract ID:', 'PROVIDER_REGISTRY_CONTRACT_ID from constants');

      // Fetch providers from Hedera blockchain
      const hederaProviders = await getAllProviders();
      
      console.log(`✅ Fetched ${hederaProviders.length} providers:`, hederaProviders);

      if (hederaProviders.length === 0) {
        console.warn('⚠️ No providers found. This could mean:');
        console.warn('  1. No providers have registered yet');
        console.warn('  2. The contract has no ProviderRegistered events');
        console.warn('  3. The Mirror Node API is not returning data');
      }

      // Transform Hedera provider format to UI format
      const transformedProviders: UIProvider[] = hederaProviders.map((p: HederaProvider) => {
        console.log(`🔄 Transforming provider ${p.providerId}:`, p);
        
        // Extract location from name (format: "Provider-{location}")
        const location = p.name.startsWith('Provider-') 
          ? p.name.substring(9) // Remove "Provider-" prefix
          : p.name || 'Unknown';
        
        return {
          id: `${p.owner}-${p.providerId}`, // Unique identifier
          provider: p.owner,
          stakedAmount: p.stakedAmount,
          bandwidthMbps: 100, // Default values - could be stored in contract metadata
          storageTB: 10,
          uptime: p.uptime / 100, // Convert from basis points to percentage
          ipfsGateway: p.endpoint || 'https://ipfs.io',
          location: location,
          isActive: p.isActive,
          registeredAt: p.registeredAt,
          totalEarnings: p.totalRewards,
          datasetsHosted: p.totalJobs,
        };
      });

      console.log(`✅ Transformed ${transformedProviders.length} providers for UI`);
      setProviders(transformedProviders);

      // Fetch network stats
      console.log('📊 Calculating network stats...');
      const stats = await getProviderNetworkStats();
      
      const networkStatsData: NetworkStats = {
        totalProviders: stats.totalProviders,
        activeProviders: stats.activeProviders,
        networkBandwidth: transformedProviders.reduce((sum, p) => sum + (p.bandwidthMbps || 0), 0),
        networkStorage: transformedProviders.reduce((sum, p) => sum + (p.storageTB || 0), 0),
      };

      setNetworkStats(networkStatsData);

      console.log('✅ Network stats calculated:', networkStatsData);

    } catch (err) {
      console.error('❌ Error fetching providers:', err);
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
  }, [isConnected]);

  return {
    providers,
    networkStats,
    isLoading,
    error,
    refetch: fetchProviders,
  };
}
