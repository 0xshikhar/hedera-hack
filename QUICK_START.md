# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment Variables

Create `.env` file:

```env
# Required: At least one AI provider
OPENAI_API_KEY="sk-..."

# Optional: Additional AI providers
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# Required: Hedera Network
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"

# Required: Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_ID="..."

# Optional: HGraph Analytics
HGRAPH_API_KEY="..."
```

### 3. Initialize Hedera Resources

```bash
bun run hedera:init
```

This creates:
- Dataset NFT token
- FILE utility token
- Payment token
- HCS topics for logging

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
bun run build
bun run start
```

## 📖 Common Tasks

### Create an AI Agent

```typescript
import { initializeAgent } from '@/server/initialize-agent';

// Use OpenAI
const agent = await initializeAgent('0.0.123456', 'openai', 'gpt-4o-mini');

// Use Anthropic
const agent = await initializeAgent('0.0.123456', 'anthropic', 'claude-3-5-sonnet-20241022');

// Use Google
const agent = await initializeAgent('0.0.123456', 'google', 'gemini-1.5-flash');

// Run the agent
const result = await agent.invoke({
  input: "Create a dataset with 100 customer records"
});
```

### Generate a Dataset

```typescript
import { AIModelFactory } from '@/lib/ai/model-factory';

const model = AIModelFactory.createModel({
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
});

const response = await model.invoke(`
  Generate a JSON array of 10 customer records with:
  - name
  - email
  - age
  - city
`);

console.log(response.content);
```

### Query Hedera Data with HGraph

```typescript
import { hgraphClient } from '@/lib/hgraph/client';

// Get recent transactions
const txs = await hgraphClient.getTransactionHistory('0.0.123456', 10);

// Get topic messages
const messages = await hgraphClient.getTopicMessages('0.0.7158238', 10);

// Subscribe to real-time data
hgraphClient.subscribeToTransactions('0.0.123456', (tx) => {
  console.log('New transaction:', tx);
});
```

### Check Available AI Providers

```typescript
import { AIModelFactory } from '@/lib/ai/model-factory';

// Get configured providers
const providers = AIModelFactory.getConfiguredProviders();
console.log(providers); // ['openai', 'anthropic', 'google']

// Get models for a provider
const models = AIModelFactory.getModelsForProvider('openai');
console.log(models);
/*
[
  { id: 'gpt-4o', name: 'GPT-4o', costPer1MTokens: 5.0, ... },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', costPer1MTokens: 0.15, ... },
  ...
]
*/

// Estimate cost
const cost = AIModelFactory.estimateCost('openai', 'gpt-4o', 50000);
console.log(`Cost: $${cost}`); // Cost: $0.25
```

## 🎯 Recommended Models

### For Development (Cheap & Fast)
- **OpenAI:** `gpt-4o-mini` ($0.15/1M tokens)
- **Anthropic:** `claude-3-haiku-20240307` ($0.25/1M tokens)
- **Google:** `gemini-1.5-flash` ($0.075/1M tokens) ⭐ Cheapest

### For Production (Best Quality)
- **OpenAI:** `gpt-4o` ($5/1M tokens)
- **Anthropic:** `claude-3-5-sonnet-20241022` ($3/1M tokens) ⭐ Best value
- **Google:** `gemini-1.5-pro` ($1.25/1M tokens)

## 🔧 Troubleshooting

### Build Errors

**Error:** `Cannot find module '@langchain/anthropic'`
```bash
bun add @langchain/anthropic
```

**Error:** `Cannot find module '@langchain/google-genai'`
```bash
bun add @langchain/google-genai
```

### Runtime Errors

**Error:** `API key not configured`
- Add the API key to your `.env` file
- Restart the dev server

**Error:** `HGraph query failed`
- Check your network connection
- Verify `HEDERA_NETWORK` is set correctly
- Add `HGRAPH_API_KEY` if needed

### Hedera Errors

**Error:** `Account not found`
- Run `bun run hedera:init` to create resources
- Check `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`

**Error:** `Insufficient balance`
- Add HBAR to your testnet account
- Get free testnet HBAR from [Hedera Portal](https://portal.hedera.com)

## 📚 Documentation

- [AI Model Setup](./AI_MODEL_SETUP.md) - Detailed AI provider setup
- [Production Build Ready](./PRODUCTION_BUILD_READY.md) - Production deployment guide
- [Setup Complete](./SETUP_COMPLETE.md) - Full implementation summary
- [Migration Complete](./MIGRATION_COMPLETE.md) - Migration details

## 🎓 Learn More

- [Hedera Docs](https://docs.hedera.com)
- [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit)
- [LangChain JS](https://js.langchain.com)
- [HGraph SDK](https://docs.hgraph.io)

## 💡 Tips

1. **Use environment-specific configs**
   - Development: Use cheap models (gpt-4o-mini, gemini-flash)
   - Production: Use best models (claude-3.5-sonnet, gpt-4o)

2. **Monitor costs**
   - Use `AIModelFactory.estimateCost()` before generation
   - Set up usage alerts in your AI provider dashboard

3. **Cache HGraph queries**
   - HGraph data is immutable once finalized
   - Cache transaction/topic data to reduce API calls

4. **Test on testnet first**
   - Always test on Hedera testnet before mainnet
   - Use `HEDERA_NETWORK="testnet"` in development

5. **Use subscriptions wisely**
   - HGraph subscriptions are WebSocket-based
   - Clean up subscriptions when components unmount

## 🚀 Next Steps

1. **Build your first dataset**
   - Use the dataset creation form
   - Try different AI providers
   - Compare quality and cost

2. **Explore the marketplace**
   - Browse existing datasets
   - Purchase datasets with FILE tokens
   - List your own datasets

3. **Set up verification**
   - Become a verifier
   - Earn rewards for verifying datasets
   - Build reputation

4. **Deploy to production**
   - Set up mainnet accounts
   - Configure production environment
   - Deploy to Vercel/Netlify

---

**Need help?** Check the documentation or open an issue on GitHub.

**Ready to build!** 🎉
