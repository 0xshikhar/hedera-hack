# FileThetic

> **Decentralized Physical Infrastructure Network (DePIN) for the AI Data Economy**  
> Built natively on Hedera for Track 4: AI and DePIN - Hedera Africa Hackathon 2025

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-blue)](https://hedera.com)
[![Track 4](https://img.shields.io/badge/Track-AI%20%26%20DePIN-green)](https://hedera-hackathon.hashgraph.swiss/tools#track4)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Overview

**FileThetic** is an advanced DePIN platform that leverages Hedera's native services (HTS, HCS, HSCS) to create an intelligent, autonomous system for AI dataset creation, verification, trading, and infrastructure management.

### Key Features
- 🤖 **AI Agent Autonomy** - Custom Hedera Agent Kit plugins + ElizaOS
- 🔗 **Native Hedera Integration** - HTS, HCS, HSCS (not just EVM)
- ✅ **Verifiable AI** - Complete audit trail via HCS
- 🌐 **DePIN Network** - Global storage provider infrastructure
- 💬 **HCS-10 Compliant** - Multi-agent communication standard
- 💰 **10x Lower Costs** - Native token services vs ERC standards

---

## 📚 Documentation

### Planning Documents
1. **[IMPLEMENTATION_PLAN.md](./documents/IMPLEMENTATION_PLAN.md)** - Complete technical implementation plan
2. **[HEDERA_TECHNICAL_SPEC.md](./documents/HEDERA_TECHNICAL_SPEC.md)** - Hedera services integration details
3. **[COMPARISON_ANALYSIS.md](./documents/COMPARISON_ANALYSIS.md)** - U2U vs Hedera comparison
4. **[DEVELOPMENT_ROADMAP.md](./documents/DEVELOPMENT_ROADMAP.md)** - 7-week development timeline
5. **[EXECUTIVE_SUMMARY.md](./documents/EXECUTIVE_SUMMARY.md)** - Project overview and hackathon submission

### Quick Links
- **Track 4 Requirements**: https://hedera-hackathon.hashgraph.swiss/tools#track4
- **Hedera Docs**: https://docs.hedera.com
- **Agent Kit**: https://github.com/hashgraph/hedera-agent-kit
- **ElizaOS**: https://github.com/elizaos/eliza

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Bun or npm
- Hedera Testnet account
- API keys (OpenAI, WalletConnect)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/filethetic-hedera
cd filethetic-hedera

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your keys to .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Required Environment Variables

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=""
HEDERA_PRIVATE_KEY=""
HEDERA_NETWORK="testnet"

# AI Provider
OPENAI_API_KEY=""

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_ID=""

# Database (Optional)
DATABASE_URL=""
```

---

## 🏗️ Architecture

```
Frontend (Next.js 15 + TypeScript)
    ↓
Hedera Agent Kit + Custom Plugins
    ↓
┌─────────────────────────────────┐
│  HTS (NFTs & Tokens)            │
│  HCS (Consensus & Audit Trail)  │
│  HSCS (Smart Contracts)         │
│  HFS (File Service)             │
└─────────────────────────────────┘
    ↓
Hedera Network (10,000 TPS, aBFT)
    ↓
IPFS Storage Network (DePIN)
```

---

## 💡 Key Improvements Over U2U Version

| Feature | U2U | Hedera | Improvement |
|---------|-----|--------|-------------|
| NFT Standard | ERC-721 | HTS Native | 10x lower fees |
| Consensus | Events | HCS Topics | Immutable audit trail |
| Performance | 1,000 TPS | 10,000 TPS | 10x throughput |
| Cost | $0.01-0.05 | $0.001-0.01 | 90% cheaper |
| AI Agents | Manual | Autonomous | 24/7 operation |
| Agent Comm | None | HCS-10 | Multi-agent coordination |

---

## 🎨 Custom Hedera Agent Kit Plugins

1. **Dataset Creation Plugin** - Generate & mint AI datasets
2. **Marketplace Trading Plugin** - Autonomous buying/selling
3. **Verification Plugin** - AI-powered quality verification
4. **Provider Management Plugin** - DePIN infrastructure operations

---

## 📊 Project Status

**Current Phase**: Planning Complete ✅  
**Next Phase**: Week 1 - Foundation & Smart Contracts  
**Target Completion**: 7 weeks  
**Hackathon**: Hedera Africa Hackathon 2025 - Track 4

### Milestones
- [x] Requirements analysis
- [x] Architecture design
- [x] Documentation complete
- [ ] Smart contracts development
- [ ] Agent Kit plugins
- [ ] Frontend development
- [ ] Testing & deployment

---

## 🤝 Contributing

We welcome contributions! Please see our planning documents for areas where you can help.

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

---

## 📞 Contact

- **Email**: hi@decenlabs.com
- **Telegram**: @Shikhar0x
- **GitHub**: [Repository]

---

**FileThetic-Hedera: Decentralized. Verifiable. Autonomous.**

*Built for Hedera Africa Hackathon 2025 - Track 4: AI and DePIN*