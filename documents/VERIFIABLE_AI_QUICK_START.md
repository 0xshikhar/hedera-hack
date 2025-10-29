# Verifiable & Sustainable AI - Quick Start Guide

## 🚀 Access the Dashboard

Navigate to: **`/verifiable-ai`**

This comprehensive dashboard provides 5 main sections:

---

## 📊 1. AI Insights Tab

**What it does**: Displays real-time AI-powered insights from mirror node data

**Features**:
- Market trend detection
- Network anomalies
- Opportunity identification
- Risk alerts
- Actionable recommendations

**Auto-refresh**: Every 60 seconds

**Use Case**: Monitor marketplace activity and get AI recommendations for optimal dataset creation timing

---

## 🏥 2. Network Health Tab

**What it does**: Real-time Hedera network health monitoring

**Metrics Tracked**:
- Overall health score (0-100)
- Transaction throughput
- Success rate
- Average latency
- Network stability

**Status Levels**:
- 🟢 **Healthy** (>85%): Safe to proceed with operations
- 🟡 **Degraded** (70-85%): Monitor closely
- 🔴 **Critical** (<70%): Consider delaying non-critical operations

**Auto-refresh**: Every 30 seconds

**Use Case**: Check network health before submitting large transactions or dataset operations

---

## 🌱 3. Carbon Tracking Tab

### A. Carbon-Aware Model Selector

**What it does**: Recommends the most carbon-efficient AI model for your task

**How to Use**:
1. Select task complexity:
   - **Simple**: Quick responses (e.g., classification)
   - **Moderate**: Standard tasks (e.g., dataset generation)
   - **Complex**: Advanced reasoning (e.g., multi-step analysis)

2. Enter estimated tokens (default: 1000)

3. (Optional) Set max carbon budget in grams CO₂

4. Click "Get Recommendation"

**You'll Get**:
- ✅ Recommended model with lowest carbon footprint
- 📊 Carbon footprint (g CO₂)
- 💰 Estimated cost
- ⚡ Performance score
- 🔋 Energy consumption (kWh)
- 💡 Alternative model options
- 📉 Savings vs. least efficient option

**Example Output**:
```
Recommended: openai/gpt-4o-mini
Carbon: 12.5g CO₂
Cost: $0.0015
Performance: 85/100
Savings: 45.2g CO₂ vs. least efficient
```

### B. Carbon Budget Monitor

**What it does**: Track your carbon budget usage in real-time

**How to Use**:
1. Enter current usage (g CO₂)
2. Enter your budget (g CO₂)
3. Click "Check Budget Status"

**Status Indicators**:
- 🟢 **Safe** (<50%): Good to go
- 🟡 **Warning** (50-75%): Monitor usage
- 🔴 **Critical** (>75%): Consider offsets

**You'll Get**:
- Budget usage percentage
- Remaining budget
- Alerts if approaching limits
- Offset recommendations:
  - Trees to plant
  - Estimated cost
  - Multiple offset methods

**Use Case**: Track cumulative carbon emissions across multiple dataset generations

---

## 🛡️ 4. Provenance Tab

**What it does**: View complete immutable audit trail for any dataset

**How to Use**:
1. Enter dataset ID
2. Click "Search"

**You'll See**:
- Complete operation history
- Timestamps for each operation
- AI model used (provider/model)
- Carbon footprint per operation
- Verification status
- Model fingerprint (for reproducibility)
- Input/output hashes (for integrity)
- Energy consumption

**Verification Status**:
- ✅ **Verified**: Community approved
- ⏳ **Pending**: Awaiting verification
- ❌ **Failed**: Verification failed

**Use Case**: 
- Verify dataset authenticity
- Check carbon footprint history
- Audit AI operations
- Ensure reproducibility

---

## 📈 5. Statistics Tab

**What it does**: Comprehensive analytics dashboard

**Displays**:

### Overview Cards
- Total operations tracked
- Verification rate
- Total carbon emissions
- Average carbon per dataset

### Charts
- **Provider Distribution** (Pie Chart): Shows which AI providers are most used
- **Operation Types** (Bar Chart): Breakdown of operation types
- **Top AI Models** (Ranking): Most frequently used models

**Auto-refresh**: Every 60 seconds

**Use Case**: 
- Understand platform usage patterns
- Track carbon trends
- Monitor verification rates
- Identify popular models

---

## 🔌 API Endpoints

### Analytics APIs

#### Get AI Insights
```bash
GET /api/analytics/insights?limit=10
```

**Response**:
```json
{
  "success": true,
  "insights": [
    {
      "type": "opportunity",
      "title": "High Demand for medical datasets",
      "description": "medical showing 25.3% growth",
      "confidence": 0.92,
      "impact": "high",
      "recommendation": "Consider creating more datasets in medical category"
    }
  ]
}
```

#### Get Network Health
```bash
GET /api/analytics/network-health
```

**Response**:
```json
{
  "success": true,
  "health": {
    "overall": 95.2,
    "status": "healthy",
    "components": {
      "transactionThroughput": 92.5,
      "successRate": 98.7,
      "averageLatency": 95.0,
      "networkStability": 98.0
    },
    "alerts": []
  }
}
```

#### Get Pricing Recommendation
```bash
POST /api/analytics/pricing-recommendation
Content-Type: application/json

{
  "category": "medical",
  "quality": 85,
  "size": 10000
}
```

**Response**:
```json
{
  "success": true,
  "recommendation": {
    "recommendedPrice": 12.50,
    "priceRange": {
      "min": 10.00,
      "max": 15.00
    },
    "reasoning": "Base market price: 10.00 tokens. Quality adjustment: 135%. Size adjustment: 100%. Demand adjustment: 115%. Category trend: increasing."
  }
}
```

### Carbon APIs

#### Get Carbon-Efficient Model
```bash
POST /api/carbon/recommend-model
Content-Type: application/json

{
  "taskType": "moderate",
  "estimatedTokens": 1000,
  "maxCarbonBudget": 100
}
```

#### Monitor Carbon Budget
```bash
POST /api/carbon/monitor-budget
Content-Type: application/json

{
  "currentUsage": 750,
  "budget": 1000
}
```

#### Get Carbon-Aware Scheduling
```bash
GET /api/carbon/scheduling
```

**Response**:
```json
{
  "success": true,
  "scheduling": {
    "bestTime": "10:00-16:00",
    "carbonIntensity": 200,
    "recommendation": "Current time is optimal - high solar generation"
  }
}
```

### Provenance APIs

#### Get Provenance Statistics
```bash
GET /api/provenance/stats
```

#### Get Provenance History
```bash
GET /api/provenance/history?datasetId=dataset_123
```

#### Submit Verification Vote
```bash
POST /api/provenance/verify
Content-Type: application/json

{
  "datasetId": "dataset_123",
  "verifier": "0.0.123456",
  "vote": "upvote",
  "comments": "High quality dataset"
}
```

---

## 💻 Integration Examples

### Example 1: Generate Dataset with Full Tracking

```typescript
import { Client } from '@hashgraph/sdk';
import { EnhancedGenerationService } from '@/services/enhanced-generation-service';

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

// Create service
const service = new EnhancedGenerationService(client);

// Generate with full tracking
const result = await service.generateWithTracking(
  input,
  output,
  {
    datasetId: 'my_dataset_123',
    enableCarbonOptimization: true,
    taskComplexity: 'moderate',
    maxCarbonBudget: 100, // 100g CO2 max
    creator: '0.0.123456',
    sourceDataset: {
      name: 'huggingface/dataset',
      config: 'default',
      split: 'train',
      samplesUsed: 100,
      inputFeature: 'text',
    },
  }
);

console.log('Carbon footprint:', result.carbonFootprint.co2Grams, 'g CO2');
console.log('Provenance TX:', result.provenance.transactionId);
console.log('Model used:', result.provider, '/', result.model);
```

### Example 2: Get Pricing Insights

```typescript
const insights = await service.getPricingInsights(
  'medical',  // category
  85,         // quality (0-100)
  10000       // size
);

console.log('Recommended price:', insights.recommendedPrice);
console.log('Price range:', insights.priceRange);
console.log('Market trend:', insights.marketTrends);
```

### Example 3: Monitor Network Before Operation

```typescript
const { health, shouldProceed, reasoning } = 
  await service.getNetworkRecommendations();

if (shouldProceed) {
  console.log('✅ Network healthy, proceeding...');
  // Perform operation
} else {
  console.log('⚠️ Network degraded:', reasoning);
  // Wait or notify user
}
```

### Example 4: Track Carbon Budget

```typescript
const monitoring = await service.monitorCarbonUsage(
  currentUsage: 750,
  budget: 1000
);

if (monitoring.status === 'critical') {
  console.log('🚨 Carbon budget critical!');
  console.log('Offset recommendation:', monitoring.offsetRecommendation);
}
```

---

## 🎯 Best Practices

### 1. Always Enable Carbon Optimization
```typescript
enableCarbonOptimization: true
```
This ensures you're using the most efficient model for your task.

### 2. Set Carbon Budgets
Define maximum carbon footprint per operation to stay within sustainability goals.

### 3. Check Network Health
Before large operations, verify network health is >85%.

### 4. Track Provenance
Always log operations to HCS for complete audit trails.

### 5. Monitor Insights
Check AI insights regularly for marketplace opportunities.

### 6. Use Pricing Recommendations
Leverage AI-powered pricing for competitive advantage.

---

## 🏆 Track 4 Alignment

This implementation demonstrates:

✅ **Verifiable AI**
- Complete transparency in AI operations
- Immutable audit trails via HCS
- Community verification system
- Training data lineage tracking

✅ **Sustainable AI**
- Carbon-aware model selection
- Real-time carbon budget monitoring
- Automated efficiency optimization
- Offset recommendations

✅ **AI x Mirror Node**
- Advanced analytics from Hgraph SDK
- Predictive insights
- Real-time decision-making
- Network health monitoring

---

## 📚 Additional Resources

- **Implementation Details**: See `TRACK4_IMPLEMENTATION_COMPLETE.md`
- **Service Documentation**: Check individual service files
- **API Reference**: See API route files in `src/app/api/`
- **Component Usage**: Check component files in `src/components/`

---

## 🆘 Troubleshooting

### Issue: "Hedera credentials not configured"
**Solution**: Ensure `.env` has:
```
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
```

### Issue: "No insights available"
**Solution**: 
- Check network connection
- Verify Hgraph SDK is configured
- Ensure HCS topics have messages

### Issue: "Failed to fetch provenance history"
**Solution**:
- Verify dataset ID is correct
- Check HCS topic ID in `.env`
- Ensure Hedera client is initialized

---

**Ready to build verifiable and sustainable AI! 🚀🌱**
