import HgraphSDK from '@hgraph.io/sdk';

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
  private client: HgraphSDK;
  
  constructor() {
    const network = process.env.HEDERA_NETWORK === 'mainnet' 
      ? 'mainnet.hedera' 
      : 'testnet.hedera';
    
    // Initialize HGraph SDK with optional API key
    const headers: Record<string, string> = {};
    
    if (process.env.HGRAPH_API_KEY) {
      headers['x-api-key'] = process.env.HGRAPH_API_KEY;
    }
    
    this.client = new HgraphSDK({
      network: network as any,
      environment: 'io' as any,
      ...(Object.keys(headers).length > 0 && { headers }),
    });
  }

  /**
   * Query transaction history for an account using GraphQL
   */
  async getTransactionHistory(
    accountId: string, 
    limit: number = 100
  ): Promise<TransactionData[]> {
    try {
      const query = `
        query GetTransactions($accountId: String!, $limit: Int!) {
          transaction(
            where: { payer_account_id: { _eq: $accountId } }
            limit: $limit
            order_by: { consensus_timestamp: desc }
          ) {
            consensus_timestamp
            transaction_hash
            type
            result
            charged_tx_fee
            memo_base64
            payer_account_id
          }
        }
      `;

      const { data } = await this.client.query<{ transaction: TransactionData[] }>({
        query,
        variables: { accountId, limit },
      });

      return data?.transaction || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Query token transfers for a specific token using GraphQL
   */
  async getTokenTransfers(
    tokenId: string, 
    limit: number = 100
  ): Promise<TokenTransferData[]> {
    try {
      const query = `
        query GetTokenTransfers($tokenId: String!, $limit: Int!) {
          token_account(
            where: { token_id: { _eq: $tokenId } }
            limit: $limit
            order_by: { created_timestamp: desc }
          ) {
            account_id
            balance
            token_id
            created_timestamp
          }
        }
      `;

      const { data } = await this.client.query<{ token_account: any[] }>({
        query,
        variables: { tokenId, limit },
      });

      return (data?.token_account || []).map((item: any) => ({
        consensus_timestamp: item.created_timestamp,
        account_id: item.account_id,
        amount: item.balance,
        token_id: item.token_id,
      }));
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  /**
   * Query HCS topic messages using GraphQL
   */
  async getTopicMessages(
    topicId: string, 
    limit: number = 100
  ): Promise<TopicMessageData[]> {
    try {
      const query = `
        query GetTopicMessages($topicId: String!, $limit: Int!) {
          topic_message(
            where: { topic_id: { _eq: $topicId } }
            limit: $limit
            order_by: { consensus_timestamp: desc }
          ) {
            consensus_timestamp
            message
            sequence_number
            payer_account_id
            topic_id
          }
        }
      `;

      const { data } = await this.client.query<{ topic_message: TopicMessageData[] }>({
        query,
        variables: { topicId, limit },
      });

      return data?.topic_message || [];
    } catch (error) {
      console.error('Error fetching topic messages:', error);
      return [];
    }
  }

  /**
   * Get account balance using GraphQL
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const query = `
        query GetAccountBalance($accountId: String!) {
          account(where: { id: { _eq: $accountId } }) {
            balance
          }
        }
      `;

      const { data } = await this.client.query<{ account: Array<{ balance: number }> }>({
        query,
        variables: { accountId },
      });

      return data?.account?.[0]?.balance || 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }

  /**
   * Get token info using GraphQL
   */
  async getTokenInfo(tokenId: string) {
    try {
      const query = `
        query GetTokenInfo($tokenId: String!) {
          token(where: { token_id: { _eq: $tokenId } }) {
            token_id
            name
            symbol
            decimals
            total_supply
            type
          }
        }
      `;

      const { data } = await this.client.query<{ token: any[] }>({
        query,
        variables: { tokenId },
      });

      return data?.token?.[0] || null;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Get network statistics using GraphQL
   */
  async getNetworkStats() {
    try {
      const query = `
        query GetNetworkStats($limit: Int!) {
          transaction(
            limit: $limit
            order_by: { consensus_timestamp: desc }
          ) {
            result
            charged_tx_fee
          }
        }
      `;

      const { data } = await this.client.query<{ transaction: Array<{ result: string; charged_tx_fee: number }> }>({
        query,
        variables: { limit: 1000 },
      });

      const transactions = data?.transaction || [];
      
      // Calculate stats
      const totalTransactions = transactions.length;
      const successfulTxs = transactions.filter(tx => tx.result === 'SUCCESS').length;
      const totalFees = transactions.reduce((sum, tx) => sum + (tx.charged_tx_fee || 0), 0);

      return {
        totalTransactions,
        successRate: totalTransactions > 0 ? (successfulTxs / totalTransactions) * 100 : 0,
        averageFee: totalTransactions > 0 ? totalFees / totalTransactions : 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time transactions using GraphQL subscription
   */
  subscribeToTransactions(
    accountId: string,
    callback: (transaction: TransactionData) => void
  ) {
    try {
      const subscription = `
        subscription SubscribeTransactions($accountId: String!) {
          transaction(
            where: { payer_account_id: { _eq: $accountId } }
            order_by: { consensus_timestamp: desc }
            limit: 1
          ) {
            consensus_timestamp
            transaction_hash
            type
            result
            charged_tx_fee
            memo_base64
            payer_account_id
          }
        }
      `;

      return this.client.subscribe(subscription, {
        next: (data: any) => {
          if (data?.transaction?.[0]) {
            callback(data.transaction[0]);
          }
        },
        error: (error) => console.error('Subscription error:', error),
        complete: () => console.log('Subscription complete'),
      }).unsubscribe;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return null;
    }
  }

  /**
   * Subscribe to topic messages using GraphQL subscription
   */
  subscribeToTopicMessages(
    topicId: string,
    callback: (message: TopicMessageData) => void
  ) {
    try {
      const subscription = `
        subscription SubscribeTopicMessages($topicId: String!) {
          topic_message(
            where: { topic_id: { _eq: $topicId } }
            order_by: { consensus_timestamp: desc }
            limit: 1
          ) {
            consensus_timestamp
            message
            sequence_number
            payer_account_id
            topic_id
          }
        }
      `;

      return this.client.subscribe(subscription, {
        next: (data: any) => {
          if (data?.topic_message?.[0]) {
            callback(data.topic_message[0]);
          }
        },
        error: (error) => console.error('Subscription error:', error),
        complete: () => console.log('Subscription complete'),
      }).unsubscribe;
    } catch (error) {
      console.error('Error setting up topic subscription:', error);
      return null;
    }
  }
}

// Singleton instance
export const hgraphClient = new HgraphClient();
