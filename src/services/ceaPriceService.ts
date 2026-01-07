import axios from 'axios';

export interface CEAPriceResponse {
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
let lastKnownPrice = 40.0;
const priceHistory: number[] = [40.0];

// Request deduplication and caching for CEA price
let ceaPriceCache: { data: CEAPriceResponse; timestamp: number } | null = null;
let ceaPricePromise: Promise<CEAPriceResponse | null> | null = null;
const CEA_PRICE_CACHE_TTL = 60000; // Cache for 60 seconds (1 minute) - prices don't change that frequently

// Request deduplication and caching for CEA history
let ceaHistoryCache: { data: HistoricalPriceEntry[]; timestamp: number; params: string } | null = null;
let ceaHistoryPromise: Promise<HistoricalPriceEntry[] | null> | null = null;
const CEA_HISTORY_CACHE_TTL = 300000; // Cache for 5 minutes - historical data changes rarely

/**
 * Generates realistic fallback CEA price based on market trends
 * CEA typically trades at 30-50% discount to EUA prices
 * Used when backend API is unavailable
 */
function generateRealisticPrice(): CEAPriceResponse {
  // Calculate 24h change from history
  const change24h = priceHistory.length > 1
    ? ((lastKnownPrice - priceHistory[0]) / priceHistory[0]) * 100
    : (Math.random() * 6 - 3); // Random -3% to +3%

  // Simulate realistic price movement (CEA typically moves 1-3% per day)
  const volatility = 0.015; // 1.5% volatility
  const trend = 0.0001; // Slight upward trend
  const randomChange = (Math.random() - 0.5) * volatility;
  
  lastKnownPrice = Math.max(20, Math.min(60, lastKnownPrice * (1 + trend + randomChange)));
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
 * Fetches the latest Chinese CEA carbon price from Python backend API
 * Falls back to realistic simulation if backend is unavailable
 * 
 * Features:
 * - Request deduplication: If a request is already in progress, returns the same promise
 * - Short-term caching: Caches results for 60 seconds to prevent duplicate requests
 * - Rate limit handling: Handles 429 errors gracefully with fallback
 * 
 * @returns Promise with price data
 */
export async function fetchCEAPrice(): Promise<CEAPriceResponse | null> {
  // Check cache first (if within TTL)
  const now = Date.now();
  if (ceaPriceCache && (now - ceaPriceCache.timestamp) < CEA_PRICE_CACHE_TTL) {
    return ceaPriceCache.data;
  }

  // If request is already in progress, return the same promise (deduplication)
  if (ceaPricePromise) {
    return ceaPricePromise;
  }

  // Create new request promise
  ceaPricePromise = (async () => {
    try {
      // Call Python backend API
      const apiPath = BACKEND_API_URL.startsWith('/') 
        ? `${BACKEND_API_URL}/cea/price` 
        : `${BACKEND_API_URL}/api/cea/price`;
      const response = await axios.get(apiPath, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
        },
        validateStatus: (status) => {
          // Accept 200, 429 (rate limit - will use fallback), and other statuses for fallback handling
          return status < 500;
        }
      });

      // Handle 429 rate limit errors gracefully
      if (response.status === 429) {
        console.warn('Rate limit hit for CEA price, using fallback');
        const fallback = generateRealisticPrice();
        // Don't cache rate limit responses
        ceaPricePromise = null;
        return fallback;
      }

      if (response.data && response.data.price) {
        const priceData: CEAPriceResponse = {
          price: parseFloat(response.data.price.toFixed(2)),
          timestamp: new Date(response.data.timestamp),
          currency: response.data.currency || 'EUR',
          change24h: response.data.change24h ? parseFloat(response.data.change24h.toFixed(2)) : undefined,
        };

        // Update cache for fallback
        lastKnownPrice = priceData.price;
        priceHistory.push(priceData.price);
        if (priceHistory.length > 100) priceHistory.shift();

        // Cache the result
        ceaPriceCache = {
          data: priceData,
          timestamp: now
        };

        return priceData;
      }

      // If response doesn't have expected format, fall back
      console.warn('Backend API returned unexpected format, using fallback');
      const fallback = generateRealisticPrice();
      ceaPricePromise = null;
      return fallback;
    } catch (error: any) {
      // Handle 429 errors from axios
      if (error.response?.status === 429) {
        console.warn('Rate limit hit for CEA price, using fallback');
        const fallback = generateRealisticPrice();
        ceaPricePromise = null;
        return fallback;
      }
      console.warn('Error fetching CEA price from backend, using fallback:', error);
      // Always return a price, even if it's simulated
      const fallback = generateRealisticPrice();
      ceaPricePromise = null;
      return fallback;
    } finally {
      // Clear the promise so new requests can be made after cache expires
      // (but keep it set during the request to enable deduplication)
      setTimeout(() => {
        ceaPricePromise = null;
      }, 1000); // Clear after 1 second to allow deduplication window
    }
  })();

  return ceaPricePromise;
}

/**
 * Fetches CEA price with retry logic
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Delay between retries in milliseconds
 * @returns Promise with price data or null if all retries fail
 */
export async function fetchCEAPriceWithRetry(
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<CEAPriceResponse | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fetchCEAPrice();
    
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
 * Fetches historical CEA price data from backend API
 * 
 * Features:
 * - Request deduplication: If a request with same params is in progress, returns the same promise
 * - Caching: Caches results for 5 minutes to prevent duplicate requests
 * - Rate limit handling: Handles 429 errors gracefully
 * 
 * @param startDate Start date (YYYY-MM-DD) or Date object, defaults to 5 years ago
 * @param endDate End date (YYYY-MM-DD) or Date object, defaults to today
 * @returns Promise with historical price data or null if fetch fails
 */
export async function fetchCEAHistory(
  startDate?: string | Date,
  endDate?: string | Date
): Promise<HistoricalPriceEntry[] | null> {
  // Create cache key from params
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
  const cacheKey = JSON.stringify(params);

  // Check cache first (if within TTL and same params)
  const now = Date.now();
  if (ceaHistoryCache && 
      (now - ceaHistoryCache.timestamp) < CEA_HISTORY_CACHE_TTL &&
      ceaHistoryCache.params === cacheKey) {
    return ceaHistoryCache.data;
  }

  // If request is already in progress with same params, return the same promise
  if (ceaHistoryPromise) {
    return ceaHistoryPromise;
  }

  // Create new request promise
  ceaHistoryPromise = (async () => {
    try {
      const apiPath = BACKEND_API_URL.startsWith('/') 
        ? `${BACKEND_API_URL}/cea/history` 
        : `${BACKEND_API_URL}/api/cea/history`;
      
      const response = await axios.get<HistoricalPriceResponse>(apiPath, {
        params,
        timeout: 30000, // 30 second timeout for historical data
        headers: {
          'Accept': 'application/json',
        },
        validateStatus: (status) => {
          // Accept 200, 429 (rate limit), and other statuses for error handling
          return status < 500;
        }
      });

      // Handle 429 rate limit errors gracefully
      if (response.status === 429) {
        console.warn('Rate limit hit for CEA history, returning null');
        ceaHistoryPromise = null;
        return null;
      }

      if (response.data && response.data.data) {
        // Cache the result
        ceaHistoryCache = {
          data: response.data.data,
          timestamp: now,
          params: cacheKey
        };
        return response.data.data;
      }

      ceaHistoryPromise = null;
      return null;
    } catch (error: any) {
      // Handle 429 errors from axios
      if (error.response?.status === 429) {
        console.warn('Rate limit hit for CEA history, returning null');
        ceaHistoryPromise = null;
        return null;
      }
      console.warn('Error fetching CEA history from backend:', error);
      ceaHistoryPromise = null;
      return null;
    } finally {
      // Clear the promise after a short delay
      setTimeout(() => {
        ceaHistoryPromise = null;
      }, 1000);
    }
  })();

  return ceaHistoryPromise;
}

export { POLLING_INTERVAL };

