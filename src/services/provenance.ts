import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { hgraphClient } from '@/lib/hgraph/client';

export interface ProvenanceData {
  datasetId: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  version: string;
  prompt: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  timestamp: string;
  carbonFootprint: {
    computeTimeMs: number;
    energyKwh: number;
    co2Grams: number;
  };
  creator: string;
  ipfsCID: string;
}

export interface ProvenanceLog {
  type: 'PROVENANCE';
  version: '1.0';
  data: ProvenanceData;
  timestamp: string;
  signature?: string;
}

export class ProvenanceService {
  private client: Client;
  private topicId: TopicId;

  constructor(client: Client) {
    this.client = client;
    const topicIdStr = process.env.DATASET_METADATA_TOPIC_ID || '0.0.7158238';
    this.topicId = TopicId.fromString(topicIdStr);
  }

  /**
   * Log provenance data to HCS
   */
  async logProvenance(data: ProvenanceData): Promise<{
    success: boolean;
    transactionId?: string;
    sequenceNumber?: number;
    error?: string;
  }> {
    try {
      const log: ProvenanceLog = {
        type: 'PROVENANCE',
        version: '1.0',
        data,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(log);

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
      };
    } catch (error) {
      console.error('Error logging provenance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get provenance history for a dataset
   */
  async getProvenanceHistory(datasetId: string): Promise<ProvenanceData[]> {
    try {
      const messages = await hgraphClient.getTopicMessages(
        this.topicId.toString(),
        1000
      );

      const provenanceData: ProvenanceData[] = [];

      for (const msg of messages) {
        try {
          // Decode base64 message
          const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
          const parsed: ProvenanceLog = JSON.parse(decoded);

          if (
            parsed.type === 'PROVENANCE' &&
            parsed.data.datasetId === datasetId
          ) {
            provenanceData.push(parsed.data);
          }
        } catch (parseError) {
          // Skip invalid messages
          continue;
        }
      }

      return provenanceData;
    } catch (error) {
      console.error('Error fetching provenance history:', error);
      return [];
    }
  }

  /**
   * Verify provenance exists for a dataset
   */
  async verifyProvenance(datasetId: string): Promise<{
    exists: boolean;
    data?: ProvenanceData;
    timestamp?: string;
  }> {
    const history = await this.getProvenanceHistory(datasetId);

    if (history.length === 0) {
      return { exists: false };
    }

    // Return the most recent provenance record
    const latest = history[0];
    return {
      exists: true,
      data: latest,
      timestamp: latest.timestamp,
    };
  }

  /**
   * Get all provenance records (for analytics)
   */
  async getAllProvenance(limit: number = 100): Promise<ProvenanceData[]> {
    try {
      const messages = await hgraphClient.getTopicMessages(
        this.topicId.toString(),
        limit
      );

      const provenanceData: ProvenanceData[] = [];

      for (const msg of messages) {
        try {
          const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
          const parsed: ProvenanceLog = JSON.parse(decoded);

          if (parsed.type === 'PROVENANCE') {
            provenanceData.push(parsed.data);
          }
        } catch (parseError) {
          continue;
        }
      }

      return provenanceData;
    } catch (error) {
      console.error('Error fetching all provenance:', error);
      return [];
    }
  }

  /**
   * Get provenance statistics
   */
  async getProvenanceStats() {
    const allProvenance = await this.getAllProvenance(1000);

    const byProvider = allProvenance.reduce((acc, p) => {
      acc[p.provider] = (acc[p.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byModel = allProvenance.reduce((acc, p) => {
      acc[p.model] = (acc[p.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCarbon = allProvenance.reduce(
      (sum, p) => sum + p.carbonFootprint.co2Grams,
      0
    );

    return {
      totalDatasets: allProvenance.length,
      byProvider,
      byModel,
      totalCarbonGrams: totalCarbon,
      averageCarbonPerDataset: totalCarbon / allProvenance.length,
    };
  }
}

// Helper function to create provenance service instance
export function createProvenanceService(client: Client): ProvenanceService {
  return new ProvenanceService(client);
}
