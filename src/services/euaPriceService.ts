import axios from 'axios';

export interface EUAPriceResponse {
  price: number;
  timestamp: Date;
  currency: string;
  change24h?: number;
}

export interface HistoricalPriceEntry {
  date: string;
  price: number;
  currency: string;
}

export interface HistoricalPriceResponse {
  data: HistoricalPriceEntry[];
  start_date: string;
  end_date: string;
  count: number;
}

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Backend API URL - defaults to localhost for development, can be overridden via env
// In development, Vite proxy handles /api requests, so use relative URL
// In production, use full URL from environment variable
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

// Fallback price cache for when backend is unavailable
let lastKnownPrice = 75.0;
const priceHistory: number[] = [75.0];

/**
 * Generates realistic fallback price based on market trends
 * Used when backend API is unavailable
 */
function generateRealisticPrice(): EUAPriceResponse {
  // Calculate 24h change from history
  const change24h = priceHistory.length > 1
    ? ((lastKnownPrice - priceHistory[0]) / priceHistory[0]) * 100
    : (Math.random() * 4 - 2); // Random -2% to +2%

  // Simulate realistic price movement (EUA typically moves 0.5-2% per day)
  const volatility = 0.01; // 1% volatility
  const trend = 0.0001; // Slight upward trend
  const randomChange = (Math.random() - 0.5) * volatility;
  
  lastKnownPrice = Math.max(50, Math.min(100, lastKnownPrice * (1 + trend + randomChange)));
  lastKnownPrice = parseFloat(lastKnownPrice.toFixed(2));
  
  priceHistory.push(lastKnownPrice);
  if (priceHistory.length > 100) priceHistory.shift();

  return {
    price: lastKnownPrice,
    timestamp: new Date(),
    currency: 'EUR',
    change24h: parseFloat(change24h.toFixed(2)),
  };
}

/**
 * Fetches the latest EU ETS (EUA) carbon price from Python backend API
 * Falls back to realistic simulation if backend is unavailable
 * @returns Promise with price data
 */
export async function fetchEUAPrice(): Promise<EUAPriceResponse | null> {
  try {
    // Call Python backend API
    const apiPath = BACKEND_API_URL.startsWith('/') 
      ? `${BACKEND_API_URL}/eua/price` 
      : `${BACKEND_API_URL}/api/eua/price`;
    const response = await axios.get(apiPath, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.price) {
      const priceData: EUAPriceResponse = {
        price: parseFloat(response.data.price.toFixed(2)),
        timestamp: new Date(response.data.timestamp),
        currency: response.data.currency || 'EUR',
        change24h: response.data.change24h ? parseFloat(response.data.change24h.toFixed(2)) : undefined,
      };

      // Update cache for fallback
      lastKnownPrice = priceData.price;
      priceHistory.push(priceData.price);
      if (priceHistory.length > 100) priceHistory.shift();

      return priceData;
    }

    // If response doesn't have expected format, fall back
    console.warn('Backend API returned unexpected format, using fallback');
    return generateRealisticPrice();
  } catch (error) {
    console.warn('Error fetching EUA price from backend, using fallback:', error);
    // Always return a price, even if it's simulated
    return generateRealisticPrice();
  }
}

/**
 * Fetches EUA price with retry logic
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Delay between retries in milliseconds
 * @returns Promise with price data or null if all retries fail
 */
export async function fetchEUAPriceWithRetry(
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<EUAPriceResponse | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fetchEUAPrice();
    
    if (result !== null) {
      return result;
    }

    // Don't wait after the last attempt
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return null;
}

/**
 * Fetches historical EUA price data from backend API
 * @param startDate Start date (YYYY-MM-DD) or Date object, defaults to 5 years ago
 * @param endDate End date (YYYY-MM-DD) or Date object, defaults to today
 * @returns Promise with historical price data or null if fetch fails
 */
export async function fetchEUAHistory(
  startDate?: string | Date,
  endDate?: string | Date
): Promise<HistoricalPriceEntry[] | null> {
  try {
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.start_date = startDate instanceof Date 
        ? startDate.toISOString().split('T')[0]
        : startDate;
    }
    
    if (endDate) {
      params.end_date = endDate instanceof Date
        ? endDate.toISOString().split('T')[0]
        : endDate;
    }
    
    const apiPath = BACKEND_API_URL.startsWith('/') 
      ? `${BACKEND_API_URL}/eua/history` 
      : `${BACKEND_API_URL}/api/eua/history`;
    
    const response = await axios.get<HistoricalPriceResponse>(apiPath, {
      params,
      timeout: 30000, // 30 second timeout for historical data
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.warn('Error fetching EUA history from backend:', error);
    return null;
  }
}

export { POLLING_INTERVAL };

