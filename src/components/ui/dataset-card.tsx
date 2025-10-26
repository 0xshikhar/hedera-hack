"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, ShoppingCart, Shield, CheckCircle, XCircle, Download } from 'lucide-react';
import { purchaseDataset, hasAccessToDataset } from '@/lib/hedera';
import { getDatasetContent } from '@/lib/ipfs';
import { toast } from 'sonner';
import { useHederaWallet } from '@/contexts/HederaWalletContext';

export interface DatasetCardProps {
  id: number;
  tokenId?: string; // Hedera token ID
  name: string;
  description?: string;
  price: string; // Price in hbar
  owner: string;
  locked: boolean;
  verified?: boolean;
  isOwner: boolean;
  cid: string; // IPFS CID
  onLock?: (id: number) => Promise<void>;
  onVerificationCheck?: (id: number) => Promise<void>;
}

export function DatasetCard({
  id,
  tokenId,
  name,
  description,
  price,
  owner,
  locked,
  verified,
  isOwner,
  cid,
  onLock,
  onVerificationCheck,
}: DatasetCardProps) {
  const { accountId: address, isConnected } = useHederaWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format price (assuming price is already in HBAR or USDC)
  const parsedPrice = parseFloat(price || '0');
  const formattedPrice = parsedPrice.toFixed(2);
  const isFree = parsedPrice === 0;

  const checkAccess = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const hasAccess = await hasAccessToDataset(tokenId || '', id);
      setHasAccess(hasAccess);
    } catch (error) {
      console.error("Error checking dataset access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) return;
    setIsPurchasing(true);
    try {
      await purchaseDataset(tokenId || '', id, parsedPrice);
      await checkAccess();
    } catch (error) {
      console.error("Error purchasing dataset:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleLock = async () => {
    if (onLock) {
      await onLock(id);
    }
  };

  const handleVerificationCheck = async () => {
    if (onVerificationCheck) {
      await onVerificationCheck(id);
    }
  };
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const content = await getDatasetContent(cid);
      
      // Convert content to JSON string
      const jsonString = JSON.stringify(content, null, 2);
      
      // Create a blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${id}-${name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading dataset:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {description || "No description provided"}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
          {locked ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Unlock className="h-3 w-3" /> Unlocked
            </Badge>
          )}
          
          {verified !== undefined && (
            <Badge 
              variant={verified ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {verified ? (
                <><CheckCircle className="h-3 w-3" /> Verified</>
              ) : (
                <><XCircle className="h-3 w-3" /> Unverified</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium text-muted-foreground">Price:</span>
            <span className="text-lg font-bold">
              {isFree ? (
                <span className="text-green-600">Free</span>
              ) : (
                `${formattedPrice} USDC`
              )}
            </span>
          </div>
          
          {hasAccess === true && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Dataset"}
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 pt-3 mt-auto">
        {hasAccess === null && isConnected && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={checkAccess}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Access"}
          </Button>
        )}
        
        {isOwner && (
          <div className="flex gap-2 w-full">
            {!locked && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={handleLock}
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock
              </Button>
            )}
            
            {verified === false && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleVerificationCheck}
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify
              </Button>
            )}
          </div>
        )}
        
        {!isOwner && !hasAccess && locked && (
          <Button 
            onClick={handlePurchase} 
            disabled={isPurchasing || isFree}
            size="sm"
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isPurchasing ? "Processing..." : isFree ? "Get Access" : "Purchase"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
