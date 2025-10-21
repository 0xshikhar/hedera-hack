/**
 * Hedera Wallet Connect Button
 * Replacement for RainbowKit ConnectButton
 */

"use client";

import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function HederaConnectButton() {
  const { accountId, isConnected, isConnecting, connect, disconnect } = useHederaWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setCopied(true);
      toast.success("Account ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAccountId = (id: string) => {
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        variant="default"
        size="default"
      >
        {isConnecting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAccountId(accountId || "")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyAddress}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Account ID"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
