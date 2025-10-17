"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedVerificationStatus } from "@/components/verification/enhanced-verification-status";
import { QualityMetricsDashboard } from "@/components/verification/quality-metrics-dashboard";
import { getAllDatasets, getDatasetVerificationInfo, isWalletConnected } from "@/lib/web3";
import { Dataset } from "@/lib/types";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Database,
  Shield
} from "lucide-react";

// Type for dashboard dataset display
interface DashboardDataset {
  id: string;
  name: string;
  description: string;
  size: string;
  format: string;
  uploadDate: string;
  verificationStatus: "verified" | "pending" | "rejected";
  qualityScore: number;
  verifier: string | null;
  tags: string[];
  rating: number;
}

export default function VerificationDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<DashboardDataset[]>([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    verifiedDatasets: 0,
    pendingVerification: 0,
    rejectedDatasets: 0,
    averageQualityScore: 0,
    totalVerifiers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform blockchain dataset to dashboard format
  const transformDataset = async (dataset: Dataset): Promise<DashboardDataset> => {
    // Get verification info
    const verificationInfo = await getDatasetVerificationInfo(Number(dataset.id));
    
    // Determine verification status
    let verificationStatus: "verified" | "pending" | "rejected" = "pending";
    if (verificationInfo.isVerified) {
      verificationStatus = "verified";
    } else if (verificationInfo.verifiedAt > 0) {
      // If there's a timestamp but not verified, it was rejected
      verificationStatus = "rejected";
    }

    // Calculate quality score based on dataset properties
    let qualityScore = 50; // Base score
    if (dataset.numRows > 1000) qualityScore += 20;
    if (dataset.numTokens > 10000) qualityScore += 15;
    if (dataset.cid && dataset.cid !== '') qualityScore += 15;
    if (verificationStatus === 'verified') qualityScore += 20;
    qualityScore = Math.min(100, qualityScore);

    // Generate tags based on dataset name and description
    const tags = [];
    const text = (dataset.name + ' ' + dataset.description).toLowerCase();
    if (text.includes('medical') || text.includes('health')) tags.push('medical');
    if (text.includes('financial') || text.includes('finance')) tags.push('finance');
    if (text.includes('climate') || text.includes('weather')) tags.push('climate');
    if (text.includes('iot') || text.includes('sensor')) tags.push('iot');
    if (text.includes('trading') || text.includes('market')) tags.push('trading');

    // Estimate size based on rows and tokens
    const estimatedSizeKB = (dataset.numRows * dataset.numTokens) / 1000;
    let sizeString = "Unknown";
    if (estimatedSizeKB > 1000000) {
      sizeString = `${(estimatedSizeKB / 1000000).toFixed(1)} GB`;
    } else if (estimatedSizeKB > 1000) {
      sizeString = `${(estimatedSizeKB / 1000).toFixed(1)} MB`;
    } else if (estimatedSizeKB > 0) {
      sizeString = `${estimatedSizeKB.toFixed(0)} KB`;
    }

    return {
      id: dataset.id.toString(),
      name: dataset.name,
      description: dataset.description,
      size: sizeString,
      format: "JSON",
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus,
      qualityScore,
      verifier: verificationInfo.verifier !== '0x0000000000000000000000000000000000000000' ? 
                `${verificationInfo.verifier.slice(0, 6)}...${verificationInfo.verifier.slice(-4)}` : null,
      tags,
      rating: Math.min(5, Math.max(1, qualityScore / 20))
    };
  };

  // Fetch real blockchain data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if wallet is connected
        const walletConnected = await isWalletConnected();
        if (!walletConnected) {
          setError("Please connect your wallet to view verification data");
          return;
        }

        // Fetch all datasets from blockchain
        const blockchainDatasets = await getAllDatasets();
        
        // Transform datasets for dashboard display
        const transformedDatasets = await Promise.all(
          blockchainDatasets.map((dataset: Dataset) => transformDataset(dataset))
        );
        
        setDatasets(transformedDatasets);

        // Calculate stats
        const totalDatasets = transformedDatasets.length;
        const verifiedDatasets = transformedDatasets.filter((d: DashboardDataset) => d.verificationStatus === 'verified').length;
        const pendingVerification = transformedDatasets.filter((d: DashboardDataset) => d.verificationStatus === 'pending').length;
        const rejectedDatasets = transformedDatasets.filter((d: DashboardDataset) => d.verificationStatus === 'rejected').length;
        const averageQualityScore = totalDatasets > 0 ? 
          transformedDatasets.reduce((sum: number, d: DashboardDataset) => sum + d.qualityScore, 0) / totalDatasets : 0;
        
        setStats({
          totalDatasets,
          verifiedDatasets,
          pendingVerification,
          rejectedDatasets,
          averageQualityScore: Math.round(averageQualityScore * 10) / 10,
          totalVerifiers: new Set(transformedDatasets.map((d: DashboardDataset) => d.verifier).filter(Boolean)).size
        });

      } catch (err) {
        console.error('Error fetching verification data:', err);
        setError('Failed to load verification data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dataset.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verification Dashboard</h1>
        <p className="text-gray-600">Monitor and manage dataset verification status and quality metrics</p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification data...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Datasets</p>
                  <p className="text-2xl font-bold">{stats.totalDatasets.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verifiedDatasets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedDatasets}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Quality</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.averageQualityScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verifiers</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalVerifiers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="datasets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="datasets">Dataset Verification</TabsTrigger>
          <TabsTrigger value="quality">Quality Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-6">
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search datasets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dataset List */}
          <div className="grid gap-4">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{dataset.name}</h3>
                        <Badge className={getStatusColor(dataset.verificationStatus)}>
                          {getStatusIcon(dataset.verificationStatus)}
                          <span className="ml-1 capitalize">{dataset.verificationStatus}</span>
                        </Badge>
                        <Badge variant="outline" className={getQualityColor(dataset.qualityScore)}>
                          Quality: {dataset.qualityScore}%
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{dataset.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {dataset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Size: {dataset.size}</span>
                        <span>Format: {dataset.format}</span>
                        <span>Uploaded: {dataset.uploadDate}</span>
                        {dataset.verifier && (
                          <span>Verified by: {dataset.verifier}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <EnhancedVerificationStatus 
                        datasetId={dataset.id}
                        showQualityMetrics={true}
                        compact={true}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDataset(dataset.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDatasets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No datasets found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityMetricsDashboard datasetId={selectedDataset || "1"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
