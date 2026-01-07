import axios from 'axios';

export interface MarketAnalysisResponse {
  currentPrices: {
    eua: {
      price: number;
      currency: string;
      change24h?: number;
    };
    cea: {
      price: number;
      currency: string;
      change24h?: number;
    };
  };
  spread: {
    absolute: number;
    percentage: number;
    arbitrageOpportunity: boolean;
  };
  arbitrageOpportunities: Array<{
    type: string;
    description: string;
    potentialSavings: string;
    swapRatio?: number;
    [key: string]: any;
  }>;
  swapRecommendations: Array<{
    type: string;
    description: string;
    swapRatio: number;
    potentialBenefit: string;
    recommendedAction: string;
  }>;
  marketCondition: {
    condition: 'panic' | 'compliance' | 'normal';
    daysUntilDeadline: number;
    isCompliancePeriod: boolean;
  };
  historicalTrends: any;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

export async function getMarketAnalysis(
  euaPrice?: number,
  ceaPrice?: number
): Promise<MarketAnalysisResponse> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/market/analysis` 
    : `${BACKEND_API_URL}/api/market/analysis`;
  
  const params: Record<string, number> = {};
  if (euaPrice !== undefined) {
    params.euaPrice = euaPrice;
  }
  if (ceaPrice !== undefined) {
    params.ceaPrice = ceaPrice;
  }
  
  const response = await axios.get<MarketAnalysisResponse>(apiPath, {
    params,
    timeout: 30000,
  });
  
  return response.data;
}

