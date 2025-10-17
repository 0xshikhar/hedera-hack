import { hgraphClient } from '@/lib/hgraph/client';
import { analyticsService } from './analytics';

export interface PricingFactors {
  basePrice: number;
  qualityScore: number;
  demandMultiplier: number;
  providerReputation: number;
  datasetSize: number;
  category: string;
  carbonFootprint: number;
}

export interface DynamicPrice {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: {
    quality: number;
    demand: number;
    reputation: number;
    sustainability: number;
  };
  reasoning: string[];
}

export interface DemandPrediction {
  category: string;
  currentDemand: number;
  predictedDemand: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface MarketInsights {
  topCategories: Array<{ category: string; volume: number; growth: number }>;
  priceTrends: Array<{ category: string; avgPrice: number; change: number }>;
  supplierMetrics: {
    totalSuppliers: number;
    activeSuppliers: number;
    avgReputation: number;
  };
  recommendations: string[];
}

export class AIEconomicsService {
  private readonly BASE_PRICE = 10; // Base price in HBAR
  private readonly QUALITY_WEIGHT = 0.3;
  private readonly DEMAND_WEIGHT = 0.25;
  private readonly REPUTATION_WEIGHT = 0.25;
  private readonly SUSTAINABILITY_WEIGHT = 0.2;

  /**
   * Calculate dynamic pricing using AI-powered algorithm
   */
  async calculateDynamicPrice(factors: PricingFactors): Promise<DynamicPrice> {
    const reasoning: string[] = [];

    // 1. Quality Score Factor (0-100 -> 0.5-1.5x multiplier)
    const qualityMultiplier = 0.5 + (factors.qualityScore / 100);
    const qualityImpact = factors.basePrice * qualityMultiplier * this.QUALITY_WEIGHT;
    reasoning.push(
      `Quality score ${factors.qualityScore}/100 adds ${qualityImpact.toFixed(2)} HBAR`
    );

    // 2. Demand Factor
    const demandImpact = factors.basePrice * factors.demandMultiplier * this.DEMAND_WEIGHT;
    reasoning.push(
      `${factors.demandMultiplier > 1 ? 'High' : 'Low'} demand (${factors.demandMultiplier}x) ${
        factors.demandMultiplier > 1 ? 'increases' : 'decreases'
      } price by ${Math.abs(demandImpact).toFixed(2)} HBAR`
    );

    // 3. Provider Reputation Factor (0-100 -> 0.8-1.2x multiplier)
    const reputationMultiplier = 0.8 + (factors.providerReputation / 250);
    const reputationImpact =
      factors.basePrice * reputationMultiplier * this.REPUTATION_WEIGHT;
    reasoning.push(
      `Provider reputation ${factors.providerReputation}/100 adds ${reputationImpact.toFixed(
        2
      )} HBAR`
    );

    // 4. Sustainability Factor (lower carbon = higher value)
    const carbonScore = Math.max(0, 100 - factors.carbonFootprint);
    const sustainabilityMultiplier = 0.9 + (carbonScore / 1000);
    const sustainabilityImpact =
      factors.basePrice * sustainabilityMultiplier * this.SUSTAINABILITY_WEIGHT;
    reasoning.push(
      `Low carbon footprint (${factors.carbonFootprint.toFixed(
        2
      )}g CO₂) adds ${sustainabilityImpact.toFixed(2)} HBAR`
    );

    // Calculate final price
    const suggestedPrice =
      qualityImpact + demandImpact + reputationImpact + sustainabilityImpact;

    // Set price bounds (±30%)
    const minPrice = suggestedPrice * 0.7;
    const maxPrice = suggestedPrice * 1.3;

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(factors);

    return {
      suggestedPrice: Math.max(1, suggestedPrice), // Minimum 1 HBAR
      minPrice: Math.max(0.5, minPrice),
      maxPrice,
      confidence,
      factors: {
        quality: qualityMultiplier,
        demand: factors.demandMultiplier,
        reputation: reputationMultiplier,
        sustainability: sustainabilityMultiplier,
      },
      reasoning,
    };
  }

  /**
   * Predict demand for a category using historical data
   */
  async predictDemand(
    category: string,
    timeframeDays: number = 7
  ): Promise<DemandPrediction> {
    try {
      // Use analytics service to get historical data
      const forecast = await analyticsService.predictDemand(category, timeframeDays);

      const factors: string[] = [];

      // Analyze trend factors
      if (forecast.trend === 'increasing') {
        factors.push('Growing market interest');
        factors.push('Recent sales momentum');
      } else if (forecast.trend === 'decreasing') {
        factors.push('Market saturation');
        factors.push('Declining interest');
      } else {
        factors.push('Stable market conditions');
      }

      // Add confidence factors
      if (forecast.confidence > 0.8) {
        factors.push('High historical data availability');
      } else if (forecast.confidence < 0.5) {
        factors.push('Limited historical data');
      }

      return {
        category,
        currentDemand: forecast.historicalAverage,
        predictedDemand: forecast.predictedDemand,
        trend: forecast.trend,
        confidence: forecast.confidence,
        timeframe: `${timeframeDays} days`,
        factors,
      };
    } catch (error) {
      console.error('Error predicting demand:', error);
      return {
        category,
        currentDemand: 0,
        predictedDemand: 0,
        trend: 'stable',
        confidence: 0,
        timeframe: `${timeframeDays} days`,
        factors: ['Insufficient data'],
      };
    }
  }

  /**
   * Generate market insights and recommendations
   */
  async generateMarketInsights(): Promise<MarketInsights> {
    try {
      const stats = await analyticsService.getMarketplaceStats();

      // Mock data for demonstration
      const topCategories = [
        { category: 'Healthcare', volume: 150, growth: 25 },
        { category: 'Finance', volume: 120, growth: 15 },
        { category: 'Retail', volume: 100, growth: 10 },
        { category: 'Manufacturing', volume: 80, growth: 30 },
        { category: 'Education', volume: 60, growth: 20 },
      ];

      const priceTrends = [
        { category: 'Healthcare', avgPrice: 15.5, change: 5 },
        { category: 'Finance', avgPrice: 18.2, change: -2 },
        { category: 'Retail', avgPrice: 12.0, change: 8 },
        { category: 'Manufacturing', avgPrice: 14.5, change: 3 },
        { category: 'Education', avgPrice: 10.0, change: 0 },
      ];

      const recommendations: string[] = [];

      // Generate AI recommendations
      if (stats.totalSales > 100) {
        recommendations.push(
          'Market is active - consider increasing dataset production'
        );
      }

      if (stats.averagePrice > 15) {
        recommendations.push(
          'High average prices - opportunity for competitive pricing'
        );
      }

      recommendations.push(
        'Healthcare and Manufacturing showing strong growth trends'
      );
      recommendations.push(
        'Consider carbon-neutral datasets for premium pricing'
      );

      return {
        topCategories,
        priceTrends,
        supplierMetrics: {
          totalSuppliers: stats.uniqueSellers,
          activeSuppliers: Math.floor(stats.uniqueSellers * 0.8),
          avgReputation: 75,
        },
        recommendations,
      };
    } catch (error) {
      console.error('Error generating market insights:', error);
      return {
        topCategories: [],
        priceTrends: [],
        supplierMetrics: {
          totalSuppliers: 0,
          activeSuppliers: 0,
          avgReputation: 0,
        },
        recommendations: ['Unable to generate insights - insufficient data'],
      };
    }
  }

  /**
   * Calculate optimal pricing strategy
   */
  async calculateOptimalStrategy(
    currentPrice: number,
    category: string,
    qualityScore: number
  ): Promise<{
    recommendedPrice: number;
    expectedSales: number;
    expectedRevenue: number;
    strategy: string;
  }> {
    const demand = await this.predictDemand(category);

    let recommendedPrice = currentPrice;
    let strategy = 'maintain';

    // Price optimization logic
    if (demand.trend === 'increasing' && qualityScore > 80) {
      recommendedPrice = currentPrice * 1.15;
      strategy = 'premium';
    } else if (demand.trend === 'decreasing') {
      recommendedPrice = currentPrice * 0.9;
      strategy = 'competitive';
    } else if (qualityScore < 60) {
      recommendedPrice = currentPrice * 0.85;
      strategy = 'value';
    }

    // Estimate sales based on price and demand
    const priceElasticity = 1.5; // Assume elastic demand
    const salesMultiplier =
      demand.demandMultiplier * Math.pow(currentPrice / recommendedPrice, priceElasticity);
    const expectedSales = Math.max(1, demand.currentDemand * salesMultiplier);
    const expectedRevenue = expectedSales * recommendedPrice;

    return {
      recommendedPrice,
      expectedSales: Math.round(expectedSales),
      expectedRevenue: Math.round(expectedRevenue * 100) / 100,
      strategy,
    };
  }

  /**
   * Calculate confidence score for pricing
   */
  private calculateConfidence(factors: PricingFactors): number {
    let confidence = 0;

    // Quality score available
    if (factors.qualityScore > 0) confidence += 0.25;

    // Demand data available
    if (factors.demandMultiplier !== 1) confidence += 0.25;

    // Reputation data available
    if (factors.providerReputation > 0) confidence += 0.25;

    // Carbon data available
    if (factors.carbonFootprint > 0) confidence += 0.25;

    return confidence;
  }

  /**
   * Calculate ROI for dataset creation
   */
  calculateROI(
    creationCost: number,
    expectedPrice: number,
    expectedSales: number,
    carbonOffsetCost: number
  ): {
    roi: number;
    breakEvenSales: number;
    profitMargin: number;
  } {
    const totalCost = creationCost + carbonOffsetCost;
    const revenue = expectedPrice * expectedSales;
    const profit = revenue - totalCost;
    const roi = (profit / totalCost) * 100;
    const breakEvenSales = Math.ceil(totalCost / expectedPrice);
    const profitMargin = ((expectedPrice - totalCost / expectedSales) / expectedPrice) * 100;

    return {
      roi,
      breakEvenSales,
      profitMargin,
    };
  }
}

// Singleton instance
export const aiEconomicsService = new AIEconomicsService();
