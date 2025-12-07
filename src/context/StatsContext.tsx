import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { subDays, format, startOfDay, subYears } from 'date-fns';
import { MarketStatistics } from '../types';
import { useCertificates } from './CertificateContext';
import { fetchEUAPriceWithRetry, POLLING_INTERVAL, fetchEUAHistory } from '../services/euaPriceService';
import { fetchCERPriceWithRetry, fetchCERHistory } from '../services/cerPriceService';

interface StatsContextType {
  marketStats: MarketStatistics;
  realTimeEUA: {
    price: number | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    change24h: number | null;
  };
  realTimeCER: {
    price: number | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    change24h: number | null;
  };
  refreshEUAPrice: () => Promise<void>;
  refreshCERPrice: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

// Generate fallback historical price data (used when backend is unavailable)
const generateFallbackPriceHistory = () => {
  const numDays = 30;
  const today = startOfDay(new Date());
  
  return Array(numDays).fill(null).map((_, i) => {
    const date = subDays(today, numDays - i - 1);
    
    // Generate slightly random prices with an overall upward trend
    const basePriceCER = 36 + (i / numDays) * 5; // Start at 36, trend toward 41
    const basePriceEUA = 55 + (i / numDays) * 7; // Start at 55, trend toward 62
    
    // Add random daily variation of up to +/- 1.5 EUR
    const priceCER = parseFloat((basePriceCER + (Math.random() * 3 - 1.5)).toFixed(2));
    const priceEUA = parseFloat((basePriceEUA + (Math.random() * 3 - 1.5)).toFixed(2));
    
    return {
      date,
      priceCER,
      priceEUA
    };
  });
};

export function StatsProvider({ children }: { children: ReactNode }) {
  const { marketOffers, transactions } = useCertificates();
  const [marketStats, setMarketStats] = useState<MarketStatistics>({
    averagePriceCER: 0,
    averagePriceEUA: 0,
    volumeCER: 0,
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

  // Real-time CER price state
  const [realTimeCER, setRealTimeCER] = useState({
    price: null as number | null,
    isLoading: false,
    error: null as string | null,
    lastUpdated: null as Date | null,
    change24h: null as number | null,
  });

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cerPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
        
        // Fetch both EUA and CER historical data
        const [euaHistory, cerHistory] = await Promise.all([
          fetchEUAHistory(startDate, endDate),
          fetchCERHistory(startDate, endDate)
        ]);
        
        if (euaHistory && cerHistory && euaHistory.length > 0 && cerHistory.length > 0) {
          // Create a map for efficient lookup
          const euaMap = new Map(euaHistory.map(entry => [entry.date, entry.price]));
          const cerMap = new Map(cerHistory.map(entry => [entry.date, entry.price]));
          
          // Combine data into the format expected by MarketStatistics
          const combinedHistory = euaHistory.map(euaEntry => {
            const cerPrice = cerMap.get(euaEntry.date) || null;
            return {
              date: new Date(euaEntry.date),
              priceCER: cerPrice || (euaEntry.price * 0.6), // Fallback: 40% discount if CER missing
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

  // Fetch real-time CER price
  const fetchRealTimeCER = async () => {
    setRealTimeCER(prev => ({ ...prev, isLoading: true, error: null }));
    
    const priceData = await fetchCERPriceWithRetry();
    
    if (priceData) {
      setRealTimeCER({
        price: priceData.price,
        isLoading: false,
        error: null,
        lastUpdated: priceData.timestamp,
        change24h: priceData.change24h || null,
      });
    } else {
      setRealTimeCER(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch real-time CER price. Using market data.',
      }));
    }
  };

  // Manual refresh functions
  const refreshEUAPrice = async () => {
    await fetchRealTimeEUA();
  };

  const refreshCERPrice = async () => {
    await fetchRealTimeCER();
  };

  // Initialize real-time price fetching and set up polling
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      // Initial fetch for both EUA and CER
      fetchRealTimeEUA();
      fetchRealTimeCER();
      
      // Set up polling for EUA
      pollingIntervalRef.current = setInterval(() => {
        fetchRealTimeEUA();
      }, POLLING_INTERVAL);
      
      // Set up polling for CER
      cerPollingIntervalRef.current = setInterval(() => {
        fetchRealTimeCER();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (cerPollingIntervalRef.current) {
        clearInterval(cerPollingIntervalRef.current);
        cerPollingIntervalRef.current = null;
      }
    };
  }, []);
  
  // Update market statistics whenever offers or transactions change
  useEffect(() => {
    // Calculate average prices from market offers
    const cerOffers = marketOffers.filter(offer => offer.type === 'CER');
    const euaOffers = marketOffers.filter(offer => offer.type === 'EUA');
    
    const averagePriceCER = cerOffers.length > 0 
      ? parseFloat((cerOffers.reduce((sum, offer) => sum + offer.price, 0) / cerOffers.length).toFixed(2))
      : marketStats.averagePriceCER;
    
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
    
    const volumeCER = recentTransactions
      .filter(tx => tx.certificateType === 'CER')
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
        priceCER: averagePriceCER || priceHistory[todayIndex].priceCER,
        priceEUA: averagePriceEUA || priceHistory[todayIndex].priceEUA
      };
    } else {
      // Add today's entry if it doesn't exist
      priceHistory.push({
        date: today,
        priceCER: averagePriceCER || 0,
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
      averagePriceCER,
      averagePriceEUA,
      volumeCER,
      volumeEUA,
      priceHistory
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketOffers, transactions, realTimeEUA.price]);

  return (
    <StatsContext.Provider value={{ marketStats, realTimeEUA, realTimeCER, refreshEUAPrice, refreshCERPrice }}>
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