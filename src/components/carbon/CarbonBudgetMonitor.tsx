'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, AlertTriangle, CheckCircle } from 'lucide-react';

interface CarbonMonitoring {
  status: 'safe' | 'warning' | 'critical';
  percentageUsed: number;
  remaining: number;
  alerts: string[];
}

export function CarbonBudgetMonitor() {
  const [currentUsage, setCurrentUsage] = useState(250);
  const [budget, setBudget] = useState(1000);
  const [monitoring, setMonitoring] = useState<CarbonMonitoring | null>(null);
  const [offsetRecommendation, setOffsetRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkBudget = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carbon/monitor-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsage, budget }),
      });
      const data = await response.json();
      if (data.success) {
        setMonitoring(data.monitoring);
        setOffsetRecommendation(data.offsetRecommendation);
      }
    } catch (error) {
      console.error('Error monitoring budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Leaf className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          <CardTitle>Carbon Budget Monitor</CardTitle>
        </div>
        <CardDescription>Track and manage your carbon footprint budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentUsage">Current Usage (g CO₂)</Label>
            <Input
              id="currentUsage"
              type="number"
              value={currentUsage}
              onChange={(e) => setCurrentUsage(Number(e.target.value))}
              placeholder="250"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (g CO₂)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="1000"
            />
          </div>
        </div>

        <Button onClick={checkBudget} disabled={loading} className="w-full">
          {loading ? 'Checking...' : 'Check Budget Status'}
        </Button>

        {/* Monitoring Results */}
        {monitoring && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="outline" className={getStatusColor(monitoring.status)}>
                {getStatusIcon(monitoring.status)}
                <span className="ml-2 capitalize">{monitoring.status}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget Used</span>
                <span className="text-lg font-bold">
                  {monitoring.percentageUsed.toFixed(1)}%
                </span>
              </div>
              <Progress value={monitoring.percentageUsed} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {monitoring.remaining.toFixed(2)}g CO₂ remaining
              </p>
            </div>

            {/* Alerts */}
            {monitoring.alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Alerts</p>
                <div className="space-y-1">
                  {monitoring.alerts.map((alert, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {alert}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Offset Recommendations */}
            {offsetRecommendation && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">Carbon Offset Recommendations</p>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trees to plant:</span>
                    <span className="font-medium">{offsetRecommendation.trees}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated cost:</span>
                    <span className="font-medium">${offsetRecommendation.cost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {offsetRecommendation.actions.map((action: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">{action.impact}</p>
                      <p className="text-xs font-medium text-primary">
                        Cost: ${action.cost.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
