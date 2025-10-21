'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';
import {
  depinOptimization,
  type ProviderNode,
  type NetworkTopology,
  type OptimizationRecommendation,
  type LoadBalancingStrategy,
} from '@/services/depin-optimization';

type NetworkHealth = Awaited<ReturnType<typeof depinOptimization.monitorNetworkHealth>>;

export function DePINOptimizationDashboard() {
  const [topology, setTopology] = useState<NetworkTopology | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loadBalancing, setLoadBalancing] = useState<LoadBalancingStrategy[]>([]);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const geographicEntries = topology
    ? Array.from(topology.geographicDistribution.entries())
    : [];

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    setLoading(true);
    try {
      // Mock provider data
      const mockProviders: ProviderNode[] = [
        {
          providerId: '0.0.123',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            region: 'us-east',
            country: 'USA',
          },
          capacity: { storage: 100, bandwidth: 1000, compute: 32 },
          utilization: { storage: 65, bandwidth: 45, compute: 50 },
          performance: { uptime: 99.5, avgResponseTime: 120, successRate: 99.8 },
          reputation: 92,
          earnings: 1500,
        },
        {
          providerId: '0.0.456',
          location: {
            latitude: 51.5074,
            longitude: -0.1278,
            region: 'eu-west',
            country: 'UK',
          },
          capacity: { storage: 150, bandwidth: 1500, compute: 48 },
          utilization: { storage: 75, bandwidth: 60, compute: 55 },
          performance: { uptime: 98.2, avgResponseTime: 150, successRate: 99.5 },
          reputation: 88,
          earnings: 1800,
        },
        {
          providerId: '0.0.789',
          location: {
            latitude: 35.6762,
            longitude: 139.6503,
            region: 'asia-pacific',
            country: 'Japan',
          },
          capacity: { storage: 120, bandwidth: 1200, compute: 40 },
          utilization: { storage: 55, bandwidth: 50, compute: 45 },
          performance: { uptime: 99.9, avgResponseTime: 100, successRate: 99.9 },
          reputation: 95,
          earnings: 2000,
        },
      ];

      const topo = await depinOptimization.analyzeNetworkTopology(mockProviders);
      setTopology(topo);

      const recs = await depinOptimization.generateOptimizations(mockProviders, topo);
      setRecommendations(recs);

      const loadBal = depinOptimization.calculateLoadBalancing(mockProviders);
      setLoadBalancing(loadBal);

      const healthStatus = await depinOptimization.monitorNetworkHealth(mockProviders);
      setHealth(healthStatus);
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (
    priority: OptimizationRecommendation['priority']
  ): BadgeProps['variant'] => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Health Overview */}
      {health && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getHealthColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {health.issues.length} issue(s) detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health.metrics.avgUptime.toFixed(1)}%
              </div>
              <Progress value={health.metrics.avgUptime} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health.metrics.avgResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">Network average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health.metrics.utilizationRate.toFixed(1)}%
              </div>
              <Progress value={health.metrics.utilizationRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="topology" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
          <TabsTrigger value="recommendations">Optimizations</TabsTrigger>
          <TabsTrigger value="loadbalancing">Load Balancing</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        {/* Topology Tab */}
        <TabsContent value="topology">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Network Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span className="font-medium">
                      {topology?.totalCapacity.storage} TB
                    </span>
                  </div>
                  <Progress value={topology?.avgUtilization.storage || 0} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {topology?.avgUtilization.storage.toFixed(1)}% utilized
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bandwidth</span>
                    <span className="font-medium">
                      {topology?.totalCapacity.bandwidth} Mbps
                    </span>
                  </div>
                  <Progress value={topology?.avgUtilization.bandwidth || 0} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {topology?.avgUtilization.bandwidth.toFixed(1)}% utilized
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compute</span>
                    <span className="font-medium">
                      {topology?.totalCapacity.compute} cores
                    </span>
                  </div>
                  <Progress value={topology?.avgUtilization.compute || 0} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {topology?.avgUtilization.compute.toFixed(1)}% utilized
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicEntries.map(([region, count]) => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {region.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={topology ? (count / topology.totalNodes) * 100 : 0}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Health Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {topology?.healthScore}/100
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI-Powered Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights to improve network performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">
                      Network is optimally configured. No recommendations at this time.
                    </p>
                  </div>
                ) : (
                  recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <span className="font-medium">{rec.title}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {rec.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Impact:</span> {rec.impact}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Action:</span> {rec.action}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Benefit:</span>{' '}
                            {rec.estimatedBenefit.improvement}%{' '}
                            {rec.estimatedBenefit.metric.replace('_', ' ')} improvement
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Load Balancing Tab */}
        <TabsContent value="loadbalancing">
          <Card>
            <CardHeader>
              <CardTitle>Load Balancing Strategy</CardTitle>
              <CardDescription>
                Optimal load distribution across providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadBalancing.map((strategy, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{strategy.providerId}</span>
                      <Badge
                        variant={
                          strategy.priority > 2
                            ? 'default'
                            : strategy.priority > 1
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        Priority {strategy.priority}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recommended Load</span>
                        <span className="font-medium">{strategy.recommendedLoad}%</span>
                      </div>
                      <Progress value={strategy.recommendedLoad} />
                    </div>

                    <div className="space-y-1">
                      {strategy.reasoning.map((reason: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-blue-500" />
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Network Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {health?.issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">
                    No issues detected. Network is healthy!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {health?.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        issue.severity === 'high'
                          ? 'bg-red-50 border-red-200'
                          : issue.severity === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            issue.severity === 'high'
                              ? 'destructive'
                              : issue.severity === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {issue.severity}
                        </Badge>
                        <span className="text-sm font-medium">{issue.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
