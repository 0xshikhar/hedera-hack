'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Search, CheckCircle, XCircle, Clock, Leaf } from 'lucide-react';

interface ProvenanceRecord {
  datasetId: string;
  model: string;
  provider: string;
  version: string;
  timestamp: string;
  carbonFootprint: {
    co2Grams: number;
    energyKwh: number;
  };
  operationType: string;
  verificationStatus: string;
  modelFingerprint: string;
  inputHash: string;
  outputHash: string;
}

export function ProvenanceViewer() {
  const [datasetId, setDatasetId] = useState('');
  const [history, setHistory] = useState<ProvenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    if (!datasetId.trim()) {
      setError('Please enter a dataset ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/provenance/history?datasetId=${encodeURIComponent(datasetId)}`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
        if (data.history.length === 0) {
          setError('No provenance records found for this dataset');
        }
      } else {
        setError(data.error || 'Failed to fetch provenance history');
      }
    } catch (err) {
      setError('Error fetching provenance history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Provenance Viewer</CardTitle>
        </div>
        <CardDescription>
          View complete audit trail and verification history for datasets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="datasetId">Dataset ID</Label>
            <Input
              id="datasetId"
              placeholder="Enter dataset ID..."
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchHistory} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* History Display */}
        {history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Found {history.length} provenance record{history.length !== 1 ? 's' : ''}
              </p>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {history.map((record, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Operation #{history.length - index}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(record.verificationStatus)}
                      </div>

                      <Separator />

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Operation Type</p>
                          <Badge variant="secondary" className="capitalize">
                            {record.operationType.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1">AI Model</p>
                          <p className="font-medium">
                            {record.provider}/{record.model}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1">Version</p>
                          <p className="font-medium">{record.version}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1">Carbon Footprint</p>
                          <div className="flex items-center gap-1">
                            <Leaf className="h-3 w-3 text-green-500" />
                            <p className="font-medium">
                              {record.carbonFootprint.co2Grams.toFixed(2)}g CO₂
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Hashes */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Model Fingerprint</p>
                          <code className="block p-2 rounded bg-muted font-mono break-all">
                            {record.modelFingerprint}
                          </code>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Input Hash</p>
                          <code className="block p-2 rounded bg-muted font-mono break-all">
                            {record.inputHash}
                          </code>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Output Hash</p>
                          <code className="block p-2 rounded bg-muted font-mono break-all">
                            {record.outputHash}
                          </code>
                        </div>
                      </div>

                      {/* Energy Usage */}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Energy Consumption</p>
                        <p className="text-sm font-medium">
                          {record.carbonFootprint.energyKwh.toFixed(6)} kWh
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
