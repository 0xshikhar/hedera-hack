'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBalances } from "@/hooks/storage/useBalances";
import { Loader2 } from "lucide-react";

/**
 * Simplified Storage Manager for U2U blockchain
 * Shows U2U and MockUSDC balances
 */
export function StorageManager() {
  const { data: balances, isLoading } = useBalances();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">U2U Balance:</span>
            <span className="text-sm">{balances?.filBalanceFormatted || 0} U2U</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">MockUSDC Balance:</span>
            <span className="text-sm">{balances?.usdfcBalanceFormatted || 0} USDC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
