'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface Insight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data?: any;
}

export function AIInsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/analytics/insights?limit=10');
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity':
        return <Target className="h-5 w-5" />;
      case 'risk':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'anomaly':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'opportunity':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'risk':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500/10 text-red-500 border-red-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Loading insights from mirror node data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Real-time insights powered by mirror node analytics and AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No insights available at the moment
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Alert
                  key={index}
                  className={`border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <AlertTitle className="text-base font-semibold">
                          {insight.title}
                        </AlertTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getImpactBadge(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <AlertDescription className="text-sm">
                        {insight.description}
                      </AlertDescription>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground">
                          💡 Recommendation:
                        </p>
                        <p className="text-sm mt-1">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
