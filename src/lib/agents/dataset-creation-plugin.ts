import { Tool } from 'langchain/tools';
import { Client, TokenMintTransaction, TokenId } from '@hashgraph/sdk';
import { AIModelFactory, AIProvider } from '@/lib/ai/model-factory';
import { carbonCalculator } from '@/services/carbon';
import { ProvenanceService } from '@/services/provenance';

export interface DatasetCreationInput {
  prompt: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  rows?: number;
  format?: 'json' | 'csv';
  category?: string;
}

export interface DatasetCreationOutput {
  success: boolean;
  datasetId: string;
  nftTokenId?: string;
  ipfsCID?: string;
  carbonFootprint: {
    co2Grams: number;
    formatted: string;
  };
  provenance: {
    logged: boolean;
    transactionId?: string;
  };
  error?: string;
}

export class DatasetCreationPlugin extends Tool {
  name = 'create_dataset';
  description = `Create an AI-generated dataset with automatic carbon tracking and provenance logging.
  Input should be a JSON string with: prompt, model, provider, rows (optional), format (optional), category (optional)`;

  private hederaClient: Client;
  private provenanceService: ProvenanceService;
  private defaultProvider: AIProvider;

  constructor(hederaClient: Client, provider: AIProvider = 'openai') {
    super();
    this.hederaClient = hederaClient;
    this.provenanceService = new ProvenanceService(hederaClient);
    this.defaultProvider = provider;
  }

  async _call(input: string): Promise<string> {
    try {
      const params: DatasetCreationInput = JSON.parse(input);
      const result = await this.createDataset(params);
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async createDataset(
    params: DatasetCreationInput
  ): Promise<DatasetCreationOutput> {
    const startTime = Date.now();

    try {
      // 1. Generate dataset using AI
      const dataset = await this.generateDataset(params);

      // 2. Upload to IPFS
      const ipfsCID = await this.uploadToIPFS(dataset);

      // 3. Mint NFT
      const nftTokenId = await this.mintNFT(ipfsCID);

      // 4. Calculate carbon footprint
      const computeTimeMs = Date.now() - startTime;
      const carbonResult = carbonCalculator.calculate(
        params.provider,
        params.model,
        computeTimeMs
      );

      // 5. Log provenance to HCS
      const datasetId = `dataset_${Date.now()}`;
      const provenanceResult = await this.provenanceService.logAIOperation(
        'dataset_generation',
        params.model,
        params.provider,
        params.prompt,
        JSON.stringify(dataset),
        {
          temperature: 0.7,
          maxTokens: 2000,
        },
        {
          computeTimeMs,
          energyKwh: carbonResult.energyKwh,
          co2Grams: carbonResult.co2Grams,
        },
        this.hederaClient.operatorAccountId?.toString() || 'unknown',
        {
          datasetId,
          ipfsCID,
          version: '1.0',
        }
      );

      return {
        success: true,
        datasetId,
        nftTokenId,
        ipfsCID,
        carbonFootprint: {
          co2Grams: carbonResult.co2Grams,
          formatted: carbonCalculator.formatCarbonFootprint(
            carbonResult.co2Grams
          ),
        },
        provenance: {
          logged: provenanceResult.success,
          transactionId: provenanceResult.transactionId,
        },
      };
    } catch (error) {
      return {
        success: false,
        datasetId: '',
        carbonFootprint: {
          co2Grams: 0,
          formatted: '0g CO₂',
        },
        provenance: {
          logged: false,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async generateDataset(params: DatasetCreationInput): Promise<string> {
    const rows = params.rows || 100;
    const format = params.format || 'json';

    const systemPrompt = `Generate a dataset with ${rows} rows in ${format} format. ${params.prompt}

Return ONLY valid ${format.toUpperCase()} data, no additional text or explanations.`;

    // Create AI model dynamically based on the request
    const chatModel = AIModelFactory.createModel({
      provider: params.provider || this.defaultProvider,
      model: params.model,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Use LangChain chat model to generate dataset
    const response = await chatModel.invoke(systemPrompt);
    
    // Extract content from response
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    return content;
  }

  private async uploadToIPFS(data: string): Promise<string> {
    // Placeholder - implement actual IPFS upload
    // Using Pinata, Web3.Storage, or similar service
    
    // For now, return a mock CID
    const mockCID = `Qm${Buffer.from(data).toString('base64').substring(0, 44)}`;
    return mockCID;
  }

  private async mintNFT(ipfsCID: string): Promise<string> {
    try {
      const tokenId = TokenId.fromString(
        process.env.DATASET_NFT_TOKEN_ID || '0.0.7158235'
      );

      const metadata = JSON.stringify({
        ipfsCID,
        timestamp: new Date().toISOString(),
      });

      const transaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(metadata)]);

      const response = await transaction.execute(this.hederaClient);
      const receipt = await response.getReceipt(this.hederaClient);

      return `${tokenId.toString()}:${receipt.serials[0].toString()}`;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }
}
