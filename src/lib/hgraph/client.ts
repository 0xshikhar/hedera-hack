import { HGraphSDK } from '@hgraph.io/sdk';

export interface TransactionData {
  consensus_timestamp: string;
  transaction_hash: string;
  type: string;
  result: string;
  charged_tx_fee: number;
  memo_base64?: string;
  payer_account_id: string;
}

export interface TokenTransferData {
  consensus_timestamp: string;
  account_id: string;
  amount: number;
  token_id: string;
}

export interface TopicMessageData {
  consensus_timestamp: string;
  message: string;
  sequence_number: number;
  payer_account_id: string;
  topic_id: string;
}

export class HgraphClient {
  private sdk: HGraphSDK;
  
  constructor() {
    this.sdk = new HGraphSDK({
      network: (process.env.HEDERA_NETWORK || 'testnet') as 'mainnet' | 'testnet',
    });
  }

  /**
   * Query transaction history for an account
   */
  async getTransactionHistory(
    accountId: string, 
    limit: number = 100
  ): Promise<TransactionData[]> {
    try {
      const response = await this.sdk.transaction.getTransactions({
        accountId,
        limit,
        order: 'desc',
      });

      return response.transactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Query token transfers for a specific token
   */
  async getTokenTransfers(
    tokenId: string, 
    limit: number = 100
  ): Promise<TokenTransferData[]> {
    try {
      const response = await this.sdk.token.getTokenTransfers({
        tokenId,
        limit,
        order: 'desc',
      });

      return response.transfers || [];
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  /**
   * Query HCS topic messages
   */
  async getTopicMessages(
    topicId: string, 
    limit: number = 100
  ): Promise<TopicMessageData[]> {
    try {
      const response = await this.sdk.topic.getMessages({
        topicId,
        limit,
        order: 'desc',
      });

      return response.messages || [];
    } catch (error) {
      console.error('Error fetching topic messages:', error);
      return [];
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const response = await this.sdk.account.getAccountInfo({
        accountId,
      });

      return response.balance || 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }

  /**
   * Get token info
   */
  async getTokenInfo(tokenId: string) {
    try {
      const response = await this.sdk.token.getTokenInfo({
        tokenId,
      });

      return response;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      // Get recent transactions across the network
      const response = await this.sdk.transaction.getTransactions({
        limit: 1000,
        order: 'desc',
      });

      const transactions = response.transactions || [];
      
      // Calculate stats
      const totalTransactions = transactions.length;
      const successfulTxs = transactions.filter(tx => tx.result === 'SUCCESS').length;
      const totalFees = transactions.reduce((sum, tx) => sum + (tx.charged_tx_fee || 0), 0);

      return {
        totalTransactions,
        successRate: (successfulTxs / totalTransactions) * 100,
        averageFee: totalFees / totalTransactions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time transactions (WebSocket)
   */
  subscribeToTransactions(
    accountId: string,
    callback: (transaction: TransactionData) => void
  ) {
    try {
      return this.sdk.transaction.subscribeToTransactions({
        accountId,
        onData: callback,
        onError: (error) => console.error('Subscription error:', error),
      });
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return null;
    }
  }

  /**
   * Subscribe to topic messages
   */
  subscribeToTopicMessages(
    topicId: string,
    callback: (message: TopicMessageData) => void
  ) {
    try {
      return this.sdk.topic.subscribeToMessages({
        topicId,
        onData: callback,
        onError: (error) => console.error('Subscription error:', error),
      });
    } catch (error) {
      console.error('Error setting up topic subscription:', error);
      return null;
    }
  }
}

// Singleton instance
export const hgraphClient = new HgraphClient();
