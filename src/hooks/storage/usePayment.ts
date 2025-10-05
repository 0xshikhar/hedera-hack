'use client';

import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Simplified payment hook (stub for compatibility)
 */
export const usePayment = () => {
  const { address } = useAccount();

  const depositMutation = useMutation({
    mutationKey: ["deposit", address],
    mutationFn: async (amount: string) => {
      if (!address) throw new Error("Please connect your wallet");
      
      // TODO: Implement MockUSDC deposit
      console.log("Deposit not yet implemented:", amount);
      
      return { success: true };
    },
  });

  const withdrawMutation = useMutation({
    mutationKey: ["withdraw", address],
    mutationFn: async (amount: string) => {
      if (!address) throw new Error("Please connect your wallet");
      
      // TODO: Implement MockUSDC withdrawal
      console.log("Withdraw not yet implemented:", amount);
      
      return { success: true };
    },
  });

  return {
    depositMutation,
    withdrawMutation,
  };
};
