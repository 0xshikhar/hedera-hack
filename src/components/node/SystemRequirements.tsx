import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function SystemRequirements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Minimum:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 2 cores, 4GB RAM</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 1TB storage, 100 Mbps</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 95% uptime</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Software:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> IPFS Node (Kubo v0.18+)</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Web3 Wallet (MetaMask)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
