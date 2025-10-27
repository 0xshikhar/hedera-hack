'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Database, MapPin } from 'lucide-react';
import { UIProvider, NetworkStats } from '@/types/provider';

interface ProviderStatsProps {
  providers: UIProvider[];
  networkStats: NetworkStats | null;
}

export function ProviderStats({ providers, networkStats }: ProviderStatsProps) {
  // Location distribution data
  const locationData = providers.reduce((acc, provider) => {
    const location = provider.location || 'Unknown';
    const existing = acc.find(item => item.name === location);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: location, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Top providers by datasets hosted
  const topProviders = [...providers]
    .filter(p => p.datasetsHosted !== undefined)
    .sort((a, b) => Number(b.datasetsHosted || 0) - Number(a.datasetsHosted || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.provider ? `${p.provider.slice(0, 6)}...${p.provider.slice(-4)}` : 'Unknown',
      datasets: Number(p.datasetsHosted || 0)
    }));

  // Uptime distribution
  const uptimeRanges = [
    { name: '99-100%', value: 0 },
    { name: '95-99%', value: 0 },
    { name: '90-95%', value: 0 },
    { name: '<90%', value: 0 }
  ];

  providers.forEach(provider => {
    if (provider.uptime !== undefined) {
      const uptime = provider.uptime;
      if (uptime >= 99) uptimeRanges[0].value++;
      else if (uptime >= 95) uptimeRanges[1].value++;
      else if (uptime >= 90) uptimeRanges[2].value++;
      else uptimeRanges[3].value++;
    }
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Health
            </CardTitle>
            <CardDescription>Average provider uptime and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Active Providers</span>
                  <span className="text-sm text-muted-foreground">
                    {networkStats?.activeProviders || 0} / {networkStats?.totalProviders || 0}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${networkStats?.totalProviders ? (networkStats.activeProviders / networkStats.totalProviders) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Average Uptime</span>
                  <span className="text-sm text-muted-foreground">99.2%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Capacity Utilization
            </CardTitle>
            <CardDescription>Network bandwidth and storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Bandwidth</span>
                  <span className="text-sm text-muted-foreground">
                    {((networkStats?.networkBandwidth || 0) / 1000).toFixed(1)} Gbps
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-muted-foreground">
                    {networkStats?.networkStorage || 0} TB
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Providers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Providers by Datasets</CardTitle>
            <CardDescription>Providers hosting the most datasets</CardDescription>
          </CardHeader>
          <CardContent>
            {topProviders.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProviders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="datasets" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Providers by location</CardDescription>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uptime Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Uptime Distribution</CardTitle>
          <CardDescription>Distribution of provider uptime percentages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={uptimeRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
