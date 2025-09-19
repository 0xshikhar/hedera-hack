'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { calculateNodeRewards } from '@/lib/calculations/nodeRewards';
import { TrendingUp, DollarSign } from 'lucide-react';

export function RewardCalculator() {
  const [bandwidth, setBandwidth] = useState(100); // Mbps
  const [storage, setStorage] = useState(1); // TB
  const [uptime, setUptime] = useState(99); // percentage
  const [datasetsHosted, setDatasetsHosted] = useState(10);

  const rewards = calculateNodeRewards({
    bandwidthMbps: bandwidth,
    storageTB: storage,
    uptimePercent: uptime,
    datasetsHosted,
  });

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bandwidth */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Bandwidth (Mbps)</Label>
            <span className="text-sm font-medium">{bandwidth} Mbps</span>
          </div>
          <Slider
            value={[bandwidth]}
            onValueChange={(value) => setBandwidth(value[0])}
            min={10}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10 Mbps</span>
            <span>1000 Mbps</span>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Storage (TB)</Label>
            <span className="text-sm font-medium">{storage} TB</span>
          </div>
          <Slider
            value={[storage]}
            onValueChange={(value) => setStorage(value[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 TB</span>
            <span>100 TB</span>
          </div>
        </div>

        {/* Uptime */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Uptime (%)</Label>
            <span className="text-sm font-medium">{uptime}%</span>
          </div>
          <Slider
            value={[uptime]}
            onValueChange={(value) => setUptime(value[0])}
            min={50}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Datasets Hosted */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Datasets Hosted (per month)</Label>
            <span className="text-sm font-medium">{datasetsHosted}</span>
          </div>
          <Slider
            value={[datasetsHosted]}
            onValueChange={(value) => setDatasetsHosted(value[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Rewards Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rewards</p>
                <p className="text-2xl font-bold">{rewards.monthlyRewards.toFixed(2)} U2U</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Annual Rewards</p>
                <p className="text-2xl font-bold">{rewards.annualRewards.toFixed(2)} U2U</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Est. USD/Month</p>
                <p className="text-2xl font-bold">${rewards.monthlyUSD.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">Reward Breakdown</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Infrastructure Reward:</span>
              <span className="font-medium">{rewards.breakdown.baseReward.toFixed(2)} U2U</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dataset Hosting Bonus:</span>
              <span className="font-medium">{rewards.breakdown.datasetBonus.toFixed(2)} U2U</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime Multiplier:</span>
              <span className="font-medium">{(rewards.breakdown.uptimeMultiplier * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-semibold">Total Monthly:</span>
              <span className="font-bold text-green-600">{rewards.monthlyRewards.toFixed(2)} U2U</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        * Estimated rewards based on current network parameters. Actual rewards may vary based on network demand and competition.
      </p>
    </div>
  );
}
