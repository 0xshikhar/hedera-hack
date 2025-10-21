'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, MapPin, Zap, HardDrive, Activity, Plus } from 'lucide-react';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { ProviderRegistrationForm } from '@/components/providers/ProviderRegistrationForm';
import { ProviderMap } from '@/components/providers/ProviderMap';
import { ProviderStats } from '@/components/providers/ProviderStats';
import { ProviderPerformanceDashboard } from '@/components/providers/ProviderPerformanceDashboard';
import { useStorageProviders } from '@/hooks/blockchain/useStorageProviders';

export default function ProvidersPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const { providers, networkStats, isLoading, refetch } = useStorageProviders();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Storage Provider Network</h1>
        <p className="text-muted-foreground">
          Decentralized IPFS storage providers powering FileThetic&apos;s DePIN infrastructure
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : networkStats?.totalProviders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {networkStats?.activeProviders || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Bandwidth</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${(networkStats?.networkBandwidth || 0) / 1000} Gbps`}
            </div>
            <p className="text-xs text-muted-foreground">Total capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${networkStats?.networkStorage || 0} TB`}
            </div>
            <p className="text-xs text-muted-foreground">Available storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : '99.2%'}
            </div>
            <p className="text-xs text-muted-foreground">Network health</p>
          </CardContent>
        </Card>
      </div>

      {/* Become a Provider CTA */}
      {!showRegistration && (
        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Become a Storage Provider
            </CardTitle>
            <CardDescription>
              Contribute your IPFS storage capacity and earn rewards by hosting datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowRegistration(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Register as Provider
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      {showRegistration && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Register as Storage Provider</CardTitle>
            <CardDescription>
              Fill in your infrastructure details to join the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderRegistrationForm
              onSuccess={() => {
                setShowRegistration(false);
                refetch();
              }}
              onCancel={() => setShowRegistration(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Provider Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Provider List</TabsTrigger>
          <TabsTrigger value="map">Geographic Map</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading providers...</div>
          ) : providers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Providers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to register as a storage provider!
                </p>
                <Button onClick={() => setShowRegistration(true)}>
                  Register Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <ProviderCard key={provider.provider} provider={provider} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Provider Distribution</CardTitle>
              <CardDescription>
                Geographic distribution of storage providers across the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderMap providers={providers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <ProviderStats providers={providers} networkStats={networkStats} />
        </TabsContent>

        <TabsContent value="performance">
          <ProviderPerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
