import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { DatasetGenerationService } from '../synthetic-generation-service';
import { DATASET_SCHEMAS, DatasetSchema, DatasetField } from '../schemas';

/**
 * Custom LangChain tool for natural language dataset generation
 * Allows users to generate datasets via conversational AI
 */
export function createDatasetGenerationTool() {
  const inputSchema = z.object({
    description: z.string().describe('Natural language description of the dataset to generate'),
    category: z.enum([
      'medical',
      'financial',
      'ecommerce',
      'social_media',
      'iot',
      'education',
      'healthcare',
      'retail',
      'custom'
    ]).describe('Category of dataset'),
    sampleCount: z.number().min(1).max(1000).default(100).describe('Number of samples to generate (1-1000)'),
    fields: z.array(z.string()).optional().describe('Optional: specific fields to include in the dataset'),
  });

  return new DynamicStructuredTool({
    name: 'generate_dataset',
    description: `Generate synthetic datasets based on natural language descriptions. 
    
Available dataset types:
- Medical: patient records, diagnosis, medical imaging, clinical trials
- Financial: transactions, stock prices, credit scores, fraud detection
- E-commerce: products, customer reviews, orders, user behavior
- Social Media: posts, comments, user profiles, engagement metrics
- IoT: sensor data, device logs, telemetry
- Education: student records, course data, assessments
- Healthcare: patient vitals, lab results, prescriptions
- Retail: sales data, inventory, customer analytics
- Custom: any other type of structured data

Use this tool when users ask to:
- "Generate a dataset"
- "Create synthetic data"
- "I need sample data for..."
- "Make me a dataset with..."

Examples:
- "Generate a medical diagnosis dataset with 1000 samples"
- "Create 500 financial transaction records"
- "I need e-commerce product data with 200 items"
- "Generate IoT sensor readings for temperature and humidity"`,
    
    schema: inputSchema,

    func: async ({ description, category, sampleCount, fields }: z.infer<typeof inputSchema>) => {
      try {
        console.log('🤖 AI Dataset Generation Tool invoked:', {
          description,
          category,
          sampleCount,
          fields,
        });

        // Find matching predefined schema or create custom
        let schemaId: string | undefined;
        let customSchema: { name: string; description: string; fields: DatasetField[] } | undefined = undefined;

        // Try to match with predefined schemas
        console.log('📋 Checking DATASET_SCHEMAS:', { 
          isArray: Array.isArray(DATASET_SCHEMAS), 
          type: typeof DATASET_SCHEMAS,
          length: Array.isArray(DATASET_SCHEMAS) ? DATASET_SCHEMAS.length : 'N/A'
        });
        
        let categorySchemas: DatasetSchema[] = [];
        
        if (Array.isArray(DATASET_SCHEMAS)) {
          categorySchemas = DATASET_SCHEMAS.filter(
            (s: DatasetSchema) => s.category.toLowerCase() === category.toLowerCase()
          );
        }

        if (categorySchemas.length > 0) {
          // Use the first matching schema
          schemaId = categorySchemas[0].id;
          console.log(`✅ Using predefined schema: ${schemaId}`);
        } else {
          // Create custom schema from description and fields
          console.log('📝 Creating custom schema from description');
          
          const schemaFields = fields?.map((fieldName: string) => ({
            name: fieldName,
            type: 'string' as const,
            description: `${fieldName} field`,
            required: true,
          })) || [
            { name: 'id', type: 'string' as const, description: 'Unique identifier', required: true },
            { name: 'data', type: 'string' as const, description: 'Data field', required: true },
          ];

          customSchema = {
            name: `${category} Dataset`,
            description: description,
            fields: schemaFields,
          };
        }

        // Generate the dataset
        console.log('🚀 Starting dataset generation...');
        console.log('🔍 DatasetGenerationService check:', {
          exists: !!DatasetGenerationService,
          type: typeof DatasetGenerationService,
          hasGenerateDataset: typeof DatasetGenerationService?.generateDataset === 'function',
        });
        
        if (typeof DatasetGenerationService?.generateDataset !== 'function') {
          throw new Error('DatasetGenerationService.generateDataset is not available. This may be a module import issue.');
        }
        
        const result = await DatasetGenerationService.generateDataset(
          {
            mode: 'synthetic',
            schemaId,
            customSchema,
            sampleCount: Math.min(sampleCount, 100), // Limit to 100 for chat to avoid timeouts
          },
          'openai',
          'gpt-4o-mini'
        );

        console.log('✅ Dataset generation completed:', {
          samples: result.data.length,
          provider: result.metadata.provider,
          model: result.metadata.model,
        });

        // Format response for the user
        const preview = result.data.slice(0, 3);
        const response = {
          success: true,
          message: `Successfully generated ${result.data.length} samples of ${category} data!`,
          preview: preview,
          totalSamples: result.data.length,
          metadata: {
            category,
            provider: result.metadata.provider,
            model: result.metadata.model,
            tokensUsed: result.metadata.usage.totalTokens,
            processingTime: `${result.metadata.processingTime}ms`,
          },
          datasetId: `dataset_${Date.now()}`,
          downloadInstructions: 'Dataset has been generated. You can now upload it to IPFS and mint as an NFT on the /create page.',
        };

        return JSON.stringify(response, null, 2);
      } catch (error) {
        console.error('❌ Dataset generation failed:', error);
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Try simplifying your request or reducing the sample count.',
        }, null, 2);
      }
    },
  });
}

/**
 * Tool for getting dataset recommendations
 */
export function createDatasetRecommendationTool() {
  const recommendSchema = z.object({
    useCase: z.string().describe('The use case or purpose for the dataset'),
    domain: z.string().optional().describe('Optional: specific domain or industry'),
  });

  return new DynamicStructuredTool({
    name: 'recommend_dataset',
    description: `Recommend dataset types and schemas based on user's use case or requirements.
    
Use this tool when users ask:
- "What kind of dataset should I create?"
- "I need data for machine learning, what do you suggest?"
- "What datasets are available?"
- "Show me dataset options"`,
    
    schema: recommendSchema,

    func: async ({ useCase, domain }: z.infer<typeof recommendSchema>) => {
      console.log('🤖 Dataset Recommendation Tool invoked:', { useCase, domain });

      // Ensure DATASET_SCHEMAS is an array
      const schemasArray = Array.isArray(DATASET_SCHEMAS) ? DATASET_SCHEMAS : [];
      
      // Filter schemas by domain if provided
      let relevantSchemas = schemasArray;
      if (domain && schemasArray.length > 0) {
        relevantSchemas = schemasArray.filter(
          (s: DatasetSchema) => s.category.toLowerCase().includes(domain.toLowerCase()) ||
               s.tags.some((tag: string) => tag.toLowerCase().includes(domain.toLowerCase()))
        );
      }

      // Get top 5 recommendations
      const recommendations = relevantSchemas.slice(0, 5).map((schema: DatasetSchema) => ({
        id: schema.id,
        name: schema.name,
        category: schema.category,
        description: schema.description,
        sampleFields: schema.fields.slice(0, 3).map((f: DatasetField) => f.name),
        recommendedSize: schema.sampleSize.default,
      }));

      const response = {
        success: true,
        useCase,
        recommendations,
        totalAvailable: Array.isArray(DATASET_SCHEMAS) ? DATASET_SCHEMAS.length : 0,
        suggestion: 'Choose a schema and tell me how many samples you need. For example: "Generate 500 samples using the medical-diagnosis schema"',
      };

      return JSON.stringify(response, null, 2);
    },
  });
}
/**
 * Tool for estimating dataset generation cost
 */
export function createCostEstimationTool() {
  const costSchema = z.object({
    sampleCount: z.number().min(1).max(10000).describe('Number of samples'),
    category: z.string().describe('Dataset category'),
    provider: z.enum(['openai', 'anthropic', 'google']).default('openai').describe('AI provider'),
  });

  return new DynamicStructuredTool({
    name: 'estimate_cost',
    description: `Estimate the cost and time for generating a dataset.
    
Use this tool when users ask:
- "How much will it cost to generate X samples?"
- "What's the estimated time for generating a dataset?"
- "How many tokens will this use?"`,
    
    schema: costSchema,

    func: async ({ sampleCount, category, provider }: z.infer<typeof costSchema>) => {
      console.log(' Cost Estimation Tool invoked:', { sampleCount, category, provider });

      const estimate = DatasetGenerationService.estimateGenerationCost(
        {
          mode: 'synthetic',
          sampleCount,
          schemaId: 'custom',
        },
        provider
      );

      // Estimate time (rough calculation)
      const estimatedTimeSeconds = Math.ceil(sampleCount / 10); // ~10 samples per second
      const estimatedTimeMinutes = Math.ceil(estimatedTimeSeconds / 60);

      const response = {
        success: true,
        sampleCount,
        category,
        provider,
        estimates: {
          tokens: estimate.estimatedTokens,
          cost: `$${estimate.estimatedCost} ${estimate.currency}`,
          timeSeconds: estimatedTimeSeconds,
          timeMinutes: estimatedTimeMinutes,
          timeDisplay: estimatedTimeMinutes > 1 
            ? `~${estimatedTimeMinutes} minutes` 
            : `~${estimatedTimeSeconds} seconds`,
        },
        recommendation: sampleCount > 500 
          ? 'For large datasets, consider generating in batches to avoid timeouts.'
          : 'This should generate quickly!',
      };

      return JSON.stringify(response, null, 2);
    },
  });
}
