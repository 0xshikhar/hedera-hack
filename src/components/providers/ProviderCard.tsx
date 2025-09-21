import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, HardDrive, Activity, Database, TrendingUp } from 'lucide-react';

interface Provider {
  provider: string;
  stakedAmount?: bigint;
  bandwidthMbps?: bigint;
  storageTB?: bigint;
  uptime?: bigint;
  ipfsGateway?: string;
  location?: string;
  isActive: boolean;
  registeredAt?: bigint;
  totalEarnings?: bigint;
  datasetsHosted?: bigint;
}

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const uptimePercent = provider.uptime ? (Number(provider.uptime) / 100).toFixed(1) : '0.0';
  const isHealthy = provider.uptime ? Number(provider.uptime) >= 9900 : false; // 99%+
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-mono">
              {provider.provider ? `${provider.provider.slice(0, 6)}...${provider.provider.slice(-4)}` : 'Unknown Provider'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {provider.location || 'Unknown'}
            </CardDescription>
          </div>
          <Badge variant={provider.isActive ? 'default' : 'secondary'}>
            {provider.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Capacity Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Bandwidth</p>
              <p className="text-sm font-semibold">{provider.bandwidthMbps?.toString() || '0'} Mbps</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-sm font-semibold">{provider.storageTB?.toString() || '0'} TB</p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isHealthy ? 'text-green-500' : 'text-orange-500'}`} />
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-sm font-semibold">{uptimePercent}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Datasets</p>
              <p className="text-sm font-semibold">{provider.datasetsHosted?.toString() || '0'}</p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-sm font-semibold">
                {provider.totalEarnings ? (Number(provider.totalEarnings) / 1e18).toFixed(4) : '0.0000'} U2U
              </p>
            </div>
          </div>
        </div>

        {/* Gateway Info */}
        {provider.ipfsGateway && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">IPFS Gateway</p>
            <p className="text-xs font-mono truncate">{provider.ipfsGateway}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
