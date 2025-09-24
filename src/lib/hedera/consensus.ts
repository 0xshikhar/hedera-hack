import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  PrivateKey,
  PublicKey,
  TopicInfoQuery,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateTopicParams {
  memo: string;
  submitKey?: PublicKey;
  adminKey?: PrivateKey;
}

export interface SubmitMessageParams {
  topicId: TopicId;
  message: string | Buffer;
}

export interface TopicMessage {
  consensusTimestamp: Date;
  sequenceNumber: number;
  contents: Buffer;
  runningHash: Uint8Array;
  topicId: TopicId;
}

/**
 * Hedera Consensus Service (HCS) operations for FileThetic
 * Used for immutable audit trails, dataset metadata, verification logs, and agent communication
 */
export class HederaConsensusService {
  /**
   * Create a new HCS topic
   */
  static async createTopic(params: CreateTopicParams): Promise<TopicId> {
    const client = HederaClient.getClient();
    const operatorKey = HederaClient.getOperatorKey();

    const { memo, submitKey, adminKey = operatorKey } = params;

    const transaction = new TopicCreateTransaction()
      .setTopicMemo(memo)
      .setAdminKey(adminKey);

    if (submitKey) {
      transaction.setSubmitKey(submitKey);
    }

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId;

    if (!topicId) {
      throw new Error('Topic creation failed: No topic ID returned');
    }

    console.log(`✅ Created HCS topic: ${topicId.toString()}`);
    console.log(`   Memo: ${memo}`);

    return topicId;
  }

  /**
   * Submit a message to an HCS topic
   */
  static async submitMessage(params: SubmitMessageParams): Promise<{
    txId: string;
    sequenceNumber: number;
    consensusTimestamp: Date;
  }> {
    const client = HederaClient.getClient();
    const { topicId, message } = params;

    // Convert message to Buffer if it's a string
    const messageBuffer = typeof message === 'string' ? Buffer.from(message) : message;

    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(messageBuffer)
      .execute(client);

    const receipt = await transaction.getReceipt(client);

    console.log(`✅ Submitted message to topic ${topicId.toString()}`);
    console.log(`   Sequence: ${receipt.topicSequenceNumber?.toString()}`);

    return {
      txId: transaction.transactionId.toString(),
      sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
      consensusTimestamp: new Date(),
    };
  }

  /**
   * Subscribe to messages from an HCS topic
   */
  static subscribeToTopic(
    topicId: TopicId,
    onMessage: (message: TopicMessage) => void,
    startTime?: Date
  ): void {
    const client = HederaClient.getClient();

    const query = new TopicMessageQuery().setTopicId(topicId);

    if (startTime) {
      query.setStartTime(startTime);
    } else {
      query.setStartTime(0);
    }

    query.subscribe(client, null, (message) => {
      if (!message) return;

      const topicMessage: TopicMessage = {
        consensusTimestamp: message.consensusTimestamp.toDate(),
        sequenceNumber: message.sequenceNumber.toNumber(),
        contents: Buffer.from(message.contents),
        runningHash: message.runningHash,
        topicId,
      };

      onMessage(topicMessage);
    });

    console.log(`✅ Subscribed to topic ${topicId.toString()}`);
  }

  /**
   * Get topic info
   */
  static async getTopicInfo(topicId: TopicId) {
    const client = HederaClient.getClient();
    const query = new TopicInfoQuery().setTopicId(topicId);
    const info = await query.execute(client);
    return info;
  }
}

/**
 * FileThetic-specific HCS topic types
 */
export enum FiletheticTopicType {
  DATASET_METADATA = 'dataset-metadata',
  VERIFICATION_LOGS = 'verification-logs',
  AGENT_COMMUNICATION = 'agent-communication',
  AUDIT_TRAIL = 'audit-trail',
  MARKETPLACE_EVENTS = 'marketplace-events',
}

/**
 * Dataset Metadata Message (HCS)
 */
export interface DatasetMetadataMessage {
  version: '1.0';
  type: 'dataset.created' | 'dataset.updated' | 'dataset.deleted';
  timestamp: number;
  datasetId: string;
  nftTokenId: string;
  nftSerialNumber: number;
  creator: string;
  metadata: {
    name: string;
    description: string;
    category: string;
    ipfsCID: string;
    size: number;
    format: string;
    aiModel: string;
    aiProvider: string;
  };
  signature: string;
}

/**
 * Verification Log Message (HCS)
 */
export interface VerificationLogMessage {
  version: '1.0';
  type: 'verification.submitted' | 'verification.approved' | 'verification.rejected';
  timestamp: number;
  datasetId: string;
  verifier: string;
  verificationId: string;
  result: {
    score: number; // 0-100
    checks: Array<{
      name: string;
      passed: boolean;
      details: string;
    }>;
    aiModel: string;
    computeTime: number;
  };
  signature: string;
}

/**
 * Agent Communication Message (HCS-10 compliant)
 */
export interface AgentCommunicationMessage {
  version: '1.0';
  standard: 'HCS-10';
  type: 'request' | 'response' | 'event';
  timestamp: number;
  from: {
    agentId: string;
    accountId: string;
  };
  to: {
    agentId: string;
    accountId: string;
  };
  payload: {
    action: string;
    parameters: Record<string, unknown>;
    requestId?: string;
  };
  signature: string;
}

/**
 * Audit Trail Message (HCS)
 */
export interface AuditTrailMessage {
  version: '1.0';
  type: 'marketplace.sale' | 'nft.transfer' | 'verification.complete' | 'provider.registered';
  timestamp: number;
  actor: string;
  action: string;
  resource: {
    type: string;
    id: string;
  };
  details: Record<string, unknown>;
  transactionId?: string;
  signature: string;
}

/**
 * Helper functions for FileThetic HCS operations
 */
export class FiletheticHCS {
  /**
   * Publish dataset metadata to HCS
   */
  static async publishDatasetMetadata(
    topicId: TopicId,
    message: DatasetMetadataMessage
  ): Promise<{ txId: string; sequenceNumber: number }> {
    const messageJson = JSON.stringify(message);
    const result = await HederaConsensusService.submitMessage({
      topicId,
      message: messageJson,
    });

    return {
      txId: result.txId,
      sequenceNumber: result.sequenceNumber,
    };
  }

  /**
   * Publish verification log to HCS
   */
  static async publishVerificationLog(
    topicId: TopicId,
    message: VerificationLogMessage
  ): Promise<{ txId: string; sequenceNumber: number }> {
    const messageJson = JSON.stringify(message);
    const result = await HederaConsensusService.submitMessage({
      topicId,
      message: messageJson,
    });

    return {
      txId: result.txId,
      sequenceNumber: result.sequenceNumber,
    };
  }

  /**
   * Publish agent communication to HCS
   */
  static async publishAgentMessage(
    topicId: TopicId,
    message: AgentCommunicationMessage
  ): Promise<{ txId: string; sequenceNumber: number }> {
    const messageJson = JSON.stringify(message);
    const result = await HederaConsensusService.submitMessage({
      topicId,
      message: messageJson,
    });

    return {
      txId: result.txId,
      sequenceNumber: result.sequenceNumber,
    };
  }

  /**
   * Publish audit trail to HCS
   */
  static async publishAuditTrail(
    topicId: TopicId,
    message: AuditTrailMessage
  ): Promise<{ txId: string; sequenceNumber: number }> {
    const messageJson = JSON.stringify(message);
    const result = await HederaConsensusService.submitMessage({
      topicId,
      message: messageJson,
    });

    return {
      txId: result.txId,
      sequenceNumber: result.sequenceNumber,
    };
  }

  /**
   * Subscribe to dataset metadata updates
   */
  static subscribeToDatasetMetadata(
    topicId: TopicId,
    onMessage: (message: DatasetMetadataMessage) => void
  ): void {
    HederaConsensusService.subscribeToTopic(topicId, (msg) => {
      try {
        const parsed = JSON.parse(msg.contents.toString()) as DatasetMetadataMessage;
        onMessage(parsed);
      } catch (error) {
        console.error('Failed to parse dataset metadata message:', error);
      }
    });
  }

  /**
   * Subscribe to verification logs
   */
  static subscribeToVerificationLogs(
    topicId: TopicId,
    onMessage: (message: VerificationLogMessage) => void
  ): void {
    HederaConsensusService.subscribeToTopic(topicId, (msg) => {
      try {
        const parsed = JSON.parse(msg.contents.toString()) as VerificationLogMessage;
        onMessage(parsed);
      } catch (error) {
        console.error('Failed to parse verification log message:', error);
      }
    });
  }
}
