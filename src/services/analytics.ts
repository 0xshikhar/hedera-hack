import { hgraphClient } from '@/lib/hgraph/client';

export interface MarketplaceStats {
  totalSales: number;
  totalVolume: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  averagePrice: number;
  last24hSales: number;
  last24hVolume: number;
}

export interface ProviderPerformance {
  providerId: string;
  totalTransactions: number;
  successRate: number;
  averageFee: number;
  uptime: number;
  reputation: number;
  lastActive: string;
}

export interface AnomalyDetection {
  accountId: string;
  totalTransactions: number;
  anomalyCount: number;
  riskScore: number;
  isHighRisk: boolean;
  anomalies: Array<{
    timestamp: string;
    type: string;
    description: string;
  }>;
}

export interface DemandForecast {
  category: string;
  historicalAverage: number;
  predictedDemand: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class AnalyticsService {
  /**
   * Get comprehensive marketplace statistics
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const tokenId = process.env.DATASET_NFT_TOKEN_ID || '0.0.7158235';
      const transfers = await hgraphClient.getTokenTransfers(tokenId, 1000);

      const now = Date.now();
      const last24h = now - 24 * 60 * 60 * 1000;

      const recentTransfers = transfers.filter(
        (t) => new Date(t.consensus_timestamp).getTime() > last24h
      );

      const totalSales = transfers.length;
      const totalVolume = transfers.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const uniqueBuyers = new Set(transfers.map((t) => t.account_id)).size;
      const uniqueSellers = new Set(
        transfers.filter((t) => t.amount < 0).map((t) => t.account_id)
      ).size;

      return {
        totalSales,
        totalVolume,
        uniqueBuyers,
        uniqueSellers,
        averagePrice: totalVolume / totalSales || 0,
        last24hSales: recentTransfers.length,
        last24hVolume: recentTransfers.reduce(
          (sum, t) => sum + Math.abs(t.amount),
          0
        ),
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      return {
        totalSales: 0,
        totalVolume: 0,
        uniqueBuyers: 0,
        uniqueSellers: 0,
        averagePrice: 0,
        last24hSales: 0,
        last24hVolume: 0,
      };
    }
  }

  /**
   * Get provider performance metrics
   */
  async getProviderPerformance(
    providerId: string
  ): Promise<ProviderPerformance> {
    try {
      const transactions = await hgraphClient.getTransactionHistory(
        providerId,
        1000
      );

      if (transactions.length === 0) {
        return {
          providerId,
          totalTransactions: 0,
          successRate: 0,
          averageFee: 0,
          uptime: 0,
          reputation: 0,
          lastActive: new Date().toISOString(),
        };
      }

      const successfulTxs = transactions.filter(
        (t) => t.result === 'SUCCESS'
      ).length;
      const successRate = successfulTxs / transactions.length;
      const avgFee =
        transactions.reduce((sum, t) => sum + t.charged_tx_fee, 0) /
        transactions.length;

      // Calculate uptime based on transaction consistency
      const uptime = this.calculateUptime(transactions);

      // Calculate reputation score (0-100)
      const reputation = this.calculateReputation(
        successRate,
        uptime,
        transactions.length
      );

      return {
        providerId,
        totalTransactions: transactions.length,
        successRate: successRate * 100,
        averageFee: avgFee,
        uptime,
        reputation,
        lastActive: transactions[0]?.consensus_timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching provider performance:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies and potential fraud
   */
  async detectAnomalies(accountId: string): Promise<AnomalyDetection> {
    try {
      const transactions = await hgraphClient.getTransactionHistory(
        accountId,
        1000
      );

      if (transactions.length === 0) {
        return {
          accountId,
          totalTransactions: 0,
          anomalyCount: 0,
          riskScore: 0,
          isHighRisk: false,
          anomalies: [],
        };
      }

      const anomalies: Array<{
        timestamp: string;
        type: string;
        description: string;
      }> = [];

      // 1. Check for unusual transaction frequency
      const frequencyAnomalies = this.detectFrequencyAnomalies(transactions);
      anomalies.push(...frequencyAnomalies);

      // 2. Check for unusual transaction amounts
      const amountAnomalies = this.detectAmountAnomalies(transactions);
      anomalies.push(...amountAnomalies);

      // 3. Check for suspicious patterns
      const patternAnomalies = this.detectPatterns(transactions);
      anomalies.push(...patternAnomalies);

      // Calculate risk score (0-100)
      const riskScore = Math.min(
        100,
        (anomalies.length / transactions.length) * 100 * 10
      );

      return {
        accountId,
        totalTransactions: transactions.length,
        anomalyCount: anomalies.length,
        riskScore,
        isHighRisk: riskScore > 50,
        anomalies: anomalies.slice(0, 10), // Return top 10 anomalies
      };
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  /**
   * Predict demand for a category
   */
  async predictDemand(
    category: string,
    days: number = 7
  ): Promise<DemandForecast> {
    try {
      const topicId = process.env.MARKETPLACE_EVENTS_TOPIC_ID || '0.0.7158243';
      const messages = await hgraphClient.getTopicMessages(topicId, 1000);

      // Parse messages and filter by category
      const sales = messages
        .map((msg) => {
          try {
            return JSON.parse(Buffer.from(msg.message, 'base64').toString());
          } catch {
            return null;
          }
        })
        .filter((msg) => msg && msg.category === category);

      if (sales.length === 0) {
        return {
          category,
          historicalAverage: 0,
          predictedDemand: 0,
          confidence: 0,
          trend: 'stable',
        };
      }

      // Calculate daily sales
      const dailySales = new Map<string, number>();
      sales.forEach((sale) => {
        const date = new Date(sale.timestamp).toISOString().split('T')[0];
        dailySales.set(date, (dailySales.get(date) || 0) + 1);
      });

      // Calculate moving average
      const values = Array.from(dailySales.values());
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      // Detect trend
      const recentValues = values.slice(-7);
      const olderValues = values.slice(0, -7);
      const recentAvg =
        recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const olderAvg =
        olderValues.reduce((a, b) => a + b, 0) / olderValues.length || recentAvg;

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentAvg > olderAvg * 1.1) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

      // Simple prediction: apply trend to average
      let predictedDemand = average;
      if (trend === 'increasing') predictedDemand = average * 1.15;
      else if (trend === 'decreasing') predictedDemand = average * 0.85;

      return {
        category,
        historicalAverage: average,
        predictedDemand,
        confidence: Math.min(0.95, values.length / 30), // Higher confidence with more data
        trend,
      };
    } catch (error) {
      console.error('Error predicting demand:', error);
      throw error;
    }
  }

  /**
   * Get network health metrics
   */
  async getNetworkHealth() {
    try {
      const stats = await hgraphClient.getNetworkStats();
      
      if (!stats) {
        return {
          status: 'unknown',
          successRate: 0,
          averageFee: 0,
          totalTransactions: 0,
        };
      }

      const status =
        stats.successRate > 95
          ? 'healthy'
          : stats.successRate > 80
          ? 'degraded'
          : 'unhealthy';

      return {
        status,
        successRate: stats.successRate,
        averageFee: stats.averageFee,
        totalTransactions: stats.totalTransactions,
        timestamp: stats.timestamp,
      };
    } catch (error) {
      console.error('Error fetching network health:', error);
      return {
        status: 'unknown',
        successRate: 0,
        averageFee: 0,
        totalTransactions: 0,
      };
    }
  }

  // Private helper methods

  private calculateUptime(transactions: any[]): number {
    // Simple uptime calculation based on transaction consistency
    // In production, this would be more sophisticated
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recentTxs = transactions.filter(
      (t) => new Date(t.consensus_timestamp).getTime() > dayAgo
    );

    return recentTxs.length > 0 ? 99.9 : 0;
  }

  private calculateReputation(
    successRate: number,
    uptime: number,
    totalTxs: number
  ): number {
    // Weighted reputation score
    const successWeight = 0.4;
    const uptimeWeight = 0.4;
    const volumeWeight = 0.2;

    const volumeScore = Math.min(100, (totalTxs / 1000) * 100);

    return (
      successRate * 100 * successWeight +
      uptime * uptimeWeight +
      volumeScore * volumeWeight
    );
  }

  private detectFrequencyAnomalies(transactions: any[]) {
    const anomalies: Array<{
      timestamp: string;
      type: string;
      description: string;
    }> = [];

    // Calculate time intervals between transactions
    const timestamps = transactions.map((t) =>
      new Date(t.consensus_timestamp).getTime()
    );
    const intervals: number[] = [];

    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i - 1] - timestamps[i]);
    }

    if (intervals.length === 0) return anomalies;

    // Calculate mean and standard deviation
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);

    // Flag intervals that are > 2 standard deviations from mean
    intervals.forEach((interval, i) => {
      if (Math.abs(interval - mean) > 2 * stdDev) {
        anomalies.push({
          timestamp: transactions[i].consensus_timestamp,
          type: 'FREQUENCY_ANOMALY',
          description: `Unusual transaction frequency detected`,
        });
      }
    });

    return anomalies;
  }

  private detectAmountAnomalies(transactions: any[]) {
    // Placeholder for amount-based anomaly detection
    return [];
  }

  private detectPatterns(transactions: any[]) {
    const anomalies: Array<{
      timestamp: string;
      type: string;
      description: string;
    }> = [];

    // Check for rapid-fire transactions (potential bot)
    const rapidFireThreshold = 1000; // 1 second
    for (let i = 1; i < transactions.length; i++) {
      const timeDiff =
        new Date(transactions[i - 1].consensus_timestamp).getTime() -
        new Date(transactions[i].consensus_timestamp).getTime();

      if (timeDiff < rapidFireThreshold) {
        anomalies.push({
          timestamp: transactions[i].consensus_timestamp,
          type: 'RAPID_FIRE',
          description: 'Rapid-fire transactions detected (possible bot)',
        });
      }
    }

    return anomalies;
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
