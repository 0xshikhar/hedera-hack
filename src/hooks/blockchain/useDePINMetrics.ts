'use client';

import { useState, useEffect } from 'react';
import { useStorageProviders } from './useStorageProviders';

interface DePINMetrics {
  totalProviders: number;
  activeProviders: number;
  inactiveProviders: number;
  totalBandwidth: number;
  totalStorage: number;
  averageUptime: number;
  bestUptime: number;
  tvl: number;
  totalDatasetsHosted: number;
  uniqueLocations: number;
  newProvidersThisMonth: number;
  avgBandwidthPerProvider: number;
  totalRewardsPaid: number;
  avgEarningsPerProvider: number;
}

export function useDePINMetrics() {
  const { providers, networkStats, isLoading } = useStorageProviders();
  const [metrics, setMetrics] = useState<DePINMetrics | null>(null);

  useEffect(() => {
    if (!providers || providers.length === 0) {
      setMetrics({
        totalProviders: 0,
        activeProviders: 0,
        inactiveProviders: 0,
        totalBandwidth: 0,
        totalStorage: 0,
        averageUptime: 0,
        bestUptime: 0,
        tvl: 0,
        totalDatasetsHosted: 0,
        uniqueLocations: 0,
        newProvidersThisMonth: 0,
        avgBandwidthPerProvider: 0,
        totalRewardsPaid: 0,
        avgEarningsPerProvider: 0,
      });
      return;
    }

    // Calculate metrics from providers
    const activeCount = providers.filter(p => p.isActive).length;
    const totalUptime = providers.reduce((sum, p) => sum + Number(p.uptime || 0), 0);
    const avgUptime = totalUptime / providers.length / 100;
    const bestUptime = Math.max(...providers.map(p => Number(p.uptime || 0))) / 100;
    
    const totalStaked = providers.reduce((sum, p) => sum + Number(p.stakedAmount || 0), 0);
    const totalDatasetsHosted = providers.reduce((sum, p) => sum + Number(p.datasetsHosted || 0), 0);
    const totalRewards = providers.reduce((sum, p) => sum + Number(p.totalEarnings || 0), 0);
    
    const uniqueLocs = new Set(providers.map(p => p.location || 'Unknown')).size;
    
    const avgBandwidth = networkStats?.networkBandwidth 
      ? networkStats.networkBandwidth / providers.length 
      : 0;

    setMetrics({
      totalProviders: providers.length,
      activeProviders: activeCount,
      inactiveProviders: providers.length - activeCount,
      totalBandwidth: networkStats?.networkBandwidth || 0,
      totalStorage: networkStats?.networkStorage || 0,
      averageUptime: avgUptime,
      bestUptime: bestUptime,
      tvl: totalStaked / 1e18,
      totalDatasetsHosted,
      uniqueLocations: uniqueLocs,
      newProvidersThisMonth: Math.floor(providers.length * 0.2),
      avgBandwidthPerProvider: avgBandwidth,
      totalRewardsPaid: totalRewards / 1e18,
      avgEarningsPerProvider: totalRewards / providers.length / 1e18,
    });
  }, [providers, networkStats]);

  return {
    metrics,
    isLoading,
  };
}
