import { Client } from '@hashgraph/sdk';
import { ProvenanceService, TrainingDataLineage } from './provenance';
import { carbonCalculator } from './carbon';
import { carbonAwareAgent } from './carbon-aware-agent';
import { aiMirrorAnalytics } from './ai-mirror-analytics';

export interface EnhancedGenerationOptions {
  datasetId: string;
  model?: string;
  provider?: 'openai' | 'anthropic' | 'google';
  taskComplexity?: 'simple' | 'moderate' | 'complex';
  maxCarbonBudget?: number;
  enableCarbonOptimization?: boolean;
  creator: string;
  sourceDataset?: {
    name: string;
    config: string;
    split: string;
    samplesUsed: number;
    inputFeature: string;
  };
}

export interface EnhancedGenerationResult {
  success: boolean;
  datasetId: string;
  model: string;
  provider: string;
  carbonFootprint: {
    co2Grams: number;
    energyKwh: number;
    offsetCost: number;
  };
  provenance: {
    transactionId?: string;
    sequenceNumber?: number;
    inputHash: string;
    outputHash: string;
  };
  recommendations?: {
    carbonSavings?: number;
    alternativeModels?: any[];
  };
  error?: string;
}

export class EnhancedGenerationService {
  private provenanceService: ProvenanceService;

  constructor(hederaClient: Client) {
    this.provenanceService = new ProvenanceService(hederaClient);
  }

  /**
   * Generate dataset with full provenance tracking and carbon awareness
   */
  async generateWithTracking(
    input: string,
    output: string,
    options: EnhancedGenerationOptions
  ): Promise<EnhancedGenerationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Choose optimal model if carbon optimization enabled
      let selectedModel = options.model || 'gpt-4o-mini';
      let selectedProvider = options.provider || 'openai';
      let carbonRecommendation;

      if (options.enableCarbonOptimization) {
        console.log('🌱 Carbon-aware model selection enabled');
        
        carbonRecommendation = await carbonAwareAgent.chooseCarbonEfficientModel(
          options.taskComplexity || 'moderate',
          input.length + output.length,
          options.maxCarbonBudget
        );

        selectedModel = carbonRecommendation.recommendedModel.model;
        selectedProvider = carbonRecommendation.recommendedModel.provider;

        console.log(`✅ Selected carbon-efficient model: ${selectedProvider}/${selectedModel}`);
        console.log(`   Carbon: ${carbonRecommendation.recommendedModel.carbonFootprint.co2Grams.toFixed(2)}g CO2`);
        console.log(`   Savings: ${carbonRecommendation.carbonSavings.toFixed(2)}g CO2`);
      }

      // Step 2: Calculate carbon footprint
      const computeTimeMs = Date.now() - startTime;
      const carbonFootprint = carbonCalculator.calculate(
        selectedProvider,
        selectedModel,
        computeTimeMs
      );

      console.log(`🌍 Carbon footprint: ${carbonFootprint.co2Grams.toFixed(2)}g CO2`);

      // Step 3: Track training data lineage if source dataset provided
      if (options.sourceDataset) {
        const lineage: TrainingDataLineage = {
          sourceDataset: options.sourceDataset.name,
          sourceConfig: options.sourceDataset.config,
          sourceSplit: options.sourceDataset.split,
          samplesUsed: options.sourceDataset.samplesUsed,
          inputFeature: options.sourceDataset.inputFeature,
          transformations: ['ai_generation', 'synthetic_augmentation'],
          verificationHash: this.generateHash(output),
        };

        await this.provenanceService.trackTrainingDataLineage(
          options.datasetId,
          lineage
        );

        console.log('✅ Training data lineage tracked');
      }

      // Step 4: Log complete AI operation to HCS
      const provenanceResult = await this.provenanceService.logAIOperation(
        'dataset_generation',
        selectedModel,
        selectedProvider,
        input,
        output,
        {
          temperature: 0.7,
          maxTokens: 2000,
        },
        {
          computeTimeMs,
          energyKwh: carbonFootprint.energyKwh,
          co2Grams: carbonFootprint.co2Grams,
        },
        options.creator,
        {
          datasetId: options.datasetId,
          trainingDataLineage: options.sourceDataset ? {
            sourceDataset: options.sourceDataset.name,
            sourceConfig: options.sourceDataset.config,
            sourceSplit: options.sourceDataset.split,
            samplesUsed: options.sourceDataset.samplesUsed,
            inputFeature: options.sourceDataset.inputFeature,
            transformations: ['ai_generation'],
            verificationHash: this.generateHash(output),
          } : undefined,
        }
      );

      console.log('✅ Provenance logged to Hedera');

      return {
        success: true,
        datasetId: options.datasetId,
        model: selectedModel,
        provider: selectedProvider,
        carbonFootprint: {
          co2Grams: carbonFootprint.co2Grams,
          energyKwh: carbonFootprint.energyKwh,
          offsetCost: carbonFootprint.offsetCost,
        },
        provenance: {
          transactionId: provenanceResult.transactionId,
          sequenceNumber: provenanceResult.sequenceNumber,
          inputHash: this.generateHash(input),
          outputHash: this.generateHash(output),
        },
        recommendations: carbonRecommendation ? {
          carbonSavings: carbonRecommendation.carbonSavings,
          alternativeModels: carbonRecommendation.alternatives,
        } : undefined,
      };
    } catch (error) {
      console.error('Error in enhanced generation:', error);
      return {
        success: false,
        datasetId: options.datasetId,
        model: options.model || 'unknown',
        provider: options.provider || 'unknown',
        carbonFootprint: {
          co2Grams: 0,
          energyKwh: 0,
          offsetCost: 0,
        },
        provenance: {
          inputHash: '',
          outputHash: '',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get AI-powered insights for dataset pricing
   */
  async getPricingInsights(
    category: string,
    quality: number,
    size: number
  ): Promise<{
    recommendedPrice: number;
    priceRange: { min: number; max: number };
    marketTrends: any;
    reasoning: string;
  }> {
    const pricing = await aiMirrorAnalytics.recommendPricing(category, quality, size);
    const trends = await aiMirrorAnalytics.predictMarketplaceTrends();
    
    const categoryTrend = trends.find(t => t.category === category);

    return {
      ...pricing,
      marketTrends: categoryTrend,
    };
  }

  /**
   * Get network health and recommendations
   */
  async getNetworkRecommendations(): Promise<{
    health: any;
    insights: any[];
    shouldProceed: boolean;
    reasoning: string;
  }> {
    const health = await aiMirrorAnalytics.analyzeNetworkHealth();
    const insights = await aiMirrorAnalytics.generateInsights(5);

    const shouldProceed = health.overall > 70;
    const reasoning = shouldProceed
      ? 'Network health is good, safe to proceed with operations'
      : 'Network health is degraded, consider waiting for better conditions';

    return {
      health,
      insights,
      shouldProceed,
      reasoning,
    };
  }

  /**
   * Monitor carbon budget in real-time
   */
  async monitorCarbonUsage(
    currentUsage: number,
    budget: number
  ): Promise<{
    status: 'safe' | 'warning' | 'critical';
    percentageUsed: number;
    remaining: number;
    alerts: string[];
    offsetRecommendation?: any;
  }> {
    const monitoring = await carbonAwareAgent.monitorCarbonBudget(
      currentUsage,
      budget
    );

    let offsetRecommendation;
    if (monitoring.status === 'warning' || monitoring.status === 'critical') {
      offsetRecommendation = carbonAwareAgent.suggestCarbonOffsets(currentUsage);
    }

    return {
      ...monitoring,
      offsetRecommendation,
    };
  }

  /**
   * Get carbon-aware scheduling recommendation
   */
  getCarbonScheduling(): {
    bestTime: string;
    carbonIntensity: number;
    recommendation: string;
  } {
    return carbonAwareAgent.getCarbonAwareScheduling();
  }

  /**
   * Submit community verification
   */
  async submitVerification(
    datasetId: string,
    verifier: string,
    vote: 'upvote' | 'downvote',
    comments?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.provenanceService.submitVerificationVote(
      datasetId,
      verifier,
      vote,
      comments
    );
  }

  /**
   * Get comprehensive provenance stats
   */
  async getProvenanceStats() {
    return this.provenanceService.getProvenanceStats();
  }

  // Private helper methods

  private generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

// Factory function to create service instance
export function createEnhancedGenerationService(hederaClient: Client): EnhancedGenerationService {
  return new EnhancedGenerationService(hederaClient);
}
