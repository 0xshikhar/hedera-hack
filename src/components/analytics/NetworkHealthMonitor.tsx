'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface NetworkHealth {
  overall: number;
  components: {
    transactionThroughput: number;
    successRate: number;
    averageLatency: number;
    networkStability: number;
  };
  status: 'healthy' | 'degraded' | 'critical';
  alerts: string[];
}

export function NetworkHealthMonitor() {
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/analytics/network-health');
      const data = await response.json();
      if (data.success) {
        setHealth(data.health);
      }
    } catch (error) {
      console.error('Error fetching network health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Health</CardTitle>
          <CardDescription>Loading network status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Network Health Monitor</CardTitle>
          </div>
          <Badge variant="outline" className={getStatusColor(health.status)}>
            {getStatusIcon(health.status)}
            <span className="ml-2 capitalize">{health.status}</span>
          </Badge>
        </div>
        <CardDescription>Real-time Hedera network health metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health</span>
            <span className="text-2xl font-bold">{health.overall.toFixed(1)}%</span>
          </div>
          <Progress value={health.overall} className="h-3" />
        </div>

        {/* Component Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Transaction Throughput</span>
              <span className="text-sm font-medium">
                {health.components.transactionThroughput.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={health.components.transactionThroughput}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Success Rate</span>
              <span className="text-sm font-medium">
                {health.components.successRate.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={health.components.successRate}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Average Latency</span>
              <span className="text-sm font-medium">
                {health.components.averageLatency.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={health.components.averageLatency}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network Stability</span>
              <span className="text-sm font-medium">
                {health.components.networkStability.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={health.components.networkStability}
              className="h-2"
            />
          </div>
        </div>

        {/* Alerts */}
        {health.alerts.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Alerts</p>
            <div className="space-y-1">
              {health.alerts.map((alert, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {alert}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
