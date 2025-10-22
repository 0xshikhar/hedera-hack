import { Tool } from 'langchain/tools';
import { Client } from '@hashgraph/sdk';
import { analyticsService } from '@/services/analytics';
import { ProvenanceService } from '@/services/provenance';

export interface VerificationInput {
  datasetId: string;
  ipfsCID: string;
  creatorAccountId?: string;
}

export interface VerificationOutput {
  verified: boolean;
  datasetId: string;
  checks: {
    provenance: {
      valid: boolean;
      details?: any;
    };
    creatorRisk: {
      score: number;
      isHighRisk: boolean;
      anomalies: number;
    };
    qualityScore: number;
    duplicateCheck: {
      isDuplicate: boolean;
      similarDatasets?: string[];
    };
  };
  overallScore: number;
  recommendation: 'approve' | 'review' | 'reject';
}

export class VerificationPlugin extends Tool {
  name = 'verify_dataset';
  description = `Verify dataset quality and authenticity using AI and blockchain analytics.
  Input should be a JSON string with: datasetId, ipfsCID, creatorAccountId (optional)`;

  private hederaClient: Client;
  private provenanceService: ProvenanceService;

  constructor(hederaClient: Client) {
    super();
    this.hederaClient = hederaClient;
    this.provenanceService = new ProvenanceService(hederaClient);
  }

  async _call(input: string): Promise<string> {
    try {
      const params: VerificationInput = JSON.parse(input);
      const result = await this.verifyDataset(params);
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async verifyDataset(
    params: VerificationInput
  ): Promise<VerificationOutput> {
    try {
      // 1. Check provenance on HCS
      const provenanceCheck = await this.checkProvenance(params.datasetId);

      // 2. Analyze creator's history using Hgraph SDK
      const creatorAccountId =
        params.creatorAccountId ||
        provenanceCheck.details?.creator ||
        'unknown';

      const creatorAnalysis =
        creatorAccountId !== 'unknown'
          ? await analyticsService.detectAnomalies(creatorAccountId)
          : {
              accountId: 'unknown',
              totalTransactions: 0,
              anomalyCount: 0,
              riskScore: 50,
              isHighRisk: true,
              anomalies: [],
            };

      // 3. Check for duplicates
      const duplicateCheck = await this.checkDuplicates(params.ipfsCID);

      // 4. AI quality scoring
      const qualityScore = await this.scoreQuality(
        params.datasetId,
        params.ipfsCID
      );

      // 5. Calculate overall score
      const overallScore = this.calculateOverallScore({
        provenanceValid: provenanceCheck.valid,
        creatorRiskScore: creatorAnalysis.riskScore,
        qualityScore,
        isDuplicate: duplicateCheck.isDuplicate,
      });

      // 6. Make recommendation
      const recommendation = this.makeRecommendation(overallScore);

      return {
        verified: overallScore >= 70,
        datasetId: params.datasetId,
        checks: {
          provenance: provenanceCheck,
          creatorRisk: {
            score: creatorAnalysis.riskScore,
            isHighRisk: creatorAnalysis.isHighRisk,
            anomalies: creatorAnalysis.anomalyCount,
          },
          qualityScore,
          duplicateCheck,
        },
        overallScore,
        recommendation,
      };
    } catch (error) {
      console.error('Error verifying dataset:', error);
      throw error;
    }
  }

  private async checkProvenance(datasetId: string) {
    try {
      const result = await this.provenanceService.verifyProvenance(datasetId);

      return {
        valid: result.exists,
        details: result.data,
      };
    } catch (error) {
      return {
        valid: false,
        details: null,
      };
    }
  }

  private async checkDuplicates(ipfsCID: string) {
    // In production, this would:
    // 1. Query all datasets from HCS
    // 2. Compare IPFS CIDs
    // 3. Use content hashing for similarity detection
    // 4. Check for exact or near-duplicate content

    // For now, return mock data
    return {
      isDuplicate: false,
      similarDatasets: [],
    };
  }

  private async scoreQuality(
    datasetId: string,
    ipfsCID: string
  ): Promise<number> {
    // In production, this would:
    // 1. Download dataset from IPFS
    // 2. Analyze schema consistency
    // 3. Check for missing values
    // 4. Validate data types
    // 5. Use ML model to score quality
    // 6. Check for bias or anomalies

    // For now, return a base score
    let score = 75;

    // Bonus points for having provenance
    const provenance = await this.provenanceService.verifyProvenance(datasetId);
    if (provenance.exists) {
      score += 10;
    }

    // Bonus points for carbon tracking
    if (provenance.data?.carbonFootprint) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private calculateOverallScore(factors: {
    provenanceValid: boolean;
    creatorRiskScore: number;
    qualityScore: number;
    isDuplicate: boolean;
  }): number {
    let score = 0;

    // Provenance (30 points)
    if (factors.provenanceValid) {
      score += 30;
    }

    // Creator trust (30 points)
    // Lower risk score = higher trust
    const creatorTrust = Math.max(0, 100 - factors.creatorRiskScore);
    score += (creatorTrust / 100) * 30;

    // Quality (30 points)
    score += (factors.qualityScore / 100) * 30;

    // Duplicate check (10 points)
    if (!factors.isDuplicate) {
      score += 10;
    }

    return Math.round(score);
  }

  private makeRecommendation(
    overallScore: number
  ): 'approve' | 'review' | 'reject' {
    if (overallScore >= 80) {
      return 'approve';
    } else if (overallScore >= 60) {
      return 'review';
    } else {
      return 'reject';
    }
  }
}
