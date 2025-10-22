# FileThetic-Hedera: Implementation Guide
## Getting Started with Hybrid Approach

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Core Hedera packages
npm install @hashgraph/sdk @hashgraph/hedera-wallet-connect

# Hgraph SDK for mirror node queries
npm install @hgraph.io/sdk

# AI/ML packages
npm install openai @anthropic-ai/sdk @google/generative-ai
npm install langchain

# Frontend packages
npm install next@latest react react-dom
npm install tailwindcss @shadcn/ui lucide-react
npm install recharts date-fns

# Utilities
npm install zod dotenv
```

### 2. Environment Setup

Create `.env.local`:

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID="0.0.YOUR_ACCOUNT"
HEDERA_PRIVATE_KEY="YOUR_PRIVATE_KEY"
HEDERA_NETWORK="testnet"

# Existing Token IDs
DATASET_NFT_TOKEN_ID="0.0.7158235"
FILE_TOKEN_ID="0.0.7158236"
FTUSD_TOKEN_ID="0.0.7158237"

# Existing HCS Topic IDs
DATASET_METADATA_TOPIC_ID="0.0.7158238"
VERIFICATION_LOGS_TOPIC_ID="0.0.7158239"
AGENT_COMMUNICATION_TOPIC_ID="0.0.7158240"
AUDIT_TRAIL_TOPIC_ID="0.0.7158241"
MARKETPLACE_EVENTS_TOPIC_ID="0.0.7158243"

# Hgraph SDK Configuration
HGRAPH_API_URL="https://testnet.hedera.api.hgraph.io/v1/graphql"
HGRAPH_WS_URL="wss://testnet.hedera.api.hgraph.io/v1/graphql"

# AI Provider Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."

# IPFS Configuration
PINATA_API_KEY="..."
PINATA_SECRET_KEY="..."

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="..."
```

---

## 📦 Project Structure

```
filethetic-hedera/
├── src/
│   ├── app/                    # Next.js 15 app directory
│   │   ├── page.tsx           # Landing page
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── marketplace/       # Dataset marketplace
│   │   ├── studio/            # Dataset creation
│   │   └── providers/         # Provider network
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/UI components
│   │   ├── analytics/        # Charts and metrics
│   │   ├── marketplace/      # Marketplace components
│   │   └── providers/        # Provider components
│   ├── lib/                   # Core libraries
│   │   ├── hedera/           # Hedera SDK utilities
│   │   ├── hgraph/           # Hgraph SDK integration
│   │   ├── agents/           # Agent Kit plugins
│   │   ├── ai/               # AI provider integrations
│   │   └── ipfs/             # IPFS utilities
│   ├── services/              # Business logic
│   │   ├── analytics.ts      # Analytics service
│   │   ├── provenance.ts     # Provenance tracking
│   │   ├── carbon.ts         # Carbon calculator
│   │   └── fraud.ts          # Fraud detection
│   └── types/                 # TypeScript types
├── contracts/                 # Smart contracts
│   ├── FiletheticMarketplace.sol
│   ├── ProviderRegistry.sol
│   └── VerificationOracle.sol
├── scripts/                   # Deployment scripts
└── documents/                 # Documentation
```

---

## 🔧 Core Implementations

### 1. Hgraph SDK Integration

Create `src/lib/hgraph/client.ts`:

```typescript
import { GraphQLClient } from 'graphql-request';

export class HgraphClient {
  private client: GraphQLClient;
  
  constructor() {
    this.client = new GraphQLClient(
      process.env.HGRAPH_API_URL!,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Query transaction history
  async getTransactionHistory(accountId: string, limit: number = 100) {
    const query = `
      query GetTransactions($accountId: String!, $limit: Int!) {
        transaction(
          where: {
            _or: [
              { payer_account_id: { _eq: $accountId } }
              { entity_id: { _eq: $accountId } }
            ]
          }
          order_by: { consensus_timestamp: desc }
          limit: $limit
        ) {
          consensus_timestamp
          transaction_hash
          type
          result
          charged_tx_fee
          memo_base64
        }
      }
    `;
    
    return this.client.request(query, { accountId, limit });
  }

  // Query token transfers
  async getTokenTransfers(tokenId: string, limit: number = 100) {
    const query = `
      query GetTokenTransfers($tokenId: String!, $limit: Int!) {
        token_transfer(
          where: { token_id: { _eq: $tokenId } }
          order_by: { consensus_timestamp: desc }
          limit: $limit
        ) {
          consensus_timestamp
          account_id
          amount
          token_id
        }
      }
    `;
    
    return this.client.request(query, { tokenId, limit });
  }

  // Query HCS topic messages
  async getTopicMessages(topicId: string, limit: number = 100) {
    const query = `
      query GetTopicMessages($topicId: String!, $limit: Int!) {
        topic_message(
          where: { topic_id: { _eq: $topicId } }
          order_by: { consensus_timestamp: desc }
          limit: $limit
        ) {
          consensus_timestamp
          message
          sequence_number
          payer_account_id
        }
      }
    `;
    
    return this.client.request(query, { topicId, limit });
  }

  // Real-time subscription
  subscribeToTransactions(accountId: string, callback: (data: any) => void) {
    const subscription = `
      subscription OnNewTransaction($accountId: String!) {
        transaction(
          where: { payer_account_id: { _eq: $accountId } }
          order_by: { consensus_timestamp: desc }
          limit: 1
        ) {
          consensus_timestamp
          transaction_hash
          type
          result
        }
      }
    `;
    
    // Implement WebSocket subscription
    // This is a simplified example
    return subscription;
  }
}

export const hgraphClient = new HgraphClient();
```

---

### 2. HCS Provenance Tracking

Create `src/services/provenance.ts`:

```typescript
import { Client, TopicMessageSubmitTransaction } from '@hashgraph/sdk';

export interface ProvenanceData {
  datasetId: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  version: string;
  prompt: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  timestamp: string;
  carbonFootprint: {
    computeTimeMs: number;
    energyKwh: number;
    co2Grams: number;
  };
}

export class ProvenanceService {
  private client: Client;
  private topicId: string;

  constructor(client: Client) {
    this.client = client;
    this.topicId = process.env.DATASET_METADATA_TOPIC_ID!;
  }

  async logProvenance(data: ProvenanceData): Promise<string> {
    const message = JSON.stringify({
      type: 'PROVENANCE',
      version: '1.0',
      data,
      timestamp: new Date().toISOString(),
    });

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(this.topicId)
      .setMessage(message);

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return receipt.status.toString();
  }

  async getProvenanceHistory(datasetId: string): Promise<ProvenanceData[]> {
    // Query HCS topic messages using Hgraph SDK
    const messages = await hgraphClient.getTopicMessages(this.topicId);
    
    return messages
      .filter((msg: any) => {
        try {
          const parsed = JSON.parse(Buffer.from(msg.message, 'base64').toString());
          return parsed.type === 'PROVENANCE' && parsed.data.datasetId === datasetId;
        } catch {
          return false;
        }
      })
      .map((msg: any) => {
        const parsed = JSON.parse(Buffer.from(msg.message, 'base64').toString());
        return parsed.data;
      });
  }
}
```

---

### 3. Carbon Footprint Calculator

Create `src/services/carbon.ts`:

```typescript
export interface CarbonCalculation {
  computeTimeMs: number;
  energyKwh: number;
  co2Grams: number;
  provider: string;
  model: string;
}

export class CarbonCalculator {
  // Average power consumption per AI provider (watts)
  private readonly POWER_CONSUMPTION = {
    openai: {
      'gpt-4': 300,        // Estimated watts
      'gpt-3.5-turbo': 150,
    },
    anthropic: {
      'claude-3-opus': 280,
      'claude-3-sonnet': 200,
    },
    google: {
      'gemini-pro': 250,
    },
  };

  // Carbon intensity (gCO2/kWh) - US average
  private readonly CARBON_INTENSITY = 385;

  calculate(
    provider: string,
    model: string,
    computeTimeMs: number
  ): CarbonCalculation {
    // Get power consumption for model
    const powerWatts = this.POWER_CONSUMPTION[provider]?.[model] || 200;

    // Calculate energy consumption
    const computeTimeHours = computeTimeMs / (1000 * 60 * 60);
    const energyKwh = (powerWatts * computeTimeHours) / 1000;

    // Calculate CO2 emissions
    const co2Grams = energyKwh * this.CARBON_INTENSITY;

    return {
      computeTimeMs,
      energyKwh,
      co2Grams,
      provider,
      model,
    };
  }

  formatCarbonFootprint(co2Grams: number): string {
    if (co2Grams < 1000) {
      return `${co2Grams.toFixed(2)}g CO2`;
    } else {
      return `${(co2Grams / 1000).toFixed(2)}kg CO2`;
    }
  }

  getOffsetRecommendation(co2Grams: number): {
    trees: number;
    cost: number;
  } {
    // 1 tree absorbs ~21kg CO2 per year
    const trees = Math.ceil((co2Grams / 1000) / 21);
    
    // Average carbon offset cost: $15 per ton
    const cost = (co2Grams / 1000000) * 15;

    return { trees, cost };
  }
}

export const carbonCalculator = new CarbonCalculator();
```

---

### 4. Analytics Service with Hgraph SDK

Create `src/services/analytics.ts`:

```typescript
import { hgraphClient } from '@/lib/hgraph/client';

export class AnalyticsService {
  // Get marketplace statistics
  async getMarketplaceStats() {
    const tokenId = process.env.DATASET_NFT_TOKEN_ID!;
    const transfers = await hgraphClient.getTokenTransfers(tokenId, 1000);

    const totalSales = transfers.length;
    const totalVolume = transfers.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const uniqueBuyers = new Set(transfers.map(t => t.account_id)).size;

    return {
      totalSales,
      totalVolume,
      uniqueBuyers,
      averagePrice: totalVolume / totalSales,
    };
  }

  // Get provider performance
  async getProviderPerformance(providerId: string) {
    const transactions = await hgraphClient.getTransactionHistory(providerId, 1000);

    const successRate = transactions.filter(t => t.result === 'SUCCESS').length / transactions.length;
    const avgFee = transactions.reduce((sum, t) => sum + t.charged_tx_fee, 0) / transactions.length;

    return {
      providerId,
      totalTransactions: transactions.length,
      successRate,
      averageFee: avgFee,
      uptime: successRate * 100,
    };
  }

  // Detect anomalies (fraud detection)
  async detectAnomalies(accountId: string) {
    const transactions = await hgraphClient.getTransactionHistory(accountId, 1000);

    // Simple anomaly detection: unusual transaction frequency
    const timestamps = transactions.map(t => new Date(t.consensus_timestamp).getTime());
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i - 1] - timestamps[i]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    );

    const anomalies = intervals.filter(interval => 
      Math.abs(interval - avgInterval) > 2 * stdDev
    );

    return {
      accountId,
      totalTransactions: transactions.length,
      anomalyCount: anomalies.length,
      riskScore: (anomalies.length / transactions.length) * 100,
      isHighRisk: anomalies.length / transactions.length > 0.1,
    };
  }

  // Predict demand (simple moving average)
  async predictDemand(category: string, days: number = 7) {
    const topicId = process.env.MARKETPLACE_EVENTS_TOPIC_ID!;
    const messages = await hgraphClient.getTopicMessages(topicId, 1000);

    // Parse messages and filter by category
    const sales = messages
      .map(msg => {
        try {
          return JSON.parse(Buffer.from(msg.message, 'base64').toString());
        } catch {
          return null;
        }
      })
      .filter(msg => msg && msg.category === category);

    // Calculate daily sales
    const dailySales = new Map<string, number>();
    sales.forEach(sale => {
      const date = new Date(sale.timestamp).toISOString().split('T')[0];
      dailySales.set(date, (dailySales.get(date) || 0) + 1);
    });

    // Simple moving average
    const values = Array.from(dailySales.values());
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      category,
      historicalAverage: average,
      predictedDemand: average * 1.1, // 10% growth assumption
      confidence: 0.75,
    };
  }
}

export const analyticsService = new AnalyticsService();
```

---

### 5. Hedera Agent Kit Plugin Example

Create `src/lib/agents/verification-plugin.ts`:

```typescript
import { Tool } from 'langchain/tools';
import { hgraphClient } from '@/lib/hgraph/client';
import { analyticsService } from '@/services/analytics';

export class VerificationPlugin extends Tool {
  name = 'verify_dataset';
  description = 'Verify dataset quality and check for fraud using AI and mirror node analytics';

  async _call(input: string): Promise<string> {
    const { datasetId, ipfsCID } = JSON.parse(input);

    // 1. Check provenance on HCS
    const provenance = await this.checkProvenance(datasetId);

    // 2. Analyze creator's history using Hgraph SDK
    const creatorAnalysis = await analyticsService.detectAnomalies(provenance.creator);

    // 3. Check for duplicates
    const duplicateCheck = await this.checkDuplicates(ipfsCID);

    // 4. AI quality scoring
    const qualityScore = await this.scoreQuality(datasetId);

    const result = {
      datasetId,
      verified: creatorAnalysis.riskScore < 20 && !duplicateCheck.isDuplicate && qualityScore > 70,
      provenance: provenance.isValid,
      creatorRiskScore: creatorAnalysis.riskScore,
      qualityScore,
      duplicateCheck,
    };

    return JSON.stringify(result);
  }

  private async checkProvenance(datasetId: string) {
    const topicId = process.env.DATASET_METADATA_TOPIC_ID!;
    const messages = await hgraphClient.getTopicMessages(topicId);
    
    const provenanceMsg = messages.find(msg => {
      try {
        const parsed = JSON.parse(Buffer.from(msg.message, 'base64').toString());
        return parsed.data?.datasetId === datasetId;
      } catch {
        return false;
      }
    });

    return {
      isValid: !!provenanceMsg,
      creator: provenanceMsg?.payer_account_id || 'unknown',
    };
  }

  private async checkDuplicates(ipfsCID: string) {
    // Implementation: Check if CID exists in previous datasets
    return { isDuplicate: false };
  }

  private async scoreQuality(datasetId: string) {
    // Implementation: AI-based quality scoring
    return 85;
  }
}
```

---

## 📊 Analytics Dashboard Component

Create `src/components/analytics/NetworkMetrics.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/services/analytics';

export function NetworkMetrics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await analyticsService.getMarketplaceStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalSales}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalVolume} HBAR</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unique Buyers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.uniqueBuyers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.averagePrice.toFixed(2)} HBAR</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎯 Next Steps

### Week 2 Priorities (Current)

1. **Set up Hgraph SDK** ✅
   ```bash
   npm install @hgraph.io/sdk
   ```

2. **Create HCS Provenance Service**
   - Implement `ProvenanceService` class
   - Test logging to HCS topics
   - Verify message retrieval

3. **Build Carbon Calculator**
   - Implement `CarbonCalculator` class
   - Test with different AI models
   - Create UI component

4. **Implement Analytics Service**
   - Set up Hgraph client
   - Build query functions
   - Test fraud detection

5. **Create Agent Kit Plugins**
   - Dataset Creation Plugin
   - Marketplace Trading Plugin
   - Verification & Analytics Plugin
   - Provider Management Plugin

---

## 📚 Additional Resources

- **Hgraph SDK Docs**: https://docs.hgraph.io
- **Hedera SDK**: https://docs.hedera.com/hedera/sdks-and-apis
- **LangChain**: https://js.langchain.com/docs
- **Next.js 15**: https://nextjs.org/docs

---

## 🐛 Troubleshooting

### Hgraph SDK Connection Issues
```typescript
// Test connection
const client = new HgraphClient();
const result = await client.getTransactionHistory('0.0.123', 1);
console.log(result);
```

### HCS Message Encoding
```typescript
// Proper message encoding
const message = JSON.stringify(data);
const buffer = Buffer.from(message, 'utf-8');
```

### Carbon Calculation Accuracy
```typescript
// Validate calculations
const result = carbonCalculator.calculate('openai', 'gpt-4', 5000);
console.log('Energy:', result.energyKwh, 'kWh');
console.log('CO2:', result.co2Grams, 'g');
```

---

**Ready to build! Start with Week 2 tasks and let's create something amazing! 🚀**
