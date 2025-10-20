'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Database, Globe, TrendingUp, Zap, HardDrive, Users, DollarSign } from 'lucide-react';
import { NetworkHealthChart } from '@/components/depin/NetworkHealthChart';
import { ProviderDistributionChart } from '@/components/depin/ProviderDistributionChart';
import { EconomicActivityChart } from '@/components/depin/EconomicActivityChart';
import { useDePINMetrics } from '@/hooks/blockchain/useDePINMetrics';

export default function DePINAnalyticsPage() {
  const { metrics, isLoading } = useDePINMetrics();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">DePIN Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time metrics for FileThetic's Decentralized Physical Infrastructure Network
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics?.totalProviders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.newProvidersThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Bandwidth</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${((metrics?.totalBandwidth || 0) / 1000).toFixed(1)} Gbps`}
            </div>
            <p className="text-xs text-muted-foreground">Combined capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${metrics?.totalStorage || 0} TB`}
            </div>
            <p className="text-xs text-muted-foreground">Available storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : `${metrics?.averageUptime || 99.2}%`}
            </div>
            <p className="text-xs text-muted-foreground">Average uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Economic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${metrics?.tvl || 0} U2U`}
            </div>
            <p className="text-xs text-muted-foreground">Provider stakes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datasets Hosted</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics?.totalDatasetsHosted || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geographic Coverage</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics?.uniqueLocations || 0}
            </div>
            <p className="text-xs text-muted-foreground">Countries/regions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Network Health</TabsTrigger>
          <TabsTrigger value="distribution">Provider Distribution</TabsTrigger>
          <TabsTrigger value="economic">Economic Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Network Health Over Time</CardTitle>
              <CardDescription>
                Provider uptime, bandwidth utilization, and storage capacity trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkHealthChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Provider Distribution</CardTitle>
              <CardDescription>
                Geographic and capacity distribution across the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderDistributionChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economic">
          <Card>
            <CardHeader>
              <CardTitle>Economic Activity</CardTitle>
              <CardDescription>
                Network earnings, staking activity, and transaction volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EconomicActivityChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Network Statistics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Detailed Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Infrastructure Metrics</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Active Providers:</span>
                  <span className="font-medium text-foreground">{metrics?.activeProviders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Providers:</span>
                  <span className="font-medium text-foreground">{metrics?.inactiveProviders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Bandwidth/Provider:</span>
                  <span className="font-medium text-foreground">{metrics?.avgBandwidthPerProvider || 0} Mbps</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Performance Metrics</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Avg Uptime:</span>
                  <span className="font-medium text-foreground">{metrics?.averageUptime || 99.2}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Uptime:</span>
                  <span className="font-medium text-foreground">{metrics?.bestUptime || 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Reliability:</span>
                  <span className="font-medium text-green-600">High</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Economic Metrics</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Staked:</span>
                  <span className="font-medium text-foreground">{metrics?.tvl || 0} U2U</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rewards Paid:</span>
                  <span className="font-medium text-foreground">{metrics?.totalRewardsPaid || 0} U2U</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Earnings/Provider:</span>
                  <span className="font-medium text-foreground">{metrics?.avgEarningsPerProvider || 0} U2U</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
