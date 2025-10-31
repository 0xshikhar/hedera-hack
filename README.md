<div align="center">

# 🚀 FileThetic
### **DePIN for AI Data Economy on Hedera**

*The world's first Decentralized Physical Infrastructure Network purpose-built for the $200B+ AI data market*

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-purple)](https://testnet.hashscan.io)
[![Agent Kit](https://img.shields.io/badge/Hedera-Agent%20Kit-blue)](https://github.com/hashgraph/hedera-agent-kit)
[![HCS-10](https://img.shields.io/badge/HCS--10-Compliant-green)](https://github.com/hashgraph/hedera-improvement-proposal)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

[🎯 Live Demo](#) • [📖 Documentation](./documents/README.md) • [🎥 Video Demo](#) • [🏆 Hackathon Track 4](https://hedera-hackathon.hashgraph.swiss/tools#track4)

</div>

## 🎯 The Problem

### **AI Data Market is Broken**

The global AI data market is projected to reach **$200B+ by 2030**, yet:

- **🔒 Centralized Control**: Big tech monopolizes high-quality datasets
- **💰 Prohibitive Costs**: Enterprise datasets cost $10K-$100K+ with restrictive licensing
- **🚫 Privacy Concerns**: Real data contains sensitive information that can't be shared
- **❌ No Verification**: No way to verify data quality or AI model authenticity before purchase
- **🌍 Infrastructure Gap**: No decentralized physical infrastructure for AI data operations
- **⚡ Unsustainable**: AI compute is energy-intensive with no carbon tracking

---

## 💡 Our Solution

### **FileThetic: The First DePIN for AI Data Economy**

We're building a **Decentralized Physical Infrastructure Network** that democratizes access to AI-generated synthetic datasets while ensuring creators are fairly compensated and operations are verifiable.

<div align="center">

### **🏗️ Real Infrastructure + 🤖 AI Agents + ⛓️ Hedera = FileThetic**

</div>

---

## ✨ Key Features

### 🤖 **AI Chat Assistant**
> Natural language to production-ready datasets in seconds

- **Conversational Generation**: "Generate 1000 customer records with purchase history"
- **Multi-Provider AI**: OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5
- **Instant Previews**: See results before committing
- **Cost Transparency**: Know exact pricing upfront
- **Smart Recommendations**: AI suggests optimal dataset configurations

**Try it**: `/chat` → "Create a medical dataset with 100 patient records"

### 🏢 **DePIN Provider Network**
> Real infrastructure providers, not just smart contracts

- **Stake-Based Registration**: 1000 FILE tokens to become a provider
- **Geographic Distribution**: Providers across multiple regions
- **Uptime Monitoring**: Real-time health checks and SLA tracking
- **Reward Distribution**: Earn FILE tokens for reliable service
- **Slashing Mechanism**: Bad actors lose stake automatically

**Live**: `/providers` → View 5+ active infrastructure providers

### 🔐 **Verifiable AI Operations**
> Every AI operation is cryptographically proven on Hedera

- **HCS Audit Trails**: All AI generations logged immutably
- **Model Provenance**: Track which AI model generated what data
- **Parameter Transparency**: Full visibility into generation parameters
- **Multi-Signature Verification**: Community-driven quality scoring
- **Fraud Detection**: Automated detection of synthetic or manipulated data

**Powered by**: Hedera Consensus Service (HCS) + Agent Kit

### 🛒 **Decentralized Marketplace**
> Trade AI datasets as native Hedera NFTs

- **HTS NFT Collections**: Datasets as first-class Hedera tokens
- **Native Royalties**: 5% creator royalties built into HTS
- **Dual Token Economy**: FILE (utility) + FTUSD (payments)
- **Smart Contract Escrow**: Trustless transactions via HSCS
- **Instant Settlements**: 3-5 second finality

**Economics**: 2.5% platform fee, 5% creator royalties, 92.5% to creator

### 🌱 **Carbon-Aware Computing**
> First AI platform with carbon tracking and offset recommendations

- **Real-Time Tracking**: Monitor carbon footprint per AI generation
- **Model Comparison**: See energy consumption across providers
- **Offset Integration**: Automatic carbon offset recommendations
- **Sustainability Score**: Rate datasets by environmental impact

**Why it matters**: Hedera is carbon-negative certified ♻️

### 📊 **Advanced Analytics**
> HGraph SDK-powered real-time insights

- **Marketplace Trends**: Live transaction volume and pricing data
- **Provider Performance**: Uptime, latency, and reliability metrics
- **Dataset Analytics**: Downloads, ratings, and revenue tracking
- **Network Health**: Real-time DePIN infrastructure monitoring

**Powered by**: HGraph SDK + Mirror Node API

---

## 🏗️ System Architecture

### **Three-Layer DePIN Architecture**

```
┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Next.js   │  │  AI Chat   │  │ Marketplace│  │  Provider  │ │
│  │  Frontend  │  │  Interface │  │    UI      │  │  Dashboard │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Hedera    │  │  LangChain │  │   HGraph   │  │   IPFS     │ │
│  │ Agent Kit  │  │   Agents   │  │    SDK     │  │ Lighthouse │ │
│  │  Plugins   │  │ Multi-AI   │  │  GraphQL   │  │   Pinata   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER (DePIN)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Hedera Network                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   HTS    │  │   HCS    │  │   HSCS   │  │  Mirror  │  │  │
│  │  │  Tokens  │  │  Topics  │  │Contracts │  │   Nodes  │  │  │
│  │  │ • NFTs   │  │ • Audit  │  │• Registry│  │ • Query  │  │  │
│  │  │ • FILE   │  │ • Verify │  │• Market  │  │ • Events │  │  │
│  │  │ • FTUSD  │  │ • Agents │  │• Oracle  │  │ • Stats  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Physical Infrastructure Providers (DePIN)          │  │
│  │  🖥️ Storage  🌐 Compute  📡 Network  🔐 Verification      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### **Key Architectural Decisions**

**Why Hedera?**
- ⚡ **3-5 second finality** vs 12-60s on EVM chains
- 💰 **99.9% cost savings** ($0.001 vs $5-50 per NFT mint)
- 🌱 **Carbon negative** certified network
- 🔒 **aBFT consensus** - mathematically proven security
- 📊 **Native HCS** - built-in audit trails without gas fees

**Why DePIN?**
- 🏢 **Real infrastructure** providers, not just validators
- 💪 **Stake-based incentives** align provider interests
- 🌍 **Geographic distribution** ensures resilience
- 📈 **Scalable** to thousands of providers

---

## 🛠️ Tech Stack

### Blockchain
- **Hedera Hashgraph** - Core blockchain
- **HTS** - Native token standard (NFTs + Fungible)
- **HCS** - Consensus service for audit trails
- **HSCS** - Smart contracts (Solidity 0.8.20)
- **Hedera Agent Kit** - AI agent framework
- **Standards SDK** - HCS-10 compliance
- **HGraph SDK** - Mirror node queries

### AI & Agents
- **LangChain (utilizing Hedera Agent Kit)** - Agent orchestration
- **OpenAI** - GPT-4o, GPT-4o Mini
- **Anthropic** - Claude 3.5 Sonnet
- **Google** - Gemini 1.5 Pro/Flash

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library
- **Hedera Wallet Connect** - Wallet integration

### Storage & APIs
- **IPFS** (Lighthouse) - Decentralized storage
- **GraphQL** - HGraph queries


## 🎯 Hedera Resources

### Created on Testnet
**Tokens (HTS)**:
- Dataset NFT: `0.0.7159775`
- FILE Token: `0.0.7159776`
- FTUSD Token: `0.0.7159777`

**Topics (HCS)**:
- Dataset Metadata: `0.0.7159779`
- Verification Logs: `0.0.7159780`
- Agent Communication: `0.0.7159781`
- Audit Trail: `0.0.7159782`
- Marketplace Events: `0.0.7159783`

**Smart Contracts (HSCS)**:
- FiletheticMarketplace: `0.0.7158321`
- ProviderRegistry: `0.0.7158323`
- VerificationOracle: `0.0.7158325`

---

## 💡 Usage Examples

### Create Dataset with AI Agent
```typescript
import { initializeAgent } from '@/server/initialize-agent';

const agent = await initializeAgent('0.0.123456', 'openai');

const result = await agent.invoke({
  input: "Create a customer dataset with 100 rows including name, email, age, and purchase history"
});
// Returns: Dataset created, minted as NFT, logged to HCS
```

### Query with HGraph SDK
```typescript
import { hgraphClient } from '@/lib/hgraph/client';

// Get dataset transactions
const txs = await hgraphClient.getTransactionHistory(
  '0.0.7159779',
  10
);

// Real-time subscription
hgraphClient.subscribeToTopicMessages('0.0.7159779', (msg) => {
  console.log('New dataset:', msg);
});
```

### Verify Dataset Quality
```typescript
import { VerificationPlugin } from '@/lib/agents';

const verifier = new VerificationPlugin(hederaClient);
const score = await verifier.verifyDataset(datasetId);
// Returns: Quality score 0-100, logs to HCS
```

---

## 💼 Market Opportunity

### **$200B+ AI Data Market by 2030**

| Market Segment | Size (2030) | FileThetic TAM |
|----------------|-------------|----------------|
| **Synthetic Data** | $11.5B | $11.5B (100%) |
| **AI Training Data** | $85B | $25B (30%) |
| **Data Marketplaces** | $15B | $10B (67%) |
| **DePIN Infrastructure** | $3.5T | $50B (1.4%) |
| **Total Addressable Market** | - | **$96.5B** |

### **Target Customers**

- **🏛️ Enterprises**: Fortune 500 companies ($50K-$500K/year)
- **🏛️ Research Institutions**: 40,000+ universities ($10K-$100K/year)
- **👥 Data Scientists**: 12M+ professionals globally ($100-$5K/year)
- **🚀 AI Startups**: 15,000+ startups ($5K-$50K/year)

---


## 🏆 Competitive Advantages

### **1. First-Mover in DePIN + AI Data**

No direct competitors combining:
- ✅ Decentralized physical infrastructure
- ✅ AI-generated synthetic datasets
- ✅ Verifiable AI operations
- ✅ Carbon-aware computing

### **2. 99.9% Cost Advantage**

| Operation | Ethereum | Polygon | Hedera | **Savings** |
|-----------|----------|---------|--------|-------------|
| Mint NFT | $50 | $0.10 | $0.001 | **99.998%** |
| Transfer Token | $20 | $0.05 | $0.001 | **99.995%** |
| Log to Chain | $10 | $0.02 | $0.0001 | **99.999%** |
| **1000 Operations** | **$80,000** | **$170** | **$1.10** | **99.999%** |

### **3. Technical Moat**

- **🔐 Proprietary Verification System**: Multi-agent quality scoring with reputation weighting
- **🌱 Carbon Tracking Integration**: First platform to track AI compute carbon footprint
- **📊 HGraph SDK Integration**: Real-time analytics without centralized databases

### **4. Network Effects**

```
More Creators → Better Dataset Variety → More Buyers
     ↑                                          ↓
     ←────── Higher Revenue for Creators ───────┘

More Providers → Better Infrastructure → Lower Costs
     ↑                                          ↓
     ←────── More Users & Transactions ─────────┘
```

---

## 💰 Business Model & Economics

### **Revenue Streams**

1. **Transaction Fees**: 2.5% on all dataset purchases → $125K/month (Month 12)
2. **Provider Staking**: 10% annual fee on 1000 FILE stakes → $10K/month (Month 12)
3. **Premium Features**: Analytics, priority AI, custom SLAs → $15K/month (Month 12)
4. **Enterprise Licensing**: White-label solutions (Future)

### **Unit Economics**

**Per Dataset Transaction**:
- Average Sale Price: $500
- Platform Fee (2.5%): $12.50
- Creator Royalty (5%): $25.00
- Creator Net: $462.50
- **Platform Margin**: 100% (pure fee revenue)

### **Financial Projections (12 Months)**

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Active Users | 1,000 | 5,000 | 20,000 |
| Datasets Created | 500 | 3,000 | 15,000 |
| Monthly Transactions | 100 | 1,000 | 10,000 |
| Providers | 10 | 30 | 100 |
| **Monthly Revenue** | **$1.3K** | **$13K** | **$150K** |
| **Annual Run Rate** | **$15K** | **$156K** | **$1.8M** |

---

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 18+
node --version

# Bun (recommended) or npm
bun --version
```

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/filethetic-hedera
cd filethetic-hedera
bun install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Add your keys:
```env
# AI Provider (choose one or more)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# Hedera Account
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_ID="..."
```

### 3. Initialize Hedera
```bash
# Create tokens & topics (one-time setup)
bun run hedera:init

# This creates:
# - Dataset NFT collection
# - FILE utility token
# - FTUSD payment token
# - 5 HCS topics
# - Updates .env with IDs
```

### 4. Deploy Contracts (Optional)
```bash
cd contracts
forge build
node hedera/deploy.js
```

### 5. Run Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---


## 🗺️ Roadmap

### **🏆 Hackathon Phase (Current)**
- [x] Core Hedera infrastructure (HTS, HCS, HSCS)
- [x] AI chat assistant with multi-provider support
- [x] DePIN provider network with staking
- [x] Verifiable AI operations with HCS logging
- [x] Marketplace with NFT minting
- [x] Carbon tracking and analytics
- [ ] Custom Agent Kit plugins (90% complete)
- [ ] HCS-10 multi-agent communication (80% complete)
- [ ] Demo video and documentation

### **Phase 1: Mainnet Launch (Months 1-3)**
- [ ] Deploy to Hedera mainnet
- [ ] Security audit of smart contracts
- [ ] Onboard 10 infrastructure providers
- [ ] Launch with 1,000 beta users
- [ ] Integrate 3 additional AI providers

### **Phase 2: Enterprise Features (Months 4-6)**
- [ ] Advanced analytics dashboard
- [ ] Custom SLA support
- [ ] White-label solutions
- [ ] API for third-party integrations
- [ ] Enterprise billing and invoicing

### **Phase 3: Scale & Expansion (Months 7-12)**
- [ ] Cross-chain bridges (Ethereum, Polygon)
- [ ] Mobile apps (iOS, Android)
- [ ] AI model marketplace (trade trained models)
- [ ] Global provider network (100+ providers)
- [ ] Academic partnerships program

### **Phase 4: Ecosystem (Year 2)**
- [ ] DAO governance for protocol decisions
- [ ] Token launch (FILE mainnet)
- [ ] Staking rewards program
- [ ] Developer grants program
- [ ] Integration with major ML frameworks

---

## 🔗 Links

- **Demo**: [https://filethetic.shikhar.xyz](https://filethetic.shikhar.xyz)
- **Video**: Coming soon

---


### **Hedera Resources**
- 🏆 **Track 4**: [Hedera Africa Hackathon](https://hedera-hackathon.hashgraph.swiss/tools#track4)
- 📖 **Hedera Docs**: [docs.hedera.com](https://docs.hedera.com)
- 🤖 **Agent Kit**: [github.com/hashgraph/hedera-agent-kit](https://github.com/hashgraph/hedera-agent-kit)
- 🔍 **Testnet Explorer**: [testnet.hashscan.io](https://testnet.hashscan.io)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.


<div align="center">

### **🚀 FileThetic: Building the Future of AI Data Economy on Hedera**

*Where Real Infrastructure Meets Verifiable AI*

**Built with ❤️ for the Hedera community**

</div>
    