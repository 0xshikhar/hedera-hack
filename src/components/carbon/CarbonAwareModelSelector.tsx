'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Leaf, Zap, DollarSign, TrendingDown } from 'lucide-react';

interface ModelOption {
  provider: string;
  model: string;
  estimatedCost: number;
  carbonFootprint: {
    co2Grams: number;
    energyKwh: number;
  };
  performanceScore: number;
}

interface Recommendation {
  recommendedModel: ModelOption;
  alternatives: ModelOption[];
  carbonSavings: number;
  costSavings: number;
  reasoning: string;
}

export function CarbonAwareModelSelector() {
  const [taskType, setTaskType] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [estimatedTokens, setEstimatedTokens] = useState(1000);
  const [maxCarbonBudget, setMaxCarbonBudget] = useState<number | undefined>(undefined);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carbon/recommend-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          estimatedTokens,
          maxCarbonBudget: maxCarbonBudget || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          <CardTitle>Carbon-Aware Model Selector</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered recommendations for the most carbon-efficient model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Complexity</Label>
            <Select value={taskType} onValueChange={(value) => setTaskType(value as 'simple' | 'moderate' | 'complex')}>
              <SelectTrigger id="taskType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (Quick responses)</SelectItem>
                <SelectItem value="moderate">Moderate (Standard tasks)</SelectItem>
                <SelectItem value="complex">Complex (Advanced reasoning)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokens">Estimated Tokens</Label>
            <Input
              id="tokens"
              type="number"
              value={estimatedTokens}
              onChange={(e) => setEstimatedTokens(Number(e.target.value))}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbonBudget">Max Carbon Budget (g CO₂) - Optional</Label>
            <Input
              id="carbonBudget"
              type="number"
              value={maxCarbonBudget || ''}
              onChange={(e) => setMaxCarbonBudget(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Leave empty for no limit"
            />
          </div>
        </div>

        <Button onClick={getRecommendation} disabled={loading} className="w-full">
          {loading ? 'Analyzing...' : 'Get Recommendation'}
        </Button>

        {/* Recommendation Display */}
        {recommendation && (
          <div className="space-y-6 pt-4 border-t">
            {/* Recommended Model */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  Recommended
                </Badge>
                <h3 className="text-lg font-semibold">
                  {recommendation.recommendedModel.provider}/{recommendation.recommendedModel.model}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-muted-foreground">Carbon Footprint</p>
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    {recommendation.recommendedModel.carbonFootprint.co2Grams.toFixed(2)}g CO₂
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  </div>
                  <p className="text-lg font-bold text-blue-500">
                    ${recommendation.recommendedModel.estimatedCost.toFixed(4)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <p className="text-lg font-bold text-purple-500">
                    {recommendation.recommendedModel.performanceScore}/100
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                    <p className="text-xs text-muted-foreground">Energy</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-500">
                    {recommendation.recommendedModel.carbonFootprint.energyKwh.toFixed(6)} kWh
                  </p>
                </div>
              </div>

              {/* Savings */}
              {recommendation.carbonSavings > 0 && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <p className="text-sm font-medium">💰 Savings vs. Least Efficient Option</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carbon Savings</p>
                      <p className="font-bold text-green-500">
                        {recommendation.carbonSavings.toFixed(2)}g CO₂
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost Savings</p>
                      <p className="font-bold text-blue-500">
                        ${recommendation.costSavings.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Reasoning</p>
                <p className="text-sm">{recommendation.reasoning}</p>
              </div>
            </div>

            {/* Alternative Models */}
            {recommendation.alternatives.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Alternative Options</h4>
                <div className="space-y-2">
                  {recommendation.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">
                          {alt.provider}/{alt.model}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {alt.performanceScore}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Carbon</p>
                          <p className="font-medium">{alt.carbonFootprint.co2Grams.toFixed(2)}g</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${alt.estimatedCost.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Energy</p>
                          <p className="font-medium">{alt.carbonFootprint.energyKwh.toFixed(6)} kWh</p>
                        </div>
                      </div>
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
