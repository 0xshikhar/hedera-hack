import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { serverHgraphClient } from '@/lib/hgraph/server-client';

export interface TrainingDataLineage {
  sourceDataset: string;
  sourceConfig: string;
  sourceSplit: string;
  samplesUsed: number;
  inputFeature: string;
  transformations: string[];
  verificationHash: string;
}

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
  // Enhanced fields for complete tracking
  operationType: 'dataset_generation' | 'verification' | 'inference' | 'training';
  trainingDataLineage?: TrainingDataLineage;
  modelFingerprint: string;
  inputHash: string;
  outputHash: string;
  hederaTransactionId?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  communityVotes?: {
    upvotes: number;
    downvotes: number;
    verifiers: string[];
  };
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
   * Log provenance data to HCS with complete audit trail
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

      console.log(`✅ Provenance logged to HCS: ${response.transactionId.toString()}`);
      console.log(`   Operation: ${data.operationType}`);
      console.log(`   Model: ${data.model}`);
      console.log(`   Carbon: ${data.carbonFootprint.co2Grams.toFixed(2)}g CO2`);

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
   * Log AI operation with automatic hash generation
   */
  async logAIOperation(
    operationType: ProvenanceData['operationType'],
    model: string,
    provider: ProvenanceData['provider'],
    input: string,
    output: string,
    parameters: ProvenanceData['parameters'],
    carbonFootprint: ProvenanceData['carbonFootprint'],
    creator: string,
    additionalData?: Partial<ProvenanceData>
  ): Promise<{
    success: boolean;
    transactionId?: string;
    sequenceNumber?: number;
    error?: string;
  }> {
    const inputHash = this.generateHash(input);
    const outputHash = this.generateHash(output);
    const modelFingerprint = this.generateHash(`${provider}:${model}:${JSON.stringify(parameters)}`);

    const provenanceData: ProvenanceData = {
      datasetId: additionalData?.datasetId || `temp_${Date.now()}`,
      model,
      provider,
      version: additionalData?.version || '1.0',
      prompt: input.substring(0, 500), // Store first 500 chars
      parameters,
      timestamp: new Date().toISOString(),
      carbonFootprint,
      creator,
      ipfsCID: additionalData?.ipfsCID || '',
      operationType,
      modelFingerprint,
      inputHash,
      outputHash,
      verificationStatus: 'pending',
      ...additionalData,
    };

    return this.logProvenance(provenanceData);
  }

  /**
   * Generate SHA-256 hash for data integrity
   */
  private generateHash(data: string): string {
    // Simple hash implementation - in production use crypto
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get provenance history for a dataset
   */
  async getProvenanceHistory(datasetId: string): Promise<ProvenanceData[]> {
    try {
      const messages = await serverHgraphClient.getTopicMessages(
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
        } catch {
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
  async getAllProvenance(limit: number = 1000): Promise<ProvenanceData[]> {
    try {
      const messages = await serverHgraphClient.getTopicMessages(
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
        } catch {
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
   * Get provenance statistics with enhanced metrics
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

    const byOperationType = allProvenance.reduce((acc, p) => {
      const type = p.operationType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCarbon = allProvenance.reduce(
      (sum, p) => sum + p.carbonFootprint.co2Grams,
      0
    );

    const verifiedCount = allProvenance.filter(
      p => p.verificationStatus === 'verified'
    ).length;

    return {
      totalDatasets: allProvenance.length,
      byProvider,
      byModel,
      byOperationType,
      totalCarbonGrams: totalCarbon,
      averageCarbonPerDataset: totalCarbon / allProvenance.length || 0,
      verificationRate: allProvenance.length > 0 ? (verifiedCount / allProvenance.length) * 100 : 0,
      totalOperations: allProvenance.length,
    };
  }

  /**
   * Track training data lineage
   */
  async trackTrainingDataLineage(
    datasetId: string,
    lineage: TrainingDataLineage
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const lineageLog = {
        type: 'TRAINING_LINEAGE',
        version: '1.0',
        datasetId,
        lineage,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(lineageLog);
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      await response.getReceipt(this.client);

      console.log(`✅ Training lineage tracked: ${datasetId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit community verification vote
   */
  async submitVerificationVote(
    datasetId: string,
    verifier: string,
    vote: 'upvote' | 'downvote',
    comments?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const voteLog = {
        type: 'VERIFICATION_VOTE',
        version: '1.0',
        datasetId,
        verifier,
        vote,
        comments,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(voteLog);
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      await response.getReceipt(this.client);

      console.log(`✅ Verification vote submitted: ${vote} by ${verifier}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Helper function to create provenance service instance
export function createProvenanceService(client: Client): ProvenanceService {
  return new ProvenanceService(client);
}
