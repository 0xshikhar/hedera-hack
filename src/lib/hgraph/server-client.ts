// Server-safe Hgraph client that uses REST API instead of SDK
// This avoids React context issues in API routes

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

export interface NetworkStats {
  totalTransactions: number;
  successRate: number;
  averageFee: number;
  last24hVolume: number;
}

export class ServerHgraphClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet' 
      ? 'mainnet' 
      : 'testnet';
    
    this.baseUrl = `https://${network}.mirrornode.hedera.com/api/v1`;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get transaction history for an account
   */
  async getTransactionHistory(
    accountId: string,
    limit: number = 100
  ): Promise<TransactionData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?account.id=${accountId}&limit=${limit}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch transactions:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get token transfers for an account
   */
  async getTokenTransfers(
    accountId: string,
    limit: number = 100
  ): Promise<TokenTransferData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}/tokens?limit=${limit}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch token transfers:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  /**
   * Get HCS topic messages
   */
  async getTopicMessages(
    topicId: string,
    limit: number = 100
  ): Promise<TopicMessageData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/topics/${topicId}/messages?limit=${limit}&order=desc`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch topic messages:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.messages || [];
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
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch account balance:', response.statusText);
        return 0;
      }

      const data = await response.json();
      return data.balance?.balance || 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats | null> {
    try {
      // Get recent transactions to calculate stats
      const response = await fetch(
        `${this.baseUrl}/transactions?limit=100&order=desc`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch network stats:', response.statusText);
        return null;
      }

      const data = await response.json();
      const transactions = data.transactions || [];

      if (transactions.length === 0) {
        return {
          totalTransactions: 0,
          successRate: 0,
          averageFee: 0,
          last24hVolume: 0,
        };
      }

      const successfulTxs = transactions.filter((tx: any) => tx.result === 'SUCCESS');
      const totalFees = transactions.reduce((sum: number, tx: any) => sum + (tx.charged_tx_fee || 0), 0);

      return {
        totalTransactions: transactions.length,
        successRate: (successfulTxs.length / transactions.length) * 100,
        averageFee: totalFees / transactions.length,
        last24hVolume: transactions.length,
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tokens/${tokenId}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch token info:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }
}

// Singleton instance for server-side use
export const serverHgraphClient = new ServerHgraphClient();
