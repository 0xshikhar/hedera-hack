'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIInsightsDashboard } from '@/components/analytics/AIInsightsDashboard';
import { NetworkHealthMonitor } from '@/components/analytics/NetworkHealthMonitor';
import { CarbonBudgetMonitor } from '@/components/carbon/CarbonBudgetMonitor';
import { CarbonAwareModelSelector } from '@/components/carbon/CarbonAwareModelSelector';
import { ProvenanceViewer } from '@/components/provenance/ProvenanceViewer';
import { ProvenanceStatsDashboard } from '@/components/provenance/ProvenanceStatsDashboard';
import { Shield, Activity, Leaf, TrendingUp, BarChart3 } from 'lucide-react';

export default function VerifiableAIPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Verifiable & Sustainable AI</h1>
        <p className="text-lg text-muted-foreground">
          Complete transparency, immutable audit trails, and carbon-aware AI operations powered by Hedera
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Network Health
          </TabsTrigger>
          <TabsTrigger value="carbon" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Carbon Tracking
          </TabsTrigger>
          <TabsTrigger value="provenance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Provenance
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AIInsightsDashboard />
            </div>
            <div>
              <NetworkHealthMonitor />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <NetworkHealthMonitor />
            <div className="space-y-6">
              <AIInsightsDashboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="carbon" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CarbonAwareModelSelector />
            <CarbonBudgetMonitor />
          </div>
        </TabsContent>

        <TabsContent value="provenance" className="space-y-6">
          <ProvenanceViewer />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <ProvenanceStatsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
