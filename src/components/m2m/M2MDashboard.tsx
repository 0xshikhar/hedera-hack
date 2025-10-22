'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Radio, Send, Activity, FileText, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface M2MMessage {
  messageId: string;
  from: string;
  to: string;
  type: string;
  action: string;
  payload: any;
  timestamp: string;
}

export function M2MDashboard() {
  const [messages, setMessages] = useState<M2MMessage[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Request form state
  const [category, setCategory] = useState('');
  const [minQuality, setMinQuality] = useState(80);
  const [maxPrice, setMaxPrice] = useState(20);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    // Mock data for demonstration
    const mockMessages: M2MMessage[] = [
      {
        messageId: 'm2m_001',
        from: '0.0.123',
        to: 'broadcast',
        type: 'request',
        action: 'DATASET_REQUEST',
        payload: {
          category: 'healthcare',
          requirements: { minQuality: 85, maxPrice: 15 },
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        messageId: 'm2m_002',
        from: '0.0.456',
        to: '0.0.123',
        type: 'response',
        action: 'BID_SUBMISSION',
        payload: {
          price: 12,
          estimatedQuality: 90,
          deliveryTime: 2,
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        messageId: 'm2m_003',
        from: '0.0.789',
        to: 'broadcast',
        type: 'heartbeat',
        action: 'PROVIDER_STATUS',
        payload: {
          online: true,
          capacity: 85,
          currentLoad: 45,
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
    ];

    setMessages(mockMessages);

    // Filter by type
    setRequests(
      mockMessages.filter((m) => m.action === 'DATASET_REQUEST').map((m) => m.payload)
    );
    setBids(
      mockMessages.filter((m) => m.action === 'BID_SUBMISSION').map((m) => m.payload)
    );
  };

  const broadcastRequest = async () => {
    setLoading(true);
    try {
      // In production, this would call the M2M service
      const newRequest = {
        requestId: `req_${Date.now()}`,
        category,
        requirements: {
          minQuality,
          maxPrice,
          format: 'json',
        },
      };

      setRequests([newRequest, ...requests]);
      
      // Reset form
      setCategory('');
      setMinQuality(80);
      setMaxPrice(20);
    } catch (error) {
      console.error('Error broadcasting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'bg-blue-500';
      case 'response':
        return 'bg-green-500';
      case 'notification':
        return 'bg-yellow-500';
      case 'heartbeat':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Active Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4" />
              Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bids.length}</div>
            <p className="text-xs text-muted-foreground">From providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Active Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="broadcast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="broadcast">Broadcast Request</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
        </TabsList>

        {/* Broadcast Request Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Dataset Request</CardTitle>
              <CardDescription>
                Send a request to all providers in the network via HCS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Dataset Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., healthcare, finance, retail"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minQuality">Minimum Quality Score</Label>
                  <Input
                    id="minQuality"
                    type="number"
                    min={0}
                    max={100}
                    value={minQuality}
                    onChange={(e) => setMinQuality(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Price (HBAR)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min={1}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button
                onClick={broadcastRequest}
                disabled={loading || !category}
                className="w-full"
              >
                <Radio className="mr-2 h-4 w-4" />
                {loading ? 'Broadcasting...' : 'Broadcast Request to Network'}
              </Button>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your request will be broadcast to all providers
                  via HCS. Providers matching your criteria will respond with bids.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>M2M Message Stream</CardTitle>
              <CardDescription>Real-time machine-to-machine communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.messageId}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getMessageTypeColor(msg.type)}>
                            {msg.type}
                          </Badge>
                          <span className="text-sm font-medium">{msg.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">From:</span>{' '}
                          <span className="font-mono">{msg.from}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To:</span>{' '}
                          <span className="font-mono">{msg.to}</span>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        {JSON.stringify(msg.payload, null, 2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Active Dataset Requests</CardTitle>
              <CardDescription>Requests awaiting provider bids</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active requests
                  </div>
                ) : (
                  requests.map((req, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{req.category}</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Min Quality: {req.requirements.minQuality}</div>
                        <div>Max Price: {req.requirements.maxPrice} ℏ</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bids Tab */}
        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Provider Bids</CardTitle>
              <CardDescription>Bids received from providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bids.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bids received yet
                  </div>
                ) : (
                  bids.map((bid, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Bid #{index + 1}</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>{' '}
                          <span className="font-bold">{bid.price} ℏ</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality:</span>{' '}
                          <span className="font-bold">{bid.estimatedQuality}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery:</span>{' '}
                          <span className="font-bold">{bid.deliveryTime}h</span>
                        </div>
                      </div>
                      <Button size="sm" className="mt-3 w-full">
                        Accept Bid
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
