'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyticsService } from '@/services/analytics';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Search,
  DollarSign,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ProviderPerformanceDashboard() {
  const [providerId, setProviderId] = useState('');
  const [performance, setPerformance] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!providerId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch provider performance
      const perfData = await analyticsService.getProviderPerformance(providerId);
      setPerformance(perfData);

      // Fetch anomaly detection
      const anomalyData = await analyticsService.detectAnomalies(providerId);
      setAnomalies(anomalyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze provider');
    } finally {
      setLoading(false);
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Provider Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Provider Account ID (e.g., 0.0.123)"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={loading || !providerId}>
              {loading ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performance && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getReputationColor(performance.reputation)}`}>
                  {performance.reputation.toFixed(1)}
                </div>
                <Progress value={performance.reputation} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {performance.totalTransactions} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.uptime.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Fee</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.averageFee.toFixed(4)} ℏ
                </div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Details</CardTitle>
                <Badge className={getReputationBadge(performance.reputation)}>
                  {performance.reputation >= 80 ? 'Excellent' : 
                   performance.reputation >= 60 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Provider ID</p>
                  <p className="font-mono text-sm">{performance.providerId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="text-sm">
                    {new Date(performance.lastActive).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">{performance.successRate.toFixed(2)}%</span>
                </div>
                <Progress value={performance.successRate} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">{performance.uptime.toFixed(2)}%</span>
                </div>
                <Progress value={performance.uptime} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reputation</span>
                  <span className={`font-medium ${getReputationColor(performance.reputation)}`}>
                    {performance.reputation.toFixed(2)}/100
                  </span>
                </div>
                <Progress value={performance.reputation} />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Fraud Detection Results */}
      {anomalies && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Fraud Detection Analysis
              </CardTitle>
              {anomalies.isHighRisk ? (
                <Badge variant="destructive">High Risk</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50">Low Risk</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{anomalies.totalTransactions}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {anomalies.anomalyCount}
                </p>
                <p className="text-sm text-muted-foreground">Anomalies Detected</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {anomalies.riskScore.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Risk Score</p>
              </div>
            </div>

            {anomalies.anomalies.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Anomalies:</p>
                <div className="space-y-2">
                  {anomalies.anomalies.slice(0, 5).map((anomaly: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            {anomaly.type}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {anomaly.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(anomaly.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {anomalies.anomalyCount === 0 && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  No anomalies detected. This provider shows normal behavior patterns.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!performance && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Enter a provider account ID to analyze performance and detect anomalies
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
