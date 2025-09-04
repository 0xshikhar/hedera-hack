import { Metadata } from "next";
import { DatasetBrowser } from "@/components/ui/dataset-browser";

export const metadata: Metadata = {
  title: "Marketplace | FileThetic",
  description: "Browse and purchase synthetic datasets on the FileThetic marketplace",
};

export default function MarketplacePage() {
  return (
      <div className="container max-w-7xl mx-auto py-6 md:py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dataset Marketplace</h1>
            <p className="text-muted-foreground">
              Browse, purchase, and access synthetic datasets from the decentralized marketplace.
            </p>
          </div>
          <DatasetBrowser />
        </div>
      </div>
  );
}
