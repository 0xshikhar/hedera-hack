"use client";

import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function HederaConnectButton() {
  const { accountId, isConnected, isConnecting, connect, disconnect, network } = useHederaWallet();

  const handleCopyAddress = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      toast.success('Address copied to clipboard');
    }
  };

  const handleViewOnExplorer = () => {
    if (accountId) {
      const explorerUrl = network === 'mainnet'
        ? `https://hashscan.io/mainnet/account/${accountId}`
        : `https://hashscan.io/testnet/account/${accountId}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const formatAccountId = (id: string) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  if (isConnecting) {
    return (
      <Button disabled>
        <Wallet className="mr-2 h-4 w-4 animate-pulse" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && accountId) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            {formatAccountId(accountId)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Connected Account</p>
              <p className="text-xs text-muted-foreground">{accountId}</p>
              <p className="text-xs text-muted-foreground capitalize">
                Network: {network}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewOnExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on HashScan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connect}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
