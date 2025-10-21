/**
 * Node reward calculation utilities
 * Based on the tokenomics defined in the implementation plan
 */

export interface NodeRewardParams {
  bandwidthMbps: number;
  storageTB: number;
  uptimePercent: number;
  datasetsHosted: number;
  region?: string;
}

export interface NodeRewardBreakdown {
  baseReward: number;
  datasetBonus: number;
  uptimeMultiplier: number;
  geographicBonus: number;
}

export interface NodeRewardResult {
  monthlyRewards: number;
  annualRewards: number;
  monthlyUSD: number;
  breakdown: NodeRewardBreakdown;
}

// Constants from tokenomics
const BANDWIDTH_RATE = 0.01; // FILE per Mbps
const STORAGE_RATE = 2; // FILE per TB
const DATASET_BONUS_RATE = 0.5; // FILE per dataset
const GEOGRAPHIC_BONUS_RATE = 0.1; // 10% bonus for underserved regions
const FILE_TO_USD_RATE = 0.05; // Estimated FILE token price in USD

// Underserved regions that get geographic bonus
const UNDERSERVED_REGIONS = ['africa', 'south-america', 'southeast-asia'];

/**
 * Calculate node rewards based on performance metrics
 * Formula from implementation plan:
 * Monthly Provider Rewards = 
 *   (Base Reward × Uptime Multiplier) + 
 *   (Dataset Bonus × Quality Score) + 
 *   (Geographic Bonus)
 * 
 * Base Reward = (Bandwidth × 0.01) + (Storage × 2) FILE
 */
export function calculateNodeRewards(params: NodeRewardParams): NodeRewardResult {
  const {
    bandwidthMbps,
    storageTB,
    uptimePercent,
    datasetsHosted,
    region = ''
  } = params;

  // Calculate base reward
  const bandwidthReward = bandwidthMbps * BANDWIDTH_RATE;
  const storageReward = storageTB * STORAGE_RATE;
  const baseReward = bandwidthReward + storageReward;

  // Calculate uptime multiplier (0-1)
  const uptimeMultiplier = uptimePercent / 100;

  // Calculate dataset hosting bonus
  const datasetBonus = datasetsHosted * DATASET_BONUS_RATE;

  // Calculate geographic bonus
  const isUnderservedRegion = UNDERSERVED_REGIONS.some(r => 
    region.toLowerCase().includes(r)
  );
  const geographicBonus = isUnderservedRegion 
    ? (baseReward + datasetBonus) * GEOGRAPHIC_BONUS_RATE 
    : 0;

  // Calculate total monthly rewards
  const monthlyRewards = (baseReward * uptimeMultiplier) + datasetBonus + geographicBonus;

  // Calculate annual rewards
  const annualRewards = monthlyRewards * 12;

  // Calculate USD value
  const monthlyUSD = monthlyRewards * FILE_TO_USD_RATE;

  return {
    monthlyRewards,
    annualRewards,
    monthlyUSD,
    breakdown: {
      baseReward,
      datasetBonus,
      uptimeMultiplier,
      geographicBonus
    }
  };
}

/**
 * Calculate optimal node configuration for target monthly rewards
 */
export function calculateOptimalConfiguration(targetMonthlyRewards: number): NodeRewardParams {
  // Assume 99% uptime and 10 datasets hosted
  const uptimePercent = 99;
  const datasetsHosted = 10;
  const uptimeMultiplier = uptimePercent / 100;
  const datasetBonus = datasetsHosted * DATASET_BONUS_RATE;

  // Calculate required base reward
  const requiredBaseReward = (targetMonthlyRewards - datasetBonus) / uptimeMultiplier;

  // Optimize for storage (more cost-effective)
  const storageTB = Math.ceil(requiredBaseReward / (STORAGE_RATE * 2));
  const bandwidthMbps = Math.ceil((requiredBaseReward - (storageTB * STORAGE_RATE)) / BANDWIDTH_RATE);

  return {
    bandwidthMbps: Math.max(10, bandwidthMbps),
    storageTB: Math.max(1, storageTB),
    uptimePercent,
    datasetsHosted
  };
}

/**
 * Estimate ROI for node operation
 */
export function estimateNodeROI(
  params: NodeRewardParams,
  monthlyCostUSD: number
): {
  monthlyRevenueUSD: number;
  monthlyCostUSD: number;
  monthlyProfitUSD: number;
  roi: number;
  breakEvenMonths: number;
} {
  const rewards = calculateNodeRewards(params);
  const monthlyRevenueUSD = rewards.monthlyUSD;
  const monthlyProfitUSD = monthlyRevenueUSD - monthlyCostUSD;
  const roi = monthlyCostUSD > 0 ? (monthlyProfitUSD / monthlyCostUSD) * 100 : 0;
  const breakEvenMonths = monthlyProfitUSD > 0 ? Math.ceil(monthlyCostUSD / monthlyProfitUSD) : Infinity;

  return {
    monthlyRevenueUSD,
    monthlyCostUSD,
    monthlyProfitUSD,
    roi,
    breakEvenMonths
  };
}
