export interface UIProvider {
  id: string; // Unique identifier
  provider: string; // Owner account ID
  stakedAmount?: string;
  bandwidthMbps?: number;
  storageTB?: number;
  uptime?: number;
  ipfsGateway?: string;
  location?: string;
  isActive: boolean;
  registeredAt?: number;
  totalEarnings?: string;
  datasetsHosted?: number;
}

export interface NetworkStats {
  totalProviders: number;
  activeProviders: number;
  networkBandwidth: number;
  networkStorage: number;
}
