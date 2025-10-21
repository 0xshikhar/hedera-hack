import { DatasetSchema } from '../schemas';

export interface GenerationResult {
  data: any[];
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GeneratorConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerator {
  generateSyntheticData(
    schema: DatasetSchema,
    sampleCount: number,
    config?: GeneratorConfig
  ): Promise<GenerationResult>;
}

class OpenAIGenerator implements AIGenerator {
  async generateSyntheticData(
    schema: DatasetSchema,
    sampleCount: number,
    config?: GeneratorConfig
  ): Promise<GenerationResult> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const model = config?.model || 'gpt-4o';
    const temperature = config?.temperature || 0.7;
    const maxTokens = config?.maxTokens || 4000;

    // Build the prompt
    const fieldDescriptions = schema.fields
      .map(f => `- ${f.name} (${f.type}): ${f.description}`)
      .join('\n');

    const prompt = `Generate ${sampleCount} synthetic data samples based on this schema:

Schema: ${schema.name}
Description: ${schema.description}

Fields:
${fieldDescriptions}

Return a JSON array of ${sampleCount} objects. Each object should have all the fields defined in the schema.
Make the data realistic and diverse. Return ONLY the JSON array, no additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a synthetic data generator. Generate realistic, diverse data based on the given schema. Always return valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || '[]';

    // Parse the JSON response
    let data: any[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse generated data');
    }

    return {
      data,
      provider: 'openai',
      model,
      usage: {
        promptTokens: result.usage?.prompt_tokens || 0,
        completionTokens: result.usage?.completion_tokens || 0,
        totalTokens: result.usage?.total_tokens || 0,
      },
    };
  }
}

class AnthropicGenerator implements AIGenerator {
  async generateSyntheticData(
    schema: DatasetSchema,
    sampleCount: number,
    config?: GeneratorConfig
  ): Promise<GenerationResult> {
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const model = config?.model || 'claude-3-5-sonnet-20241022';
    const temperature = config?.temperature || 0.7;
    const maxTokens = config?.maxTokens || 4000;

    const fieldDescriptions = schema.fields
      .map(f => `- ${f.name} (${f.type}): ${f.description}`)
      .join('\n');

    const prompt = `Generate ${sampleCount} synthetic data samples based on this schema:

Schema: ${schema.name}
Description: ${schema.description}

Fields:
${fieldDescriptions}

Return a JSON array of ${sampleCount} objects. Each object should have all the fields defined in the schema.
Make the data realistic and diverse. Return ONLY the JSON array, no additional text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const result = await response.json();
    const content = result.content[0]?.text || '[]';

    let data: any[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to parse Anthropic response:', content);
      throw new Error('Failed to parse generated data');
    }

    return {
      data,
      provider: 'anthropic',
      model,
      usage: {
        promptTokens: result.usage?.input_tokens || 0,
        completionTokens: result.usage?.output_tokens || 0,
        totalTokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
      },
    };
  }
}

export class GeneratorFactory {
  private static generators: Map<string, AIGenerator> = new Map([
    ['openai', new OpenAIGenerator()],
    ['anthropic', new AnthropicGenerator()],
  ]);

  static getGenerator(provider: string): AIGenerator {
    const generator = this.generators.get(provider.toLowerCase());
    if (!generator) {
      throw new Error(`Unsupported AI provider: ${provider}. Supported providers: ${Array.from(this.generators.keys()).join(', ')}`);
    }
    return generator;
  }

  static registerGenerator(provider: string, generator: AIGenerator): void {
    this.generators.set(provider.toLowerCase(), generator);
  }
}
