import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { AIModelFactory, AIProvider } from '@/lib/ai/model-factory';
import { 
  createDatasetGenerationTool, 
  createDatasetRecommendationTool,
  createCostEstimationTool 
} from '@/lib/tools/dataset-generation-tool';

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

  // Load the structured chat prompt template
  console.log('\n🎯 Initializing FileThetic Dataset Generation Agent');
  console.log('ℹ️  Note: Hedera blockchain tools disabled - focusing on dataset generation\n');
  
  const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are FileThetic AI Assistant - a helpful AI agent specialized in synthetic dataset generation.

You help users create high-quality synthetic datasets for machine learning, testing, and development purposes.

Your capabilities:
1. Generate synthetic datasets from natural language descriptions
2. Recommend dataset types based on use cases
3. Estimate costs and time for dataset generation
4. Provide guidance on dataset schemas and structures

When users ask about datasets:
- Use the generate_dataset tool to create synthetic data
- Use the recommend_dataset tool to suggest dataset types
- Use the estimate_cost tool to provide cost estimates

Be conversational, helpful, and guide users through the dataset creation process.
Always explain what you're doing and provide clear next steps.`],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);
  // Create custom dataset generation tools only
  // Hedera tools are excluded due to OpenAI schema compatibility issues
  
  // Create custom dataset generation tools
  console.log('\n🎨 Creating custom dataset tools...');
  const datasetTools = [
    createDatasetGenerationTool(),
    createDatasetRecommendationTool(),
    createCostEstimationTool(),
  ];
  console.log(`✅ Created ${datasetTools.length} dataset tools`);
  
  // Validate dataset tools
  console.log('\n🔍 Validating dataset tools...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datasetTools.forEach((tool: any) => {
    console.log(`  ✓ ${tool.name}: ${tool.schema._def?.typeName || 'valid'}`);
  });
  
  const tools = datasetTools;
  
  console.log(`\n✅ Loaded ${tools.length} dataset generation tools`);
  console.log('\n📋 Available tools:');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools.forEach((tool: any, idx: number) => {
    console.log(`  ${idx + 1}. ${tool.name} - ${tool.description?.split('\n')[0] || 'Dataset tool'}`);
  });

  // Create the underlying agent
  console.log('\n🤖 Creating tool-calling agent...');
  let agent;
  try {
    agent = createToolCallingAgent({
      llm,
      tools,
      prompt,
    });
    console.log('✅ Agent created successfully');
  } catch (agentError) {
    console.error('❌ Failed to create agent:', agentError);
    throw agentError;
  }

  // In-memory conversation history
  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    inputKey: 'input',
    outputKey: 'output',
    returnMessages: true,
  });

  // Wrap everything in an executor that will maintain memory
  console.log('\n🎯 Creating agent executor...');
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    returnIntermediateSteps: true,
    maxIterations: 10, // Prevent infinite loops
    handleParsingErrors: true, // Better error handling
  }); 
  
  console.log('✅ Agent executor ready!\n');
  return agentExecutor;
}
