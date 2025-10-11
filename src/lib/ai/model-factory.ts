/**
 * AI Model Factory - Unified interface for all AI providers
 * Uses LangChain for consistent API across OpenAI, Anthropic, and Google
 */

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface ModelConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  maxTokens: number;
  costPer1MTokens: number; // USD
  description: string;
}

/**
 * Available AI models across all providers
 */
export const AVAILABLE_MODELS: Record<AIProvider, ModelInfo[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      maxTokens: 128000,
      costPer1MTokens: 5.0,
      description: 'Most capable GPT-4 model, optimized for speed and cost',
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      maxTokens: 128000,
      costPer1MTokens: 0.15,
      description: 'Affordable and intelligent small model for fast, lightweight tasks',
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      costPer1MTokens: 10.0,
      description: 'Previous generation flagship model',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 16385,
      costPer1MTokens: 0.5,
      description: 'Fast and affordable model for simple tasks',
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1MTokens: 3.0,
      description: 'Most intelligent Claude model, best for complex tasks',
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1MTokens: 15.0,
      description: 'Powerful model for highly complex tasks',
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1MTokens: 0.25,
      description: 'Fastest and most compact model for near-instant responsiveness',
    },
  ],
  google: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      maxTokens: 2000000,
      costPer1MTokens: 1.25,
      description: 'Mid-size multimodal model with long context window',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      maxTokens: 1000000,
      costPer1MTokens: 0.075,
      description: 'Fast and versatile multimodal model for scaling',
    },
  ],
};

/**
 * AI Model Factory - Creates LangChain chat models
 */
export class AIModelFactory {
  /**
   * Create a chat model instance
   */
  static createModel(config: ModelConfig): BaseChatModel {
    const {
      provider,
      model,
      temperature = 0.7,
      maxTokens = 2000,
      apiKey,
    } = config;

    switch (provider) {
      case 'openai':
        return this.createOpenAIModel(model, temperature, maxTokens, apiKey);
      
      case 'anthropic':
        return this.createAnthropicModel(model, temperature, maxTokens, apiKey);
      
      case 'google':
        return this.createGoogleModel(model, temperature, maxTokens, apiKey);
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Create OpenAI model using LangChain
   */
  private static createOpenAIModel(
    model: string,
    temperature: number,
    maxTokens: number,
    apiKey?: string
  ): ChatOpenAI {
    return new ChatOpenAI({
      modelName: model,
      temperature,
      maxTokens,
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Create Anthropic model using LangChain
   */
  private static createAnthropicModel(
    model: string,
    temperature: number,
    maxTokens: number,
    apiKey?: string
  ): BaseChatModel {
    try {
      // Import Anthropic - package is now installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { ChatAnthropic } = require('@langchain/anthropic');
      
      return new ChatAnthropic({
        modelName: model,
        temperature,
        maxTokens,
        anthropicApiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
    } catch {
      throw new Error(
        'Anthropic support requires @langchain/anthropic package. Install with: bun add @langchain/anthropic'
      );
    }
  }

  /**
   * Create Google model using LangChain
   */
  private static createGoogleModel(
    model: string,
    temperature: number,
    maxTokens: number,
    apiKey?: string
  ): BaseChatModel {
    try {
      // Import Google - package is now installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
      
      return new ChatGoogleGenerativeAI({
        modelName: model,
        temperature,
        maxOutputTokens: maxTokens,
        apiKey: apiKey || process.env.GOOGLE_API_KEY,
      });
    } catch {
      throw new Error(
        'Google support requires @langchain/google-genai package. Install with: bun add @langchain/google-genai'
      );
    }
  }

  /**
   * Get all available models for a provider
   */
  static getModelsForProvider(provider: AIProvider): ModelInfo[] {
    return AVAILABLE_MODELS[provider] || [];
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): AIProvider[] {
    return Object.keys(AVAILABLE_MODELS) as AIProvider[];
  }

  /**
   * Get model info by ID
   */
  static getModelInfo(provider: AIProvider, modelId: string): ModelInfo | null {
    const models = AVAILABLE_MODELS[provider];
    return models?.find(m => m.id === modelId) || null;
  }

  /**
   * Estimate cost for a generation
   */
  static estimateCost(
    provider: AIProvider,
    modelId: string,
    estimatedTokens: number
  ): number {
    const modelInfo = this.getModelInfo(provider, modelId);
    if (!modelInfo) return 0;
    
    return (estimatedTokens / 1000000) * modelInfo.costPer1MTokens;
  }

  /**
   * Check if API key is configured for a provider
   */
  static isProviderConfigured(provider: AIProvider): boolean {
    switch (provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'google':
        return !!process.env.GOOGLE_API_KEY;
      default:
        return false;
    }
  }

  /**
   * Get configured providers
   */
  static getConfiguredProviders(): AIProvider[] {
    return this.getAvailableProviders().filter(provider =>
      this.isProviderConfigured(provider)
    );
  }
}

/**
 * Convenience function to create a model
 */
export function createAIModel(config: ModelConfig): BaseChatModel {
  return AIModelFactory.createModel(config);
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  const models = AVAILABLE_MODELS[provider];
  return models[0]?.id || '';
}
