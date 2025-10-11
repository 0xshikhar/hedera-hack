import { Client } from '@hashgraph/sdk';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentMode, HederaLangchainToolkit } from 'hedera-agent-kit';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { AIModelFactory, AIProvider } from '@/lib/ai/model-factory';

export interface AgentConfig {
  userAccountId: string;
  aiProvider?: AIProvider;
  model?: string;
  temperature?: number;
}

export async function initializeAgent(
  userAccountId: string,
  provider: AIProvider = 'openai',
  model?: string
) {
  if (!userAccountId)
    throw new Error('userAccountId must be set');

  // Create AI model using the factory
  const llm = AIModelFactory.createModel({
    provider,
    model: model || (provider === 'openai' ? 'gpt-4o-mini' : 
                     provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
                     'gemini-1.5-flash'),
    temperature: 0.7,
    maxTokens: 4000,
  });

  const agentClient = Client.forTestnet();

    // Prepare Hedera toolkit (load all tools by default)
    const hederaAgentToolkit = new HederaLangchainToolkit({
      client: agentClient,
      configuration: {
        tools: [], // use an empty array if you wantto load all tools
        context: {
          mode: AgentMode.RETURN_BYTES,
          accountId: userAccountId,
        },
      },
    });

    // Load the structured chat prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant'],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);
  
  
  // Fetch tools from toolkit
  // cast to any to avoid excessively deep type instantiation caused by zod@3.25
  const tools = hederaAgentToolkit.getTools();

  // Create the underlying agent
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // In-memory conversation history
  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    inputKey: 'input',
    outputKey: 'output',
    returnMessages: true,
  });

  // Wrap everything in an executor that will maintain memory
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    returnIntermediateSteps: true,
  }); 

  return agentExecutor;
}
