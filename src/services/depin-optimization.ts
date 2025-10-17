import { hgraphClient } from '@/lib/hgraph/client';

export interface ProviderNode {
  providerId: string;
  location: {
    latitude: number;
    longitude: number;
    region: string;
    country: string;
  };
  capacity: {
    storage: number; // TB
    bandwidth: number; // Mbps
    compute: number; // CPU cores
  };
  utilization: {
    storage: number; // percentage
    bandwidth: number; // percentage
    compute: number; // percentage
  };
  performance: {
    uptime: number;
    avgResponseTime: number; // ms
    successRate: number;
  };
  reputation: number;
  earnings: number;
}

export interface NetworkTopology {
  totalNodes: number;
  activeNodes: number;
  geographicDistribution: Map<string, number>;
  totalCapacity: {
    storage: number;
    bandwidth: number;
    compute: number;
  };
  avgUtilization: {
    storage: number;
    bandwidth: number;
    compute: number;
  };
  healthScore: number;
}

export interface OptimizationRecommendation {
  type: 'capacity' | 'geographic' | 'performance' | 'economic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  action: string;
  estimatedBenefit: {
    metric: string;
    improvement: number;
  };
}

export interface LoadBalancingStrategy {
  providerId: string;
  recommendedLoad: number;
  reasoning: string[];
  priority: number;
}

export class DePINOptimizationService {
  /**
   * Analyze network topology
   */
  async analyzeNetworkTopology(providers: ProviderNode[]): Promise<NetworkTopology> {
    const activeNodes = providers.filter((p) => p.performance.uptime > 95).length;

    // Geographic distribution
    const geoDist = new Map<string, number>();
    providers.forEach((p) => {
      const region = p.location.region;
      geoDist.set(region, (geoDist.get(region) || 0) + 1);
    });

    // Total capacity
    const totalCapacity = {
      storage: providers.reduce((sum, p) => sum + p.capacity.storage, 0),
      bandwidth: providers.reduce((sum, p) => sum + p.capacity.bandwidth, 0),
      compute: providers.reduce((sum, p) => sum + p.capacity.compute, 0),
    };

    // Average utilization
    const avgUtilization = {
      storage:
        providers.reduce((sum, p) => sum + p.utilization.storage, 0) /
        providers.length,
      bandwidth:
        providers.reduce((sum, p) => sum + p.utilization.bandwidth, 0) /
        providers.length,
      compute:
        providers.reduce((sum, p) => sum + p.utilization.compute, 0) /
        providers.length,
    };

    // Health score
    const healthScore = this.calculateNetworkHealth(providers);

    return {
      totalNodes: providers.length,
      activeNodes,
      geographicDistribution: geoDist,
      totalCapacity,
      avgUtilization,
      healthScore,
    };
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations(
    providers: ProviderNode[],
    topology: NetworkTopology
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // 1. Capacity optimization
    if (topology.avgUtilization.storage > 80) {
      recommendations.push({
        type: 'capacity',
        priority: 'high',
        title: 'Storage Capacity Critical',
        description: 'Network storage utilization exceeds 80%',
        impact: 'May lead to service degradation and failed uploads',
        action: 'Recruit additional storage providers or upgrade existing capacity',
        estimatedBenefit: {
          metric: 'storage_capacity',
          improvement: 50,
        },
      });
    }

    // 2. Geographic distribution
    const regions = Array.from(topology.geographicDistribution.keys());
    if (regions.length < 3) {
      recommendations.push({
        type: 'geographic',
        priority: 'medium',
        title: 'Limited Geographic Distribution',
        description: `Network only spans ${regions.length} region(s)`,
        impact: 'Higher latency for users in underserved regions',
        action: 'Expand to additional geographic regions',
        estimatedBenefit: {
          metric: 'avg_latency',
          improvement: 30,
        },
      });
    }

    // 3. Performance optimization
    const lowPerformers = providers.filter((p) => p.performance.uptime < 95);
    if (lowPerformers.length > providers.length * 0.1) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Multiple Low-Performance Providers',
        description: `${lowPerformers.length} providers with uptime < 95%`,
        impact: 'Reduced network reliability and user experience',
        action: 'Review and optimize low-performing providers',
        estimatedBenefit: {
          metric: 'network_uptime',
          improvement: 5,
        },
      });
    }

    // 4. Economic optimization
    const avgEarnings =
      providers.reduce((sum, p) => sum + p.earnings, 0) / providers.length;
    const lowEarners = providers.filter((p) => p.earnings < avgEarnings * 0.5);
    if (lowEarners.length > 0) {
      recommendations.push({
        type: 'economic',
        priority: 'medium',
        title: 'Unbalanced Provider Economics',
        description: `${lowEarners.length} providers earning below 50% of average`,
        impact: 'Risk of provider churn and network instability',
        action: 'Implement load balancing to distribute work more evenly',
        estimatedBenefit: {
          metric: 'provider_retention',
          improvement: 20,
        },
      });
    }

    // 5. Bandwidth optimization
    if (topology.avgUtilization.bandwidth > 70) {
      recommendations.push({
        type: 'capacity',
        priority: 'medium',
        title: 'High Bandwidth Utilization',
        description: 'Network bandwidth utilization at 70%+',
        impact: 'Slower data transfers during peak times',
        action: 'Upgrade bandwidth capacity or add CDN layer',
        estimatedBenefit: {
          metric: 'transfer_speed',
          improvement: 40,
        },
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    return recommendations;
  }

  /**
   * Calculate optimal load balancing
   */
  calculateLoadBalancing(providers: ProviderNode[]): LoadBalancingStrategy[] {
    const strategies: LoadBalancingStrategy[] = [];

    // Calculate provider scores
    const scores = providers.map((p) => ({
      providerId: p.providerId,
      score: this.calculateProviderScore(p),
      currentLoad: (p.utilization.storage + p.utilization.bandwidth) / 2,
    }));

    // Sort by score (best first)
    scores.sort((a, b) => b.score - a.score);

    // Distribute load based on scores
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

    scores.forEach((s) => {
      const optimalLoad = (s.score / totalScore) * 100;
      const loadDiff = optimalLoad - s.currentLoad;

      const reasoning: string[] = [];

      if (loadDiff > 10) {
        reasoning.push('Provider is underutilized relative to capacity');
        reasoning.push('Can handle additional load efficiently');
      } else if (loadDiff < -10) {
        reasoning.push('Provider is overloaded');
        reasoning.push('Should reduce load to prevent degradation');
      } else {
        reasoning.push('Current load is optimal');
      }

      strategies.push({
        providerId: s.providerId,
        recommendedLoad: Math.round(optimalLoad),
        reasoning,
        priority: Math.abs(loadDiff) > 20 ? 3 : Math.abs(loadDiff) > 10 ? 2 : 1,
      });
    });

    // Sort by priority
    strategies.sort((a, b) => b.priority - a.priority);

    return strategies;
  }

  /**
   * Find optimal provider for request
   */
  findOptimalProvider(
    providers: ProviderNode[],
    requirements: {
      storageNeeded: number;
      bandwidthNeeded: number;
      preferredRegion?: string;
      maxLatency?: number;
    }
  ): {
    providerId: string;
    score: number;
    reasoning: string[];
  } | null {
    // Filter providers that meet requirements
    const eligible = providers.filter(
      (p) =>
        p.capacity.storage * (1 - p.utilization.storage / 100) >=
          requirements.storageNeeded &&
        p.capacity.bandwidth * (1 - p.utilization.bandwidth / 100) >=
          requirements.bandwidthNeeded &&
        p.performance.uptime > 95
    );

    if (eligible.length === 0) {
      return null;
    }

    // Score each provider
    const scored = eligible.map((p) => {
      let score = this.calculateProviderScore(p);
      const reasoning: string[] = [];

      // Bonus for preferred region
      if (requirements.preferredRegion && p.location.region === requirements.preferredRegion) {
        score += 20;
        reasoning.push('Located in preferred region');
      }

      // Bonus for low utilization
      const avgUtil = (p.utilization.storage + p.utilization.bandwidth) / 2;
      if (avgUtil < 50) {
        score += 10;
        reasoning.push('Low current utilization');
      }

      // Bonus for high reputation
      if (p.reputation > 90) {
        score += 15;
        reasoning.push('Excellent reputation');
      }

      reasoning.push(`Overall score: ${score.toFixed(1)}`);

      return {
        providerId: p.providerId,
        score,
        reasoning,
      };
    });

    // Return best provider
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }

  /**
   * Monitor network health in real-time
   */
  async monitorNetworkHealth(providers: ProviderNode[]): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    issues: Array<{
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    metrics: {
      avgUptime: number;
      avgResponseTime: number;
      totalCapacity: number;
      utilizationRate: number;
    };
  }> {
    const issues: Array<{
      severity: 'low' | 'medium' | 'high';
      description: string;
    }> = [];

    // Calculate metrics
    const avgUptime =
      providers.reduce((sum, p) => sum + p.performance.uptime, 0) /
      providers.length;

    const avgResponseTime =
      providers.reduce((sum, p) => sum + p.performance.avgResponseTime, 0) /
      providers.length;

    const totalCapacity = providers.reduce(
      (sum, p) => sum + p.capacity.storage,
      0
    );

    const avgUtilization =
      providers.reduce((sum, p) => sum + p.utilization.storage, 0) /
      providers.length;

    // Check for issues
    if (avgUptime < 95) {
      issues.push({
        severity: 'high',
        description: `Network uptime below 95% (${avgUptime.toFixed(1)}%)`,
      });
    }

    if (avgResponseTime > 1000) {
      issues.push({
        severity: 'medium',
        description: `High average response time (${avgResponseTime.toFixed(0)}ms)`,
      });
    }

    if (avgUtilization > 80) {
      issues.push({
        severity: 'high',
        description: `Storage utilization critical (${avgUtilization.toFixed(1)}%)`,
      });
    }

    const activeProviders = providers.filter((p) => p.performance.uptime > 95)
      .length;
    if (activeProviders < providers.length * 0.8) {
      issues.push({
        severity: 'medium',
        description: `Only ${activeProviders}/${providers.length} providers active`,
      });
    }

    // Determine status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (issues.some((i) => i.severity === 'high')) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      issues,
      metrics: {
        avgUptime,
        avgResponseTime,
        totalCapacity,
        utilizationRate: avgUtilization,
      },
    };
  }

  /**
   * Calculate provider score
   */
  private calculateProviderScore(provider: ProviderNode): number {
    let score = 0;

    // Uptime (40 points)
    score += (provider.performance.uptime / 100) * 40;

    // Response time (20 points) - lower is better
    const responseScore = Math.max(0, 20 - provider.performance.avgResponseTime / 50);
    score += responseScore;

    // Success rate (20 points)
    score += (provider.performance.successRate / 100) * 20;

    // Reputation (20 points)
    score += (provider.reputation / 100) * 20;

    return score;
  }

  /**
   * Calculate network health score
   */
  private calculateNetworkHealth(providers: ProviderNode[]): number {
    if (providers.length === 0) return 0;

    let score = 0;

    // Active nodes (30 points)
    const activeRatio =
      providers.filter((p) => p.performance.uptime > 95).length /
      providers.length;
    score += activeRatio * 30;

    // Average uptime (30 points)
    const avgUptime =
      providers.reduce((sum, p) => sum + p.performance.uptime, 0) /
      providers.length;
    score += (avgUptime / 100) * 30;

    // Utilization balance (20 points) - not too high, not too low
    const avgUtil =
      providers.reduce((sum, p) => sum + p.utilization.storage, 0) /
      providers.length;
    const utilScore = avgUtil > 50 && avgUtil < 80 ? 20 : avgUtil < 50 ? 15 : 10;
    score += utilScore;

    // Geographic distribution (20 points)
    const regions = new Set(providers.map((p) => p.location.region));
    const geoScore = Math.min(20, regions.size * 5);
    score += geoScore;

    return Math.round(score);
  }
}

// Singleton instance
export const depinOptimization = new DePINOptimizationService();
