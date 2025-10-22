'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { aiEconomicsService } from '@/services/ai-economics';
import { TrendingUp, DollarSign, Target, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AIEconomicsDashboard() {
  const [category, setCategory] = useState('healthcare');
  const [currentPrice, setCurrentPrice] = useState(10);
  const [qualityScore, setQualityScore] = useState(85);
  const [insights, setInsights] = useState<any>(null);
  const [demand, setDemand] = useState<any>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const marketInsights = await aiEconomicsService.generateMarketInsights();
      setInsights(marketInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDemand = async () => {
    setLoading(true);
    try {
      const demandPrediction = await aiEconomicsService.predictDemand(category, 7);
      setDemand(demandPrediction);

      const optimalStrategy = await aiEconomicsService.calculateOptimalStrategy(
        currentPrice,
        category,
        qualityScore
      );
      setStrategy(optimalStrategy);
    } catch (error) {
      console.error('Error analyzing demand:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend === 'decreasing') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <span className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Market Insights */}
      {insights && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.supplierMetrics.totalSuppliers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights.supplierMetrics.activeSuppliers} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.supplierMetrics.avgReputation}/100
                </div>
                <p className="text-xs text-muted-foreground">Network average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.topCategories[0]?.category || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights.topCategories[0]?.growth || 0}% growth
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Categories by Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.topCategories.slice(0, 5).map((cat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {cat.volume} datasets
                      </span>
                      <Badge
                        variant={cat.growth > 15 ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {getTrendIcon(cat.growth > 0 ? 'increasing' : 'decreasing')}
                        {cat.growth}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-sm text-blue-900">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Demand Analysis Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Demand Analysis & Pricing Strategy
          </CardTitle>
          <CardDescription>
            Analyze demand and get AI-powered pricing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., healthcare"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Current Price (HBAR)</Label>
              <Input
                id="price"
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Quality Score</Label>
              <Input
                id="quality"
                type="number"
                value={qualityScore}
                onChange={(e) => setQualityScore(parseInt(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </div>

          <Button onClick={analyzeDemand} disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Analyze Demand & Get Strategy'}
          </Button>

          {/* Demand Prediction Results */}
          {demand && (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Demand Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Demand</span>
                    <span className="font-bold">{demand.currentDemand.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Predicted Demand</span>
                    <span className="font-bold">{demand.predictedDemand.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trend</span>
                    <Badge
                      variant={
                        demand.trend === 'increasing'
                          ? 'default'
                          : demand.trend === 'decreasing'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="gap-1"
                    >
                      {getTrendIcon(demand.trend)}
                      {demand.trend}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <span className="font-bold">
                      {(demand.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Optimal Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Strategy</span>
                    <Badge variant="outline" className="capitalize">
                      {strategy?.strategy}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Recommended Price
                    </span>
                    <span className="font-bold text-green-600">
                      {strategy?.recommendedPrice.toFixed(2)} ℏ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expected Sales</span>
                    <span className="font-bold">{strategy?.expectedSales}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Expected Revenue
                    </span>
                    <span className="font-bold text-blue-600">
                      {strategy?.expectedRevenue.toFixed(2)} ℏ
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Demand Factors */}
          {demand && demand.factors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Key Factors:</p>
              <div className="space-y-1">
                {demand.factors.map((factor: string, index: number) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
