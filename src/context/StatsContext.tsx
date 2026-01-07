import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { subDays, format, startOfDay, subYears } from 'date-fns';
import { MarketStatistics } from '../types';
import { useCertificates } from './CertificateContext';
import { fetchEUAPriceWithRetry, POLLING_INTERVAL, fetchEUAHistory } from '../services/euaPriceService';
import { fetchCEAPriceWithRetry, fetchCEAHistory } from '../services/ceaPriceService';

interface StatsContextType {
  marketStats: MarketStatistics;
  realTimeEUA: {
    price: number | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    change24h: number | null;
  };
  realTimeCEA: {
    price: number | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    change24h: number | null;
  };
  refreshEUAPrice: () => Promise<void>;
  refreshCEAPrice: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

// Generate fallback historical price data (used when backend is unavailable)
const generateFallbackPriceHistory = () => {
  const numDays = 30;
  const today = startOfDay(new Date());
  
  return Array(numDays).fill(null).map((_, i) => {
    const date = subDays(today, numDays - i - 1);
    
    // Generate slightly random prices with an overall upward trend
    const basePriceCEA = 36 + (i / numDays) * 5; // Start at 36, trend toward 41
    const basePriceEUA = 55 + (i / numDays) * 7; // Start at 55, trend toward 62
    
    // Add random daily variation of up to +/- 1.5 EUR
    const priceCEA = parseFloat((basePriceCEA + (Math.random() * 3 - 1.5)).toFixed(2));
    const priceEUA = parseFloat((basePriceEUA + (Math.random() * 3 - 1.5)).toFixed(2));
    
    return {
      date,
      priceCEA,
      priceEUA
    };
  });
};

export function StatsProvider({ children }: { children: ReactNode }) {
  const { marketOffers, transactions } = useCertificates();
  const [marketStats, setMarketStats] = useState<MarketStatistics>({
    averagePriceCEA: 0,
    averagePriceEUA: 0,
    volumeCEA: 0,
    volumeEUA: 0,
    priceHistory: generateFallbackPriceHistory()
  });
  
  const historicalDataLoadedRef = useRef(false);

  // Real-time EUA price state
  const [realTimeEUA, setRealTimeEUA] = useState({
    price: null as number | null,
    isLoading: false,
    error: null as string | null,
    lastUpdated: null as Date | null,
    change24h: null as number | null,
  });

  // Real-time CEA price state
  const [realTimeCEA, setRealTimeCEA] = useState({
    price: null as number | null,
    isLoading: false,
    error: null as string | null,
    lastUpdated: null as Date | null,
    change24h: null as number | null,
  });

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ceaPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializedRef = useRef(false);
  
  // Load historical data on mount
  useEffect(() => {
    if (historicalDataLoadedRef.current) {
      return;
    }
    
    historicalDataLoadedRef.current = true;
    
    const loadHistoricalData = async () => {
      try {
        // Load 5 years of historical data
        const endDate = new Date();
        const startDate = subYears(endDate, 5);
        
        // Fetch both EUA and CEA historical data
        const [euaHistory, ceaHistory] = await Promise.all([
          fetchEUAHistory(startDate, endDate),
          fetchCEAHistory(startDate, endDate)
        ]);
        
        if (euaHistory && ceaHistory && euaHistory.length > 0 && ceaHistory.length > 0) {
          // Create a map for efficient lookup
          const euaMap = new Map(euaHistory.map(entry => [entry.date, entry.price]));
          const ceaMap = new Map(ceaHistory.map(entry => [entry.date, entry.price]));
          
          // Combine data into the format expected by MarketStatistics
          const combinedHistory = euaHistory.map(euaEntry => {
            const ceaPrice = ceaMap.get(euaEntry.date) || null;
            return {
              date: new Date(euaEntry.date),
              priceCEA: ceaPrice || (euaEntry.price * 0.6), // Fallback: 40% discount if CEA missing
              priceEUA: euaEntry.price
            };
          });
          
          // Update market stats with historical data
          setMarketStats(prev => ({
            ...prev,
            priceHistory: combinedHistory
          }));
          
          console.log(`Loaded ${combinedHistory.length} days of historical price data`);
        } else {
          console.warn('Failed to load historical data, using fallback');
        }
      } catch (error) {
        console.error('Error loading historical data:', error);
        // Continue with fallback data
      }
    };
    
    loadHistoricalData();
  }, []);

  // Fetch real-time EUA price
  const fetchRealTimeEUA = async () => {
    setRealTimeEUA(prev => ({ ...prev, isLoading: true, error: null }));
    
    const priceData = await fetchEUAPriceWithRetry();
    
    if (priceData) {
      setRealTimeEUA({
        price: priceData.price,
        isLoading: false,
        error: null,
        lastUpdated: priceData.timestamp,
        change24h: priceData.change24h || null,
      });
    } else {
      setRealTimeEUA(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch real-time price. Using market data.',
      }));
    }
  };

  // Fetch real-time CEA price
  const fetchRealTimeCEA = async () => {
    setRealTimeCEA(prev => ({ ...prev, isLoading: true, error: null }));
    
    const priceData = await fetchCEAPriceWithRetry();
    
    if (priceData) {
      setRealTimeCEA({
        price: priceData.price,
        isLoading: false,
        error: null,
        lastUpdated: priceData.timestamp,
        change24h: priceData.change24h || null,
      });
    } else {
      setRealTimeCEA(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch real-time CEA price. Using market data.',
      }));
    }
  };

  // Manual refresh functions
  const refreshEUAPrice = async () => {
    await fetchRealTimeEUA();
  };

  const refreshCEAPrice = async () => {
    await fetchRealTimeCEA();
  };

  // Initialize real-time price fetching and set up polling
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      // Initial fetch for both EUA and CEA
      fetchRealTimeEUA();
      fetchRealTimeCEA();
      
      // Set up polling for EUA
      pollingIntervalRef.current = setInterval(() => {
        fetchRealTimeEUA();
      }, POLLING_INTERVAL);
      
      // Set up polling for CEA
      ceaPollingIntervalRef.current = setInterval(() => {
        fetchRealTimeCEA();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (ceaPollingIntervalRef.current) {
        clearInterval(ceaPollingIntervalRef.current);
        ceaPollingIntervalRef.current = null;
      }
    };
  }, []);
  
  // Update market statistics whenever offers or transactions change
  useEffect(() => {
    // Calculate average prices from market offers
    const ceaOffers = marketOffers.filter(offer => offer.type === 'CEA');
    const euaOffers = marketOffers.filter(offer => offer.type === 'EUA');
    
    const averagePriceCEA = ceaOffers.length > 0 
      ? parseFloat((ceaOffers.reduce((sum, offer) => sum + offer.price, 0) / ceaOffers.length).toFixed(2))
      : marketStats.averagePriceCEA;
    
    // Use real-time EUA price if available, otherwise fall back to market offers average
    let averagePriceEUA: number;
    if (realTimeEUA.price !== null) {
      averagePriceEUA = realTimeEUA.price;
    } else if (euaOffers.length > 0) {
      averagePriceEUA = parseFloat((euaOffers.reduce((sum, offer) => sum + offer.price, 0) / euaOffers.length).toFixed(2));
    } else {
      averagePriceEUA = marketStats.averagePriceEUA;
    }
    
    // Calculate volumes from transactions (last 24 hours)
    const yesterday = subDays(new Date(), 1);
    const recentTransactions = transactions.filter(tx => tx.timestamp > yesterday);
    
    const volumeCEA = recentTransactions
      .filter(tx => tx.certificateType === 'CEA')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const volumeEUA = recentTransactions
      .filter(tx => tx.certificateType === 'EUA')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Update price history with the latest prices
    const today = startOfDay(new Date());
    const priceHistory = [...marketStats.priceHistory];
    
    const todayIndex = priceHistory.findIndex(entry => {
      const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
      return format(entryDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    });
    
    if (todayIndex >= 0) {
      // Update today's entry with latest prices
      priceHistory[todayIndex] = {
        ...priceHistory[todayIndex],
        priceCEA: averagePriceCEA || priceHistory[todayIndex].priceCEA,
        priceEUA: averagePriceEUA || priceHistory[todayIndex].priceEUA
      };
    } else {
      // Add today's entry if it doesn't exist
      priceHistory.push({
        date: today,
        priceCEA: averagePriceCEA || 0,
        priceEUA: averagePriceEUA || 0
      });
      
      // Sort by date to maintain chronological order
      priceHistory.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    }
    
    setMarketStats({
      averagePriceCEA,
      averagePriceEUA,
      volumeCEA,
      volumeEUA,
      priceHistory
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketOffers, transactions, realTimeEUA.price]);

  return (
    <StatsContext.Provider value={{ marketStats, realTimeEUA, realTimeCEA, refreshEUAPrice, refreshCEAPrice }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}