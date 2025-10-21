'use client';

import { useHederaWallet } from '@/contexts/HederaWalletContext';

/**
 * Hook for accessing web3 functionality consistently across the app
 * This wraps Hedera wallet hooks to provide a simpler API that matches what components expect
 */
export function useWagmiWeb3() {
  const { accountId, isConnected, isConnecting, connect, disconnect } = useHederaWallet();

  const connectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return {
    account: accountId || null,
    isConnected,
    isConnecting,
    chainId: null, // Hedera doesn't use chainId in the same way
    connectWallet,
    disconnectWallet,
  };
}
