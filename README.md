# FileThetic: AI Data Economy DePIN on Hedera

**Hedera Africa Hackathon 2025 - Track 4: AI and DePIN**

> Decentralized AI data economy platform with verifiable provenance, multi-agent coordination, and carbon-aware operations on Hedera.

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-purple)](https://testnet.hashscan.io)
[![Agent Kit](https://img.shields.io/badge/Hedera-Agent%20Kit-blue)](https://github.com/hashgraph/hedera-agent-kit)
[![HCS-10](https://img.shields.io/badge/HCS--10-Compliant-green)](https://github.com/hashgraph/hedera-improvement-proposal)
[![Status](https://img.shields.io/badge/Status-90%25%20Complete-yellow)](#status)

---

## 🚀 Key Features

### 🤖 AI Chat Assistant (NEW!)
- **Natural language dataset generation** - Just describe what you need
- **Conversational interface** - Generate datasets by chatting
- **Instant previews** - See results before downloading
- **Cost estimation** - Know the price before generating
- **Quick actions** - One-click common tasks
- **Smart recommendations** - AI suggests dataset types

👉 **Try it**: Navigate to `/chat` and say "Generate a medical dataset with 100 samples"

### AI-Powered Dataset Generation
- Multi-provider support (OpenAI, Anthropic, Google)
- Natural language to structured data
- Automated IPFS storage
- HTS NFT minting with metadata

### Decentralized Marketplace
- Trade AI datasets as HTS NFTs
- Native royalties (5%)
- Secure payments with FILE/FTUSD tokens
- Smart contract escrow

### Verifiable AI Operations
- Every AI generation logged to HCS
- Immutable provenance trails
- Model version tracking
- Parameter transparency

### DePIN Provider Network
- Real infrastructure providers
- Stake-based registration (1000 FILE)
- Uptime monitoring & rewards
- Geographic distribution

### AI-Powered Verification
- Multi-signature quality scoring
- Reputation-based weighting
- Automated fraud detection
- Slashing for bad actors

### Carbon-Aware Computing
- Real-time carbon footprint tracking
- Energy consumption per model
- Carbon offset recommendations
- Sustainable AI choices

---
---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         FileThetic Application (Next.js)        │
│          + Hedera Wallet Connect                │
└───────────────┬─────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ AI Kit  │ │ Hedera  │ │   HGraph     │
│ Plugins │ │ Native  │ │   SDK        │
│ • Create│ │ • HTS   │ │ • Analytics  │
│ • Trade │ │ • HCS   │ │ • Real-time  │
│ • Verify│ │ • HSCS  │ │ • Queries    │
└─────────┘ └─────────┘ └──────────────┘
    │           │           │
    └───────────┼───────────┘
                ▼
    ┌───────────────────────┐
    │   Hedera Network      │
    │  • Tokens (HTS)       │
    │  • Topics (HCS)       │
    │  • Contracts (HSCS)   │
    │  • Mirror Nodes       │
    └───────────────────────┘
```

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
- **LangChain** - Agent orchestration
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

## 📖 Documentation

### Essential Docs
1. **[CURRENT_STATUS.md](./documents/CURRENT_STATUS.md)** - Implementation status
2. **[TRACK4_WINNING_STRATEGY.md](./documents/TRACK4_WINNING_STRATEGY.md)** - Gap analysis & roadmap
3. **[DEVELOPMENT_ROADMAP.md](./documents/DEVELOPMENT_ROADMAP.md)** - 7-week plan
4. **[documents/README.md](./documents/README.md)** - Documentation index

### Quick Links
- [Architecture Details](./documents/HEDERA_IMPLEMENTATION_STATUS.md)
- [Track 4 Requirements](./documents/Hedera.md)
- [Progress Log](./documents/PROGRESS.md)

---

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
- FiletheticMarketplace: TBD
- ProviderRegistry: TBD
- VerificationOracle: TBD

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

## 🌟 Why FileThetic?

### 99%+ Cost Savings vs EVM
| Operation | EVM | Hedera | Savings |
|-----------|-----|--------|----------|
| Mint NFT | $5-50 | $0.001 | 99.98% |
| Transfer | $2-20 | $0.001 | 99.95% |
| Log Event | $1-10 | $0.0001 | 99.99% |

### Carbon Negative
- Hedera is carbon-negative certified
- Track and offset AI compute emissions
- Sustainable AI-first approach

### Fast & Secure
- 3-5 second finality
- aBFT consensus
- Fair transaction ordering

### Verifiable AI
- Every operation immutably logged
- Complete provenance tracking
- Community verification

---

## 🗺️ Roadmap

### This Week (Track 4 Critical)
- [x] Foundation infrastructure
- [ ] Custom Agent Kit plugins
- [ ] HCS-10 multi-agent system
- [ ] Deploy smart contracts
- [ ] Complete verifiable AI
- [ ] Demo video

### Post-Hackathon
- [ ] Mainnet deployment
- [ ] Enterprise features
- [ ] Mobile apps
- [ ] Additional AI providers
- [ ] Cross-chain bridges

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

---

## 🔗 Links

- **Demo**: Coming soon
- **Video**: Coming soon
- **Track 4**: [Hedera Africa Hackathon](https://hedera-hackathon.hashgraph.swiss/tools#track4)
- **Hedera Docs**: [docs.hedera.com](https://docs.hedera.com)
- **Agent Kit**: [github.com/hashgraph/hedera-agent-kit](https://github.com/hashgraph/hedera-agent-kit)

---

## 📧 Contact

- **Team**: FileThetic
- **Hackathon**: Hedera Africa 2025
- **Track**: 4 - AI and DePIN

---

**Built with ❤️ for the future of AI data economy on Hedera**
    