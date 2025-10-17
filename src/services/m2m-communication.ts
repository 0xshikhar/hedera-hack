import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { hgraphClient } from '@/lib/hgraph/client';

export interface M2MMessage {
  messageId: string;
  from: string; // Provider/Agent account ID
  to: string; // Target account ID or 'broadcast'
  type: 'request' | 'response' | 'notification' | 'heartbeat';
  action: string;
  payload: any;
  timestamp: string;
  signature?: string;
}

export interface DatasetRequest {
  requestId: string;
  requestor: string;
  category: string;
  requirements: {
    minQuality: number;
    maxPrice: number;
    maxCarbonFootprint?: number;
    format: string;
    rows?: number;
  };
  deadline?: string;
}

export interface ProviderBid {
  bidId: string;
  providerId: string;
  requestId: string;
  price: number;
  estimatedQuality: number;
  carbonFootprint: number;
  deliveryTime: number; // hours
  reputation: number;
}

export interface M2MContract {
  contractId: string;
  requestor: string;
  provider: string;
  terms: {
    price: number;
    quality: number;
    deadline: string;
    carbonLimit: number;
  };
  status: 'pending' | 'active' | 'completed' | 'disputed';
  createdAt: string;
}

export class M2MCommunicationService {
  private client: Client;
  private m2mTopicId: TopicId;
  private messageHandlers: Map<string, (message: M2MMessage) => void>;

  constructor(client: Client) {
    this.client = client;
    const topicIdStr = process.env.M2M_TOPIC_ID || '0.0.7158244';
    this.m2mTopicId = TopicId.fromString(topicIdStr);
    this.messageHandlers = new Map();
  }

  /**
   * Send M2M message to HCS
   */
  async sendMessage(message: Omit<M2MMessage, 'messageId' | 'timestamp'>): Promise<{
    success: boolean;
    messageId?: string;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const fullMessage: M2MMessage = {
        ...message,
        messageId: `m2m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      const messageJson = JSON.stringify(fullMessage);

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.m2mTopicId)
        .setMessage(messageJson);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status.toString() === 'SUCCESS',
        messageId: fullMessage.messageId,
        transactionId: response.transactionId.toString(),
      };
    } catch (error) {
      console.error('Error sending M2M message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Broadcast dataset request to all providers
   */
  async broadcastDatasetRequest(request: DatasetRequest): Promise<{
    success: boolean;
    requestId: string;
  }> {
    const message: Omit<M2MMessage, 'messageId' | 'timestamp'> = {
      from: request.requestor,
      to: 'broadcast',
      type: 'request',
      action: 'DATASET_REQUEST',
      payload: request,
    };

    const result = await this.sendMessage(message);

    return {
      success: result.success,
      requestId: request.requestId,
    };
  }

  /**
   * Submit bid for dataset request
   */
  async submitBid(bid: ProviderBid): Promise<{
    success: boolean;
    bidId: string;
  }> {
    const message: Omit<M2MMessage, 'messageId' | 'timestamp'> = {
      from: bid.providerId,
      to: 'broadcast', // Or specific requestor
      type: 'response',
      action: 'BID_SUBMISSION',
      payload: bid,
    };

    const result = await this.sendMessage(message);

    return {
      success: result.success,
      bidId: bid.bidId,
    };
  }

  /**
   * Create M2M contract
   */
  async createContract(contract: M2MContract): Promise<{
    success: boolean;
    contractId: string;
  }> {
    const message: Omit<M2MMessage, 'messageId' | 'timestamp'> = {
      from: contract.requestor,
      to: contract.provider,
      type: 'notification',
      action: 'CONTRACT_CREATED',
      payload: contract,
    };

    const result = await this.sendMessage(message);

    return {
      success: result.success,
      contractId: contract.contractId,
    };
  }

  /**
   * Send provider heartbeat
   */
  async sendHeartbeat(providerId: string, status: {
    online: boolean;
    capacity: number;
    currentLoad: number;
    avgResponseTime: number;
  }): Promise<{ success: boolean }> {
    const message: Omit<M2MMessage, 'messageId' | 'timestamp'> = {
      from: providerId,
      to: 'broadcast',
      type: 'heartbeat',
      action: 'PROVIDER_STATUS',
      payload: status,
    };

    const result = await this.sendMessage(message);
    return { success: result.success };
  }

  /**
   * Listen for M2M messages
   */
  async subscribeToMessages(
    callback: (message: M2MMessage) => void
  ): Promise<{ success: boolean }> {
    try {
      hgraphClient.subscribeToTopicMessages(
        this.m2mTopicId.toString(),
        (msg) => {
          try {
            const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
            const parsed: M2MMessage = JSON.parse(decoded);
            callback(parsed);
          } catch (error) {
            console.error('Error parsing M2M message:', error);
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error subscribing to M2M messages:', error);
      return { success: false };
    }
  }

  /**
   * Get recent M2M messages
   */
  async getRecentMessages(limit: number = 100): Promise<M2MMessage[]> {
    try {
      const messages = await hgraphClient.getTopicMessages(
        this.m2mTopicId.toString(),
        limit
      );

      const m2mMessages: M2MMessage[] = [];

      for (const msg of messages) {
        try {
          const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
          const parsed: M2MMessage = JSON.parse(decoded);
          m2mMessages.push(parsed);
        } catch (error) {
          continue;
        }
      }

      return m2mMessages;
    } catch (error) {
      console.error('Error fetching M2M messages:', error);
      return [];
    }
  }

  /**
   * Get dataset requests
   */
  async getDatasetRequests(): Promise<DatasetRequest[]> {
    const messages = await this.getRecentMessages(500);
    return messages
      .filter((msg) => msg.action === 'DATASET_REQUEST')
      .map((msg) => msg.payload as DatasetRequest);
  }

  /**
   * Get bids for a request
   */
  async getBidsForRequest(requestId: string): Promise<ProviderBid[]> {
    const messages = await this.getRecentMessages(500);
    return messages
      .filter(
        (msg) =>
          msg.action === 'BID_SUBMISSION' &&
          msg.payload.requestId === requestId
      )
      .map((msg) => msg.payload as ProviderBid);
  }

  /**
   * Get active contracts
   */
  async getActiveContracts(accountId: string): Promise<M2MContract[]> {
    const messages = await this.getRecentMessages(500);
    return messages
      .filter(
        (msg) =>
          msg.action === 'CONTRACT_CREATED' &&
          (msg.payload.requestor === accountId ||
            msg.payload.provider === accountId)
      )
      .map((msg) => msg.payload as M2MContract);
  }

  /**
   * Get provider status from heartbeats
   */
  async getProviderStatus(providerId: string): Promise<{
    online: boolean;
    lastSeen: string;
    status?: any;
  }> {
    const messages = await this.getRecentMessages(100);
    const heartbeats = messages.filter(
      (msg) =>
        msg.action === 'PROVIDER_STATUS' && msg.from === providerId
    );

    if (heartbeats.length === 0) {
      return {
        online: false,
        lastSeen: 'Never',
      };
    }

    const latest = heartbeats[0];
    const lastSeenTime = new Date(latest.timestamp);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);

    return {
      online: minutesAgo < 5, // Consider online if heartbeat within 5 minutes
      lastSeen: latest.timestamp,
      status: latest.payload,
    };
  }

  /**
   * Register message handler
   */
  registerHandler(action: string, handler: (message: M2MMessage) => void): void {
    this.messageHandlers.set(action, handler);
  }

  /**
   * Process incoming message
   */
  private processMessage(message: M2MMessage): void {
    const handler = this.messageHandlers.get(message.action);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Auto-respond to dataset requests (for providers)
   */
  async setupAutoResponder(
    providerId: string,
    config: {
      minPrice: number;
      maxPrice: number;
      qualityScore: number;
      carbonFootprint: number;
      autoAccept: boolean;
    }
  ): Promise<void> {
    await this.subscribeToMessages(async (message) => {
      if (message.action === 'DATASET_REQUEST') {
        const request = message.payload as DatasetRequest;

        // Check if we can fulfill the request
        if (
          config.qualityScore >= request.requirements.minQuality &&
          config.minPrice <= request.requirements.maxPrice
        ) {
          // Submit bid
          const bid: ProviderBid = {
            bidId: `bid_${Date.now()}`,
            providerId,
            requestId: request.requestId,
            price: Math.min(config.maxPrice, request.requirements.maxPrice),
            estimatedQuality: config.qualityScore,
            carbonFootprint: config.carbonFootprint,
            deliveryTime: 2, // 2 hours
            reputation: 85,
          };

          await this.submitBid(bid);
        }
      }
    });
  }
}

// Helper function to create M2M service
export function createM2MService(client: Client): M2MCommunicationService {
  return new M2MCommunicationService(client);
}
