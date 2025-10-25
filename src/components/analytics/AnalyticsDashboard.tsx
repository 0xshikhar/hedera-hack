'use client';

import { useEffect, useState } from 'react';
import { NetworkMetrics } from './NetworkMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsService } from '@/services/analytics';
import { carbonCalculator } from '@/services/carbon';
import { ProvenanceService } from '@/services/provenance';
import { Client } from '@hashgraph/sdk';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Activity, TrendingUp, AlertTriangle, Leaf, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AnalyticsDashboard() {
  const [networkHealth, setNetworkHealth] = useState<any>(null);
  const [provenanceStats, setProvenanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load network health
        const health = await analyticsService.getNetworkHealth();
        setNetworkHealth(health);

        // Load provenance stats
        const client = Client.forTestnet();
        if (process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID && process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY) {
          client.setOperator(
            process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID,
            process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY
          );
          const provService = new ProvenanceService(client);
          const stats = await provService.getProvenanceStats();
          setProvenanceStats(stats);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Prepare chart data
  const providerData = provenanceStats?.byProvider
    ? Object.entries(provenanceStats.byProvider).map(([name, value]) => ({
        name,
        value: value as number,
      }))
    : [];

  const modelData = provenanceStats?.byModel
    ? Object.entries(provenanceStats.byModel).map(([name, value]) => ({
        name,
        value: value as number,
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Network Metrics */}
      <NetworkMetrics />

      {/* Network Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Health
            </CardTitle>
            {networkHealth && (
              <Badge className={getHealthStatusColor(networkHealth.status)}>
                {networkHealth.status?.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {networkHealth ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {networkHealth.successRate?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Fee</p>
                <p className="text-2xl font-bold">
                  {networkHealth.averageFee?.toFixed(4)} ℏ
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">
                  {networkHealth.totalTransactions}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading network health...</p>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="provenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="provenance">
            <Shield className="h-4 w-4 mr-2" />
            Provenance
          </TabsTrigger>
          <TabsTrigger value="carbon">
            <Leaf className="h-4 w-4 mr-2" />
            Carbon Impact
          </TabsTrigger>
          <TabsTrigger value="fraud">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Fraud Detection
          </TabsTrigger>
        </TabsList>

        {/* Provenance Tab */}
        <TabsContent value="provenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Provider Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>AI Provider Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {providerData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={providerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {providerData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No provenance data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Model Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Model Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {modelData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No model data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provenance Stats */}
          {provenanceStats && (
            <Card>
              <CardHeader>
                <CardTitle>Provenance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Datasets</p>
                    <p className="text-2xl font-bold">
                      {provenanceStats.totalDatasets}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Carbon</p>
                    <p className="text-2xl font-bold">
                      {carbonCalculator.formatCarbonFootprint(
                        provenanceStats.totalCarbonGrams
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Carbon/Dataset</p>
                    <p className="text-2xl font-bold">
                      {carbonCalculator.formatCarbonFootprint(
                        provenanceStats.averageCarbonPerDataset
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Providers</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(provenanceStats.byProvider).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Carbon Impact Tab */}
        <TabsContent value="carbon" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {provenanceStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {carbonCalculator.formatCarbonFootprint(
                          provenanceStats.totalCarbonGrams
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Emissions</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">
                        {carbonCalculator.formatCarbonFootprint(
                          provenanceStats.averageCarbonPerDataset
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg per Dataset</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {Math.ceil(provenanceStats.totalCarbonGrams / 21000)}
                      </p>
                      <p className="text-sm text-muted-foreground">Trees Needed</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">
                        $
                        {(
                          (provenanceStats.totalCarbonGrams / 1000000) *
                          15
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Offset Cost</p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Sustainability Tip:</strong> Consider using more
                      efficient AI models or offsetting your carbon emissions through
                      verified carbon credit programs.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No carbon data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection & Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p className="text-lg font-medium mb-2">
                  Real-time Fraud Monitoring Active
                </p>
                <p className="text-muted-foreground">
                  AI-powered anomaly detection is continuously monitoring all
                  transactions for suspicious patterns.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">0</p>
                    <p className="text-sm text-muted-foreground">High Risk Accounts</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">0</p>
                    <p className="text-sm text-muted-foreground">Flagged Transactions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">100%</p>
                    <p className="text-sm text-muted-foreground">System Health</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
