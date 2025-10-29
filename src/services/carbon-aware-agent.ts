import { carbonCalculator, CarbonCalculation } from './carbon';

export interface ModelOption {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  estimatedCost: number;
  carbonFootprint: CarbonCalculation;
  performanceScore: number;
}

export interface CarbonAwareRecommendation {
  recommendedModel: ModelOption;
  alternatives: ModelOption[];
  carbonSavings: number;
  costSavings: number;
  reasoning: string;
}

export class CarbonAwareAgent {
  private readonly MODEL_COSTS = {
    openai: {
      'gpt-4o': 0.005,
      'gpt-4o-mini': 0.00015,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.0005,
    },
    anthropic: {
      'claude-3-5-sonnet-20241022': 0.003,
      'claude-3-haiku-20240307': 0.00025,
      'claude-3-opus-20240229': 0.015,
    },
    google: {
      'gemini-1.5-pro': 0.00125,
      'gemini-1.5-flash': 0.000075,
    },
  };

  /**
   * Choose the most carbon-efficient model for a task
   */
  async chooseCarbonEfficientModel(
    taskType: 'simple' | 'moderate' | 'complex',
    estimatedTokens: number = 1000,
    maxCarbonBudget?: number
  ): Promise<CarbonAwareRecommendation> {
    const computeTimeMs = this.estimateComputeTime(taskType, estimatedTokens);
    const options: ModelOption[] = [];

    // Evaluate all available models
    for (const [provider, models] of Object.entries(this.MODEL_COSTS)) {
      for (const [model, costPerToken] of Object.entries(models)) {
        const carbonFootprint = carbonCalculator.calculate(
          provider,
          model,
          computeTimeMs
        );

        // Skip if exceeds carbon budget
        if (maxCarbonBudget && carbonFootprint.co2Grams > maxCarbonBudget) {
          continue;
        }

        const performanceScore = this.calculatePerformanceScore(
          taskType,
          provider as any,
          model
        );

        options.push({
          provider: provider as any,
          model,
          estimatedCost: costPerToken * estimatedTokens,
          carbonFootprint,
          performanceScore,
        });
      }
    }

    // Sort by carbon efficiency (carbon per performance point)
    options.sort((a, b) => {
      const aEfficiency = a.carbonFootprint.co2Grams / a.performanceScore;
      const bEfficiency = b.carbonFootprint.co2Grams / b.performanceScore;
      return aEfficiency - bEfficiency;
    });

    const recommendedModel = options[0];
    const alternatives = options.slice(1, 4);

    // Calculate savings compared to highest carbon option
    const highestCarbon = options[options.length - 1];
    const carbonSavings = highestCarbon.carbonFootprint.co2Grams - recommendedModel.carbonFootprint.co2Grams;
    const costSavings = highestCarbon.estimatedCost - recommendedModel.estimatedCost;

    const reasoning = this.generateReasoning(
      recommendedModel,
      taskType,
      carbonSavings,
      costSavings
    );

    return {
      recommendedModel,
      alternatives,
      carbonSavings,
      costSavings,
      reasoning,
    };
  }

  /**
   * Calculate cumulative carbon emissions
   */
  async trackCumulativeEmissions(
    operations: Array<{
      provider: string;
      model: string;
      computeTimeMs: number;
    }>
  ): Promise<{
    totalCo2Grams: number;
    totalEnergyKwh: number;
    offsetRecommendation: any;
    breakdown: Array<{ operation: number; co2Grams: number }>;
  }> {
    let totalCo2Grams = 0;
    let totalEnergyKwh = 0;
    const breakdown: Array<{ operation: number; co2Grams: number }> = [];

    operations.forEach((op, index) => {
      const carbon = carbonCalculator.calculate(
        op.provider,
        op.model,
        op.computeTimeMs
      );
      totalCo2Grams += carbon.co2Grams;
      totalEnergyKwh += carbon.energyKwh;
      breakdown.push({ operation: index + 1, co2Grams: carbon.co2Grams });
    });

    const offsetRecommendation = carbonCalculator.getOffsetRecommendation(totalCo2Grams);

    return {
      totalCo2Grams,
      totalEnergyKwh,
      offsetRecommendation,
      breakdown,
    };
  }

  /**
   * Suggest carbon offset actions
   */
  suggestCarbonOffsets(co2Grams: number): {
    trees: number;
    cost: number;
    actions: Array<{
      action: string;
      impact: string;
      cost: number;
    }>;
  } {
    const offset = carbonCalculator.getOffsetRecommendation(co2Grams);

    return {
      trees: offset.trees,
      cost: offset.cost,
      actions: [
        {
          action: 'Plant trees through verified programs',
          impact: `${offset.trees} trees absorb ${co2Grams.toFixed(2)}g CO2 over their lifetime`,
          cost: offset.trees * 1.5,
        },
        {
          action: 'Purchase renewable energy credits',
          impact: 'Support clean energy generation',
          cost: offset.cost * 0.8,
        },
        {
          action: 'Invest in carbon capture technology',
          impact: 'Direct air capture removes CO2 from atmosphere',
          cost: offset.cost * 1.2,
        },
      ],
    };
  }

  /**
   * Monitor and alert on carbon budget
   */
  async monitorCarbonBudget(
    currentUsage: number,
    budget: number,
    alertThresholds: number[] = [50, 75, 90]
  ): Promise<{
    status: 'safe' | 'warning' | 'critical';
    percentageUsed: number;
    remaining: number;
    alerts: string[];
  }> {
    const percentageUsed = (currentUsage / budget) * 100;
    const remaining = budget - currentUsage;
    const alerts: string[] = [];

    let status: 'safe' | 'warning' | 'critical' = 'safe';

    if (percentageUsed >= alertThresholds[2]) {
      status = 'critical';
      alerts.push(`🚨 CRITICAL: ${percentageUsed.toFixed(1)}% of carbon budget used`);
      alerts.push(`Only ${remaining.toFixed(2)}g CO2 remaining`);
    } else if (percentageUsed >= alertThresholds[1]) {
      status = 'warning';
      alerts.push(`⚠️ WARNING: ${percentageUsed.toFixed(1)}% of carbon budget used`);
    } else if (percentageUsed >= alertThresholds[0]) {
      alerts.push(`ℹ️ INFO: ${percentageUsed.toFixed(1)}% of carbon budget used`);
    }

    return {
      status,
      percentageUsed,
      remaining,
      alerts,
    };
  }

  /**
   * Get carbon-aware scheduling recommendation
   */
  getCarbonAwareScheduling(): {
    bestTime: string;
    carbonIntensity: number;
    recommendation: string;
  } {
    const hour = new Date().getHours();

    // Simplified carbon intensity by time of day
    // In production, this would use real-time grid data
    let carbonIntensity: number;
    let bestTime: string;
    let recommendation: string;

    if (hour >= 10 && hour <= 16) {
      // Peak solar hours
      carbonIntensity = 200;
      bestTime = 'now';
      recommendation = 'Current time is optimal - high solar generation';
    } else if (hour >= 0 && hour <= 6) {
      // Night hours - often wind power
      carbonIntensity = 250;
      bestTime = 'now';
      recommendation = 'Good time - wind power typically available';
    } else {
      // Peak demand hours
      carbonIntensity = 400;
      bestTime = '10:00-16:00';
      recommendation = 'Consider scheduling for peak solar hours (10am-4pm)';
    }

    return {
      bestTime,
      carbonIntensity,
      recommendation,
    };
  }

  // Private helper methods

  private estimateComputeTime(
    taskType: 'simple' | 'moderate' | 'complex',
    tokens: number
  ): number {
    const baseTime = {
      simple: 1000, // 1 second
      moderate: 3000, // 3 seconds
      complex: 10000, // 10 seconds
    };

    // Scale by tokens
    return baseTime[taskType] * (tokens / 1000);
  }

  private calculatePerformanceScore(
    taskType: 'simple' | 'moderate' | 'complex',
    provider: 'openai' | 'anthropic' | 'google',
    model: string
  ): number {
    // Performance scores based on model capabilities
    const scores: Record<string, Record<string, number>> = {
      openai: {
        'gpt-4o': 95,
        'gpt-4o-mini': 85,
        'gpt-4-turbo': 90,
        'gpt-3.5-turbo': 75,
      },
      anthropic: {
        'claude-3-5-sonnet-20241022': 95,
        'claude-3-haiku-20240307': 80,
        'claude-3-opus-20240229': 98,
      },
      google: {
        'gemini-1.5-pro': 90,
        'gemini-1.5-flash': 82,
      },
    };

    const baseScore = scores[provider]?.[model] || 70;

    // Adjust for task complexity
    const taskMultiplier = {
      simple: 1.0,
      moderate: 0.95,
      complex: 0.9,
    };

    return baseScore * taskMultiplier[taskType];
  }

  private generateReasoning(
    model: ModelOption,
    taskType: string,
    carbonSavings: number,
    costSavings: number
  ): string {
    const parts = [
      `Recommended ${model.provider} ${model.model} for ${taskType} task.`,
      `Carbon footprint: ${model.carbonFootprint.co2Grams.toFixed(2)}g CO2.`,
    ];

    if (carbonSavings > 0) {
      parts.push(`Saves ${carbonSavings.toFixed(2)}g CO2 compared to least efficient option.`);
    }

    if (costSavings > 0) {
      parts.push(`Saves $${costSavings.toFixed(4)} in costs.`);
    }

    parts.push(`Performance score: ${model.performanceScore}/100.`);

    return parts.join(' ');
  }
}

// Singleton instance
export const carbonAwareAgent = new CarbonAwareAgent();
