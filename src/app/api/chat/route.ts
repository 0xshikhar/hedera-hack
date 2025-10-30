
import { handleChatBodySchema } from '@/server/schema';
import { initializeAgent } from '@/server/initialize-agent';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type ResponseData = {
    message: string;
    transactionBytes?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBytesFromAgentResponse(response: any): string | undefined {
    if (
      response.intermediateSteps &&
      response.intermediateSteps.length > 0 &&
      response.intermediateSteps[0].observation
    ) {
      const obs = response.intermediateSteps[0].observation;
      try {
        const obsObj = typeof obs === 'string' ? JSON.parse(obs) : obs;
        if (obsObj && obsObj.bytes) {
            const bytes = obsObj.bytes;
            const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes.data ?? bytes);
            return buffer.toString('base64');
        }
      } catch (e) {
        console.error('Error parsing observation:', e);
      }
    }
    return undefined;
  }

export async function POST(req: NextRequest) {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 CHAT API REQUEST STARTED');
    console.log('='.repeat(80));
    
    try {
        // Parse request body
        console.log('\n📥 Step 1: Parsing request body...');
        const data = await req.json();
        console.log(`  ✓ User Account ID: ${data.userAccountId}`);
        console.log(`  ✓ Input: "${data.input?.substring(0, 100)}${data.input?.length > 100 ? '...' : ''}"`);
        console.log(`  ✓ History length: ${data.history?.length || 0} messages`);
        
        // Validate request body
        console.log('\n🔍 Step 2: Validating request schema...');
        const parsedBody = handleChatBodySchema.safeParse(data);
        if (!parsedBody.success) {
            console.error('  ❌ Schema validation failed:', parsedBody.error);
            return Response.json(
                { message: 'Invalid body request', error: parsedBody.error.message },
                { status: 400 }
            );
        }
        console.log('  ✅ Request schema valid');
        
        const body = parsedBody.data;
        
        // Initialize agent
        console.log('\n🤖 Step 3: Initializing agent...');
        console.log(`  → Provider: openai`);
        console.log(`  → User Account: ${data.userAccountId}`);
        
        const agentExecutor = await initializeAgent(data.userAccountId);
        console.log('  ✅ Agent initialized successfully');
        
        // Invoke agent
        console.log('\n💬 Step 4: Invoking agent with user input...');
        console.log(`  → Input: "${body.input}"`);
        
        const agentResponse = await agentExecutor.invoke({
            input: body.input,
            chat_history: body.history,
        });
        
        console.log('  ✅ Agent invoked successfully');
        console.log(`  → Output: "${agentResponse.output?.substring(0, 100)}${agentResponse.output?.length > 100 ? '...' : ''}"`);
        console.log(`  → Intermediate steps: ${agentResponse.intermediateSteps?.length || 0}`);
        
        // Build response
        console.log('\n📤 Step 5: Building response...');
        const response: ResponseData = {
            message: agentResponse.output ?? '-',
        };
        
        // Extract transaction bytes if present
        response.transactionBytes = extractBytesFromAgentResponse(agentResponse);
        if (response.transactionBytes) {
            console.log('  📝 Transaction bytes detected');
            response.message = 'Sign transaction bytes';
        }
        
        console.log('  ✅ Response built successfully');
        console.log('\n' + '='.repeat(80));
        console.log('✅ CHAT API REQUEST COMPLETED SUCCESSFULLY');
        console.log('='.repeat(80) + '\n');
        
        return Response.json(response);
        
    } catch (error) {
        console.error('\n' + '='.repeat(80));
        console.error('❌ CHAT API REQUEST FAILED');
        console.error('='.repeat(80));
        console.error('\n🚫 Error details:');
        console.error(error);
        
        if (error instanceof Error) {
            console.error(`  → Message: ${error.message}`);
            console.error(`  → Stack: ${error.stack}`);
        }
        
        console.error('\n' + '='.repeat(80) + '\n');
        
        return Response.json(
            { 
                message: 'Failed to process chat request', 
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}