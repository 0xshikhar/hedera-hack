// Server-safe analytics service (no hgraphClient dependency)
// This version uses mock data to avoid React context issues in API routes

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
  demandMultiplier: number;
}

export class ServerAnalyticsService {
  /**
   * Get comprehensive marketplace statistics
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    // Mock data for server-side rendering
    return {
      totalSales: 156,
      totalVolume: 12450,
      uniqueBuyers: 89,
      uniqueSellers: 34,
      averagePrice: 79.81,
      last24hSales: 23,
      last24hVolume: 1840,
    };
  }

  /**
   * Get provider performance metrics
   */
  async getProviderPerformance(providerId: string): Promise<ProviderPerformance> {
    // Mock data
    return {
      providerId,
      totalTransactions: 1250,
      successRate: 98.5,
      averageFee: 0.05,
      uptime: 99.2,
      reputation: 95,
      lastActive: new Date().toISOString(),
    };
  }

  /**
   * Detect anomalies in account activity
   */
  async detectAnomalies(accountId: string): Promise<AnomalyDetection> {
    // Mock data
    return {
      accountId,
      totalTransactions: 450,
      anomalyCount: 2,
      riskScore: 15,
      isHighRisk: false,
      anomalies: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'unusual_volume',
          description: 'Transaction volume 3x higher than average',
        },
      ],
    };
  }

  /**
   * Predict demand for a category
   */
  async predictDemand(category: string, daysAhead: number = 7): Promise<DemandForecast> {
    // Mock predictions based on category
    const categoryMultipliers: Record<string, number> = {
      medical: 1.25,
      finance: 1.15,
      retail: 0.95,
      education: 1.10,
      research: 1.30,
    };

    const multiplier = categoryMultipliers[category] || 1.0;
    const historicalAverage = 100;

    return {
      category,
      historicalAverage,
      predictedDemand: historicalAverage * multiplier,
      confidence: 0.85,
      trend: multiplier > 1.1 ? 'increasing' : multiplier < 0.95 ? 'decreasing' : 'stable',
      demandMultiplier: multiplier,
    };
  }

  /**
   * Calculate reputation score
   */
  private calculateReputation(
    successRate: number,
    uptime: number,
    totalTransactions: number
  ): number {
    const successWeight = 0.4;
    const uptimeWeight = 0.3;
    const volumeWeight = 0.3;

    const volumeScore = Math.min(100, (totalTransactions / 1000) * 100);

    return (
      successRate * successWeight +
      uptime * uptimeWeight +
      volumeScore * volumeWeight
    );
  }

  /**
   * Calculate uptime based on transaction consistency
   */
  private calculateUptime(transactions: unknown[]): number {
    // Simplified uptime calculation
    return 99.2;
  }
}

// Singleton instance
export const serverAnalyticsService = new ServerAnalyticsService();
