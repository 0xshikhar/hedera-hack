import { Agent, AgentContext, AgentRequest, AgentResponse, Step, Tool, ElizaOS, HCS10 } from '@eliza-os/eliza';
import { hederaClient } from '../hedera';
import { HcsMessage } from '../hedera/consensus';

// Import plugins
// import { DatasetCreationPlugin } from './plugins/DatasetCreationPlugin';
// import { MarketplacePlugin } from './plugins/MarketplacePlugin';

/**
 * @class HederaAgent
 * @description The main AI agent for the FileThetic protocol.
 * It uses the Hedera Agent Kit and ElizaOS to interact with the Hedera network.
 */
export class HederaAgent {
  private agent: Agent;
  private eliza: ElizaOS;
  private context: AgentContext;

  constructor() {
    this.eliza = new ElizaOS();
    this.context = this.createContext();
    this.agent = this.createAgent();
    this.registerPlugins();
  }

  /**
   * Creates the agent context with necessary tools and services.
   */
  private createContext(): AgentContext {
    return {
      services: {
        hedera: hederaClient, // Assuming a singleton client
        // ipfs: ipfsClient,
        // db: prismaClient,
      },
      tools: [],
    };
  }

  /**
   * Creates the core agent with its identity and purpose.
   */
  private createAgent(): Agent {
    const agent = new Agent({
      id: process.env.HEDERA_ACCOUNT_ID || '0.0.0',
      name: 'FileThetic AI Agent',
      purpose: 'To autonomously manage the creation, verification, and trading of AI datasets on the FileThetic protocol on Hedera.',
      context: this.context,
    });
    return agent;
  }

  /**
   * Registers all the custom plugins for the agent.
   */
  private registerPlugins(): void {
    // this.agent.addPlugin(new DatasetCreationPlugin());
    // this.agent.addPlugin(new MarketplacePlugin());
    console.log('🔌 Plugins registered.');
  }

  /**
   * Executes a user request.
   * @param request The user's request.
   * @returns The agent's response.
   */
  public async execute(prompt: string): Promise<AgentResponse> {
    const request: AgentRequest = { prompt };
    const response = await this.agent.execute(request);
    return response;
  }

  /**
   * Listens for HCS messages and processes them.
   */
  public listenForCommands(): void {
    const topicId = hederaClient.getTopicId('agentCommunication');
    if (!topicId) {
      console.error('Agent communication topic not found.');
      return;
    }

    hederaClient.subscribeToTopic(topicId, (message: HcsMessage) => {
      this.handleHcsCommand(message);
    });

    console.log(`👂 Agent listening for commands on topic ${topicId.toString()}`);
  }

  /**
   * Handles a command received from the HCS topic.
   * @param message The HCS message.
   */
  private async handleHcsCommand(message: HcsMessage): Promise<void> {
    try {
      const hcsMessage = HCS10.parse(message.content);

      if (hcsMessage.to !== this.agent.id) {
        return; // Not for me
      }

      console.log(`📩 Received HCS command: ${hcsMessage.type}`);

      const request: AgentRequest = {
        prompt: hcsMessage.payload.prompt,
        context: {
          source: 'hcs',
          messageId: message.sequenceNumber.toString(),
          from: hcsMessage.from,
        },
      };

      const response = await this.agent.execute(request);

      // Optionally, send a response back via HCS
      // this.sendHcsResponse(response);

    } catch (error) {
      console.error('Error handling HCS command:', error);
    }
  }
}

// Singleton instance
export const hederaAgent = new HederaAgent();
