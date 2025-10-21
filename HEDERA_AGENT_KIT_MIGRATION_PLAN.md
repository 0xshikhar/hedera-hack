# Hedera Agent Kit & LangChain Migration Plan

## 🎯 Objective
Migrate FileThetic to use **Hedera Agent Kit** and **LangChain** exclusively for all AI operations, removing direct AI provider SDK dependencies.

## 📊 Current State Analysis

### ✅ Already Using (Keep)
- `hedera-agent-kit`: ^3.0.4
- `langchain`: ^0.3.30
- `@langchain/core`: ^0.3.66
- `@langchain/openai`: ^0.6.2
- `@hashgraph/sdk`: ^2.67.0

### ❌ Remove (Not Needed)
- `openai` - Direct SDK (use LangChain instead)
- `@anthropic-ai/sdk` - Not installed, causing build error
- `@google/generative-ai` - Not installed, causing build error

### 🔄 Migration Strategy
Use **LangChain's chat models** instead of direct AI provider SDKs:
- `@langchain/openai` for OpenAI models (already installed)
- `@langchain/anthropic` for Anthropic models (add if needed)
- `@langchain/google-genai` for Google models (add if needed)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FileThetic Frontend                       │
│  (Next.js + React + Hedera Wallet Connect)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Hedera Agent Kit Plugins                        │
│  • DatasetCreationPlugin (LangChain Tool)                   │
│  • MarketplacePlugin (LangChain Tool)                       │
│  • VerificationPlugin (LangChain Tool)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  LangChain   │ │  Hedera  │ │   Services   │
│ Chat Models  │ │   SDK    │ │  (Carbon,    │
│              │ │          │ │  Provenance) │
└──────────────┘ └──────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│        AI Provider APIs                      │
│  (OpenAI, Anthropic, Google via LangChain) │
└─────────────────────────────────────────────┘
```

## 📝 Implementation Steps

### Step 1: Update Dependencies ✅

**Remove:**
```json
// None to remove (openai not in package.json)
```

**Add (if needed):**
```json
"@langchain/anthropic": "^0.3.0",
"@langchain/google-genai": "^0.1.0"
```

### Step 2: Update AI Generator Factory

**File:** `src/lib/ai-generators/index.ts`

**Current:** Uses direct `fetch` to OpenAI API
**New:** Use `@langchain/openai` ChatOpenAI

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

class OpenAIGenerator implements AIGenerator {
  async generate(schema: any, sampleCount: number, model: string): Promise<AIGenerationResult> {
    const chatModel = new ChatOpenAI({
      modelName: model,
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    const prompt = `Generate ${sampleCount} samples...`;
    const response = await chatModel.invoke(prompt);
    
    return {
      data: JSON.parse(response.content as string),
      provider: 'openai',
      model,
      usage: { ... }
    };
  }
}
```

### Step 3: Update Dataset Creation Plugin

**File:** `src/lib/agents/dataset-creation-plugin.ts`

**Remove:**
```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
```

**Add:**
```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
```

**Update class:**
```typescript
export class DatasetCreationPlugin extends Tool {
  private chatModel: ChatOpenAI | ChatAnthropic | ChatGoogleGenerativeAI;

  constructor(hederaClient: Client, provider: 'openai' | 'anthropic' | 'google') {
    super();
    
    switch (provider) {
      case 'openai':
        this.chatModel = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
        break;
      case 'anthropic':
        this.chatModel = new ChatAnthropic({
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        });
        break;
      case 'google':
        this.chatModel = new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_API_KEY,
        });
        break;
    }
  }

  async _call(input: string): Promise<string> {
    const params = JSON.parse(input) as DatasetCreationInput;
    
    // Generate dataset using LangChain
    const response = await this.chatModel.invoke(params.prompt);
    
    // Mint NFT on Hedera
    // Log to HCS
    // Return result
  }
}
```

### Step 4: Update Synthetic Generation Service

**File:** `src/lib/synthetic-generation-service.ts`

Use LangChain models instead of direct API calls.

### Step 5: Update Server Agent Initialization

**File:** `server/initialize-agent.ts`

Already using `@langchain/openai` ✅ - Keep as is.

### Step 6: Update Frontend Forms

**Files:**
- `src/components/forms/generate-dataset-form.tsx`
- `src/components/studio/DatasetStudioWithCarbon.tsx`

No changes needed - they just pass provider/model strings.

## 🔧 Code Changes Required

### Priority 1: Fix Build Error (Immediate)

**File:** `src/lib/agents/dataset-creation-plugin.ts`

```typescript
// REMOVE these imports
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ADD these imports
import { ChatOpenAI } from '@langchain/openai';
```

### Priority 2: Update AI Generators

**File:** `src/lib/ai-generators/index.ts`

Replace direct API calls with LangChain models.

### Priority 3: Update Services

**Files:**
- `src/lib/generation.ts`
- `src/lib/synthetic-generation-service.ts`

Use LangChain for all AI operations.

## 📦 Environment Variables

```env
# AI Providers (for LangChain)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..." # Optional
GOOGLE_API_KEY="..." # Optional

# Hedera
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_ID="..."

# Hedera Resources (from init script)
NEXT_PUBLIC_DATASET_NFT_TOKEN_ID="0.0.xxxxx"
NEXT_PUBLIC_FILE_TOKEN_ID="0.0.xxxxx"
NEXT_PUBLIC_DATASET_METADATA_TOPIC_ID="0.0.xxxxx"
```

## ✅ Benefits of This Approach

1. **Unified Interface**: Single LangChain API for all AI providers
2. **Better Abstractions**: LangChain handles retries, streaming, etc.
3. **Hedera Agent Kit Compatible**: Works seamlessly with agent toolkit
4. **Reduced Dependencies**: No need for multiple AI SDKs
5. **Type Safety**: Better TypeScript support
6. **Easier Testing**: Mock LangChain models instead of API calls

## 🚀 Migration Checklist

- [ ] Remove unused AI SDK imports from `dataset-creation-plugin.ts`
- [ ] Update `ai-generators/index.ts` to use LangChain
- [ ] Update `generation.ts` to use LangChain
- [ ] Update `synthetic-generation-service.ts` to use LangChain
- [ ] Test OpenAI integration
- [ ] Add Anthropic support (optional)
- [ ] Add Google support (optional)
- [ ] Update documentation
- [ ] Run build successfully

## 📚 LangChain Resources

- [LangChain OpenAI](https://js.langchain.com/docs/integrations/chat/openai)
- [LangChain Anthropic](https://js.langchain.com/docs/integrations/chat/anthropic)
- [LangChain Google](https://js.langchain.com/docs/integrations/chat/google_generativeai)
- [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit)

## 🎯 Next Steps After Migration

1. Build Hedera Agent Kit plugins for:
   - Dataset creation
   - Marketplace trading
   - Verification
   - Provider management

2. Integrate with ElizaOS for autonomous agents

3. Implement HCS-10 for agent-to-agent communication

4. Add Hgraph SDK for mirror node analytics
