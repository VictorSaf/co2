import axios from 'axios';

export interface SellerScenarioRequest {
  volume: number;
  currentPrice: number;
  urgency?: 'normal' | 'urgent' | 'panic';
  confidentiality?: boolean;
  fxPreference?: 'RMB' | 'EUR' | 'USD';
}

export interface BuyerSwapScenarioRequest {
  euaVolume: number;
  euaPrice: number;
  ceaPrice?: number;
  swapRatio?: number;
  useCase?: 'compliance' | 'cbam' | 'investment' | 'divestment';
  hasChinaOperations?: boolean;
}

export interface SellerScenarioResponse {
  nihaoOffer: {
    price: number;
    executionTime: string;
    totalValue: number;
  };
  shanghaiAlternative: {
    price: number;
    executionTime: string;
    totalValue: number;
    marketImpact: number;
  };
  benefits: {
    liquidity: string;
    pricePremium: number;
    timeSavings: string;
    confidentiality: boolean;
    fxFlexibility: boolean;
  };
  totalSavings: number;
  savingsPercentage: number;
}

export interface BuyerSwapScenarioResponse {
  directSwapCosts: {
    wfoeSetup: number;
    timeToMarket: string;
    capitalControlsRisk: boolean;
    fxExposure: number;
  };
  nihaoSwap: {
    fee: number;
    executionTime: string;
    noWfoeNeeded: boolean;
    noCapitalControls: boolean;
  };
  benefits: {
    wfoeSavings: number;
    timeSavings: string;
    riskReduction: string;
    cbamOptimization?: number;
  };
  totalSavings: number;
  savingsPercentage: number;
}

export interface SavedScenario {
  id: string;
  scenarioType: 'seller_cea' | 'buyer_swap';
  inputData: any;
  nihaoBenefits: any;
  alternativeCosts: any;
  savings: number;
  createdAt: string;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

/**
 * Get user ID from localStorage (matches pattern from kycService)
 */
function getUserId(): string | null {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.id || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Get auth headers helper
function getAuthHeaders(): Record<string, string> {
  const userId = getUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  return headers;
}

export async function calculateSellerScenario(
  data: SellerScenarioRequest
): Promise<SellerScenarioResponse> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/calculator/seller-scenario` 
    : `${BACKEND_API_URL}/api/calculator/seller-scenario`;
  
  const response = await axios.post<SellerScenarioResponse>(apiPath, data, {
    headers: getAuthHeaders(),
    timeout: 30000,
  });
  
  return response.data;
}

export async function calculateBuyerSwapScenario(
  data: BuyerSwapScenarioRequest
): Promise<BuyerSwapScenarioResponse> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/calculator/buyer-swap-scenario` 
    : `${BACKEND_API_URL}/api/calculator/buyer-swap-scenario`;
  
  const response = await axios.post<BuyerSwapScenarioResponse>(apiPath, data, {
    headers: getAuthHeaders(),
    timeout: 30000,
  });
  
  return response.data;
}

export async function saveScenario(
  scenarioType: 'seller_cea' | 'buyer_swap',
  inputData: any,
  results: any
): Promise<{ scenarioId: string; savedAt: string }> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/calculator/scenarios` 
    : `${BACKEND_API_URL}/api/calculator/scenarios`;
  
  const response = await axios.post(
    apiPath,
    {
      scenarioType,
      inputData,
      results,
    },
    {
      headers: getAuthHeaders(),
      timeout: 30000,
    }
  );
  
  return response.data;
}

export async function getSavedScenarios(): Promise<SavedScenario[]> {
  const apiPath = BACKEND_API_URL.startsWith('/') 
    ? `${BACKEND_API_URL}/calculator/scenarios` 
    : `${BACKEND_API_URL}/api/calculator/scenarios`;
  
  const response = await axios.get<{ scenarios: SavedScenario[] }>(apiPath, {
    headers: getAuthHeaders(),
    timeout: 30000,
  });
  
  return response.data.scenarios;
}

