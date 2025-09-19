import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">1. Install IPFS</h4>
          <code className="block bg-muted p-2 rounded text-sm mt-2">
            wget https://dist.ipfs.io/kubo/v0.18.0/kubo_v0.18.0_linux-amd64.tar.gz
          </code>
        </div>
        <div>
          <h4 className="font-semibold">2. Configure IPFS</h4>
          <code className="block bg-muted p-2 rounded text-sm mt-2">
            ipfs init && ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
          </code>
        </div>
        <div>
          <h4 className="font-semibold">3. Register on FileThetic</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Visit /providers and register with your infrastructure details
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
