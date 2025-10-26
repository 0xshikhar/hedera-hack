'use client';

import { useQuery } from "@tanstack/react-query";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { defaultBalances, UseBalancesResponse } from "@/types";

/**
 * Simplified hook to fetch wallet balances (no Synapse SDK)
 * Tracks U2U and MockUSDC balances only
 */
export const useBalances = () => {
  const { accountId: address } = useHederaWallet();
  
  // Get native HBAR balance (placeholder - would need Hedera SDK to fetch actual balance)
  const seiBalance = { value: BigInt(0) };

  const query = useQuery({
    enabled: !!address,
    queryKey: ["balances", address],
    queryFn: async (): Promise<UseBalancesResponse> => {
      if (!address) throw new Error("Address not found");

      const seiRaw = seiBalance?.value || BigInt(0);
      const usdcRaw = BigInt(0); // TODO: Add MockUSDC balance check

      // Return simplified balances
      return {
        filBalance: seiRaw,
        usdfcBalance: usdcRaw,
        pandoraBalance: BigInt(0),
        filBalanceFormatted: formatBalance(seiRaw, 18),
        usdfcBalanceFormatted: formatBalance(usdcRaw, 6),
        pandoraBalanceFormatted: 0,
        balances: {
          fil: formatUnits(seiRaw, 18),
          usdfc: formatUnits(usdcRaw, 6),
          payments: "0",
        },
        storage: {
          used: "0",
          available: "0",
          percentUsed: 0,
        },
        currentStorageGB: 0,
        currentRateAllowanceGB: 0,
        currentLockupAllowance: BigInt(0),
        persistenceDaysLeft: 0,
        persistenceDaysLeftAtCurrentRate: 0,
        isSufficient: true,
        isRateSufficient: true,
        isLockupSufficient: true,
        rateNeeded: BigInt(0),
        totalLockupNeeded: BigInt(0),
        depositNeeded: BigInt(0),
        isLoading: false,
        error: null,
      };
    },
  });

  return {
    ...query,
    data: query.data || defaultBalances,
  };
};

/**
 * Formats a bigint value to a string with specified decimals (Hedera-native implementation)
 */
function formatUnits(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0');
  return `${quotient}.${remainderStr}`;
}

/**
 * Formats a balance value with specified decimals
 */
export const formatBalance = (balance: bigint, decimals: number): number => {
  return Number(Number(formatUnits(balance, decimals)).toFixed(5));
};
