'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { UIProvider } from '@/types/provider';

interface ProviderMapProps {
  providers: UIProvider[];
}

export function ProviderMap({ providers }: ProviderMapProps) {
  // Group providers by location
  const locationCounts = providers.reduce((acc, provider) => {
    const location = provider.location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = Object.entries(locationCounts)
    .map(([location, count]) => ({
      location,
      count,
      providers: providers.filter(p => (p.location || 'Unknown') === location)
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4">
      {/* Placeholder for actual map - you can integrate react-leaflet or mapbox later */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Geographic Distribution Map</h3>
          <p className="text-muted-foreground">
            Interactive map coming soon. See provider locations below.
          </p>
        </div>
      </div>

      {/* Location List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locationStats.map(({ location, count, providers: locationProviders }) => (
          <Card key={location}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold">{location}</h4>
                  <p className="text-sm text-muted-foreground">{count} provider{count > 1 ? 's' : ''}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Bandwidth:</span>
                      <span className="font-medium">
                        {locationProviders.reduce((sum, p) => sum + Number(p.bandwidthMbps || 0), 0)} Mbps
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Storage:</span>
                      <span className="font-medium">
                        {locationProviders.reduce((sum, p) => sum + Number(p.storageTB || 0), 0)} TB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locationStats.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No providers registered yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
