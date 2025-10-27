'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Server, Zap, HardDrive, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { RewardCalculator } from '@/components/node/RewardCalculator';
import { SystemRequirements } from '@/components/node/SystemRequirements';
import { SetupGuide } from '@/components/node/SetupGuide';
import { NodeFAQ } from '@/components/node/NodeFAQ';
import Link from 'next/link';

export default function RunNodePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Run a FileThetic Node
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Contribute your infrastructure to the DePIN network and earn U2U tokens by providing storage and compute power
        </p>
      </div>

      {/* Why Run a Node */}
      <Card className="mb-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <CardTitle className="text-2xl">Why Run a Node?</CardTitle>
          <CardDescription className="text-base">
            Benefits of becoming a FileThetic infrastructure provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get paid in HBAR tokens for providing storage and bandwidth to the network
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Server className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Support DePIN</h3>
                <p className="text-sm text-muted-foreground">
                  Help build decentralized infrastructure for the AI data economy
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Low Barriers</h3>
                <p className="text-sm text-muted-foreground">
                  Start with minimal hardware - as little as 1TB storage and 100 Mbps bandwidth
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Reward Calculator
          </CardTitle>
          <CardDescription>
            Estimate your potential earnings based on your infrastructure contribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RewardCalculator />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requirements">System Requirements</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          <SystemRequirements />
        </TabsContent>

        <TabsContent value="setup">
          <SetupGuide />
        </TabsContent>

        <TabsContent value="faq">
          <NodeFAQ />
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-blue-100">
                Register as a provider and start earning rewards today
              </p>
            </div>
            <Link href="/providers">
              <Button size="lg" variant="secondary" className="gap-2">
                Register as Provider
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
