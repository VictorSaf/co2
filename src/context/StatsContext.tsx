import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
import { MarketStatistics } from '../types';
import { useCertificates } from './CertificateContext';

interface StatsContextType {
  marketStats: MarketStatistics;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

// Generate historical price data
const generatePriceHistory = () => {
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
    priceHistory: generatePriceHistory()
  });
  
  // Update market statistics whenever offers or transactions change
  useEffect(() => {
    // Calculate average prices from market offers
    const cerOffers = marketOffers.filter(offer => offer.type === 'CER');
    const euaOffers = marketOffers.filter(offer => offer.type === 'EUA');
    
    const averagePriceCER = cerOffers.length > 0 
      ? parseFloat((cerOffers.reduce((sum, offer) => sum + offer.price, 0) / cerOffers.length).toFixed(2))
      : marketStats.averagePriceCER;
    
    const averagePriceEUA = euaOffers.length > 0 
      ? parseFloat((euaOffers.reduce((sum, offer) => sum + offer.price, 0) / euaOffers.length).toFixed(2))
      : marketStats.averagePriceEUA;
    
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
    
    const todayIndex = priceHistory.findIndex(entry => 
      format(entry.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );
    
    if (todayIndex >= 0) {
      priceHistory[todayIndex] = {
        ...priceHistory[todayIndex],
        priceCER: averagePriceCER,
        priceEUA: averagePriceEUA
      };
    } else {
      priceHistory.push({
        date: today,
        priceCER: averagePriceCER,
        priceEUA: averagePriceEUA
      });
      
      // Keep only the last 30 days
      if (priceHistory.length > 30) {
        priceHistory.shift();
      }
    }
    
    setMarketStats({
      averagePriceCER,
      averagePriceEUA,
      volumeCER,
      volumeEUA,
      priceHistory
    });
  }, [marketOffers, transactions]);

  return (
    <StatsContext.Provider value={{ marketStats }}>
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