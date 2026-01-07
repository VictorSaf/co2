import axios from 'axios';

export interface MarketOpportunity {
  type: 'arbitrage' | 'swap_optimization' | 'liquidity_crisis';
  description: string;
  potentialSavings: string;
  action: string;
  expiresAt?: string;
  swapRatio?: number;
  priceGap?: number;
  euaPrice?: number;
  ceaPrice?: number;
  daysUntilDeadline?: number;
  marketCondition?: string;
  [key: string]: any;
}

export interface MarketOpportunitiesResponse {
  opportunities: MarketOpportunity[];
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

export async function getMarketOpportunities(
  filters?: {
    type?: 'arbitrage' | 'swap_optimization' | 'liquidity_crisis';
    minSavings?: number;
    euaPrice?: number;
    ceaPrice?: number;
  }
): Promise<MarketOpportunity[]> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/market/opportunities` 
    : `${BACKEND_API_URL}/api/market/opportunities`;
  
  const params: Record<string, string | number> = {};
  if (filters?.type) {
    params.type = filters.type;
  }
  if (filters?.minSavings !== undefined) {
    params.minSavings = filters.minSavings;
  }
  if (filters?.euaPrice !== undefined) {
    params.euaPrice = filters.euaPrice;
  }
  if (filters?.ceaPrice !== undefined) {
    params.ceaPrice = filters.ceaPrice;
  }
  
  const response = await axios.get<MarketOpportunitiesResponse>(apiPath, {
    params,
    timeout: 30000,
  });
  
  return response.data.opportunities;
}

