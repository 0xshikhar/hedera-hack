"use client";

import { useEffect, useState, useCallback } from 'react';
import { getAllDatasets, lockDatasetTransaction } from '@/lib/hedera';
import { DATASET_NFT_TOKEN_ID } from '@/lib/constants';
import { Dataset as DatasetType } from '@/lib/types';
import { DatasetCard } from '@/components/ui/dataset-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';


// Local Dataset interface that matches what's used in the component
type Dataset = {
  id: number;
  name: string;
  description: string;
  price: string;
  owner: string;
  locked: boolean;
  verified: boolean;
  cid?: string;
  tokenId?: string;
};

export function DatasetBrowser() {
  const { accountId: address, isConnected, dAppConnector } = useHederaWallet();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwn, setFilterOwn] = useState(false);
  const [sortOption, setSortOption] = useState('newest');

  // Fetch all datasets from the blockchain
  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const fetchedDatasets = await getAllDatasets();
      console.log("Fetched datasets from contract:", fetchedDatasets);
      // Transform the fetched datasets to match our local Dataset type
      const transformedDatasets = fetchedDatasets.map((dataset: DatasetType) => ({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        price: String(dataset.price),
        owner: dataset.owner,
        locked: dataset.locked || false,
        verified: dataset.verified || false,
        cid: dataset.cid || dataset.ipfsHash,
        tokenId: dataset.tokenId
      }));
      console.log("Transformed datasets for display:", transformedDatasets);
      setDatasets(transformedDatasets);
      setFilteredDatasets(transformedDatasets);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Error fetching datasets", {
        description: "Failed to fetch datasets. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dataset locking
  const handleLockDataset = async (id: number): Promise<void> => {
    if (!address || !dAppConnector) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Get signer from dAppConnector
      const signer = dAppConnector.signers?.[0];
      if (!signer) {
        toast.error("No signer available from wallet");
        return;
      }

      toast.info("Preparing lock transaction...");
      
      // Create lock transaction
      const lockTxBytes = await lockDatasetTransaction(DATASET_NFT_TOKEN_ID, id, address, signer);
      
      toast.info("Please approve the lock transaction in your wallet...");
      
      // Sign and execute via wallet
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: lockTxBytes,
      });
      
      // Update local state
      const updatedDatasets = datasets.map(dataset => 
        dataset.id === id ? { ...dataset, locked: true } : dataset
      );
      
      setDatasets(updatedDatasets);
      setFilteredDatasets(
        filterAndSortDatasets(
          updatedDatasets,
          searchTerm,
          filterOwn,
          sortOption
        )
      );
      
      toast.success("Dataset Locked", {
        description: "The dataset has been successfully locked and is now immutable.",
      });
    } catch (error: unknown) {
      console.error("Error locking dataset:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to lock dataset";
      toast.error("Error locking dataset", {
        description: errorMessage,
      });
    }
  };

  // Filter and sort datasets
  const filterAndSortDatasets = useCallback((
    datasetList: Dataset[],
    search: string,
    ownOnly: boolean,
    sort: string
  ) => {
    // Apply filters
    let filtered = datasetList.filter(dataset => {
      // Filter by search term
      const matchesSearch = 
        dataset.name.toLowerCase().includes(search.toLowerCase()) ||
        dataset.description.toLowerCase().includes(search.toLowerCase());
      
      // Filter by ownership if selected
      const matchesOwnership = ownOnly 
        ? address && dataset.owner.toLowerCase() === address.toLowerCase()
        : true;
      
      return matchesSearch && matchesOwnership;
    });
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        // Assume newer datasets have higher IDs
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'oldest':
        filtered.sort((a, b) => Number(a.id) - Number(b.id));
        break;
      case 'price-low':
        filtered.sort((a, b) => Number(BigInt(a.price) - BigInt(b.price)));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [address]);

  // Handle filter changes
  useEffect(() => {
    if (datasets.length > 0) {
      const filtered = filterAndSortDatasets(
        datasets,
        searchTerm,
        filterOwn,
        sortOption
      );
      setFilteredDatasets(filtered);
    }
  }, [searchTerm, filterOwn, sortOption, address, datasets, filterAndSortDatasets]);

  // Initial fetch
  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterOwn(!filterOwn)}
            className={filterOwn ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterOwn ? "All Datasets" : "My Datasets"}
          </Button>
          
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDatasets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading datasets...</div>
        </div>
      ) : filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              id={dataset.id}
              name={dataset.name}
              description={dataset.description}
              price={dataset.price}
              owner={dataset.owner}
              locked={dataset.locked}
              verified={dataset.verified}
              cid={dataset.cid || ''}
              isOwner={!!address && dataset.owner.toLowerCase() === address.toLowerCase()}
              onLock={handleLockDataset}
              onVerificationCheck={async () => Promise.resolve()}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 space-y-2 text-center">
          <p className="text-lg font-medium">No datasets found</p>
          <p className="text-muted-foreground">
            {searchTerm || filterOwn ? 
              "Try adjusting your filters or search terms" : 
              "Be the first to create a synthetic dataset!"
            }
          </p>
          {!searchTerm && !filterOwn && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = "/create"}
            >
              Create Dataset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
