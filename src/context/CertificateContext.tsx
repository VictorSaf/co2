import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';
import { Certificate, Portfolio, MarketOffer, Transaction, CertificateType, CO2Emissions } from '../types';
import { useAuth } from './AuthContext';
import { getRandomSeller } from '../data/sellers';
import { addActivity, initializeActivityHistory } from '../data/activityHistory';

interface CertificateContextType {
  portfolio: Portfolio;
  marketOffers: MarketOffer[];
  transactions: Transaction[];
  emissions: CO2Emissions;
  purchaseCertificate: (offer: MarketOffer) => Promise<boolean>;
  convertCertificate: (certificate: Certificate) => Promise<boolean>;
  verifyCertificate: (certificate: Certificate) => Promise<boolean>;
  surrenderCertificate: (certificate: Certificate) => Promise<boolean>;
  updateMarketOffers: (updater: (offers: MarketOffer[]) => MarketOffer[]) => void;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Helper function to generate initial offers with best price matching live price
// All offers are ensured to be at or above live price
function generateInitialOffers(
  type: 'CER' | 'EUA',
  count: number,
  livePrice: number | null,
  defaultMinPrice: number,
  defaultMaxPrice: number
): MarketOffer[] {
  const offers: MarketOffer[] = [];
  const basePrice = livePrice !== null ? livePrice : (defaultMinPrice + defaultMaxPrice) / 2;
  const minPrice = livePrice !== null ? livePrice : defaultMinPrice;
  
  for (let i = 0; i < count; i++) {
    const seller = getRandomSeller(type);
    let price: number;
    
    if (i === 0 && livePrice !== null) {
      // First offer always matches live price (best price)
      price = livePrice;
    } else {
      // Other offers are priced higher with variation, but never below live price
      const priceVariation = defaultMaxPrice - basePrice;
      price = parseFloat((basePrice + Math.random() * priceVariation * 0.3 + 0.5).toFixed(2));
      price = Math.max(minPrice, price); // Ensure never below live price
    }
    
    offers.push({
      id: uuidv4(),
      sellerId: seller.id,
      sellerName: seller.name,
      type: type as CertificateType,
      amount: Math.floor(Math.random() * (type === 'CER' ? 5000 : 3000)) + (type === 'CER' ? 1000 : 500),
      price: price,
      timestamp: new Date(),
    });
  }
  
  // Sort offers by price (lowest first)
  return offers.sort((a, b) => a.price - b.price);
}

// Helper function to ensure best price matches live price and all offers are at or above live price
function ensureBestPriceMatchesLivePrice(
  offers: MarketOffer[],
  type: 'CER' | 'EUA',
  livePrice: number | null
): MarketOffer[] {
  if (livePrice === null) return offers;
  
  const typeOffers = offers.filter(o => o.type === type);
  if (typeOffers.length === 0) return offers;
  
  // Sort to find the best (lowest) price offer
  const sortedTypeOffers = [...typeOffers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedTypeOffers[0];
  
  // Update all offers of this type to ensure they're at or above live price
  const updatedOffers = offers.map(offer => {
    if (offer.type === type) {
      // If this is the best (lowest) price offer, set it to live price exactly
      if (offer.id === bestOffer.id) {
        if (Math.abs(offer.price - livePrice) > 0.01) {
          return {
            ...offer,
            price: livePrice,
            timestamp: new Date()
          };
        }
      } else {
        // For all other offers, ensure they're at or above live price
        if (offer.price < livePrice) {
          return {
            ...offer,
            price: livePrice,
            timestamp: new Date()
          };
        }
      }
    }
    return offer;
  });
  
  return updatedOffers;
}

// Initial emissions data
const initialEmissions: CO2Emissions = {
  total: 5000000, // 5 million tons
  surrendered: 0,
  remaining: 5000000
};

export function CertificateProvider({ children }: { children: ReactNode }) {
  const { user, updateUserBalance } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    certificates: [],
    totalCER: 0,
    totalEUA: 0,
    convertingCER: 0
  });
  
  // Initialize market offers as empty - MarketOffersSync will create them with live prices
  const [marketOffers, setMarketOffers] = useState<MarketOffer[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [emissions, setEmissions] = useState<CO2Emissions>(initialEmissions);
  
  // Expose updateMarketOffers function
  const updateMarketOffers = useCallback((updater: (offers: MarketOffer[]) => MarketOffer[]) => {
    setMarketOffers(updater);
  }, []);
  
  // Inițializare istoric activități
  useEffect(() => {
    initializeActivityHistory();
  }, []);
  
  // Initialize portfolio from localStorage if available
  useEffect(() => {
    if (user) {
      const storedPortfolio = localStorage.getItem(`portfolio-${user.id}`);
      const storedTransactions = localStorage.getItem(`transactions-${user.id}`);
      const storedEmissions = localStorage.getItem(`emissions-${user.id}`);
      
      if (storedPortfolio) {
        const parsedPortfolio = JSON.parse(storedPortfolio);
        setPortfolio({
          ...parsedPortfolio,
          certificates: parsedPortfolio.certificates.map((cert: Certificate) => ({
            ...cert,
            purchasedAt: cert.purchasedAt ? new Date(cert.purchasedAt) : undefined,
            conversionStartedAt: cert.conversionStartedAt ? new Date(cert.conversionStartedAt) : undefined,
            conversionCompletedAt: cert.conversionCompletedAt ? new Date(cert.conversionCompletedAt) : undefined,
            verifiedAt: cert.verifiedAt ? new Date(cert.verifiedAt) : undefined,
          }))
        });
      }
      
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions).map((tx: Transaction) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        })));
      }
      
      if (storedEmissions) {
        setEmissions(JSON.parse(storedEmissions));
      }
    }
  }, [user]);
  
  // Process any conversions in progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prev => {
        const completedConversions: Certificate[] = [];
        
        const updatedCertificates = prev.certificates.map(cert => {
          if (cert.status === 'Converting' && cert.conversionStartedAt) {
            const conversionEndTime = addMinutes(new Date(cert.conversionStartedAt), 5);
            if (new Date() >= conversionEndTime) {
              const updatedCert = {
                ...cert,
                type: 'EUA',
                status: 'Available',
                conversionCompletedAt: new Date()
              };
              
              // Adaugă certificatul la lista celor finalizate
              completedConversions.push(updatedCert);
              
              return updatedCert;
            }
          }
          return cert;
        });
        
        // Înregistrează activități pentru conversiile finalizate
        if (user && completedConversions.length > 0) {
          completedConversions.forEach(cert => {
            addActivity({
              userId: user.id,
              timestamp: cert.conversionCompletedAt || new Date(),
              type: 'CONVERSION_COMPLETE',
              certificateId: cert.id,
              amount: cert.amount,
              details: `Completed conversion of ${cert.amount} tons CER to EUA certificate`
            });
          });
        }
        
        // Calculate new totals
        const totalCER = updatedCertificates.filter(c => c.type === 'CER' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
        const totalEUA = updatedCertificates.filter(c => c.type === 'EUA' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
        const convertingCER = updatedCertificates.filter(c => c.status === 'Converting').reduce((sum, c) => sum + c.amount, 0);
        
        const newPortfolio = {
          certificates: updatedCertificates,
          totalCER,
          totalEUA,
          convertingCER
        };
        
        if (user) {
          localStorage.setItem(`portfolio-${user.id}`, JSON.stringify(newPortfolio));
        }
        
        return newPortfolio;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Market simulation is handled by MarketOffersSync component which has access to live prices
  
  const purchaseCertificate = useCallback(async (offer: MarketOffer): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user has enough balance
    const totalCost = offer.price * offer.amount;
    
    if (user.balance < totalCost) {
      return false;
    }
    
    // Update user's balance
    updateUserBalance(user.balance - totalCost);
    
    // Generează ID-uri pentru certificate și tranzacții
    const certificateId = uuidv4();
    const transactionId = uuidv4();
    const timestamp = new Date();
    
    // Create new certificate
    const newCertificate: Certificate = {
      id: certificateId,
      type: offer.type,
      amount: offer.amount,
      price: offer.price,
      status: 'Available',
      seller: offer.sellerName,
      purchasedAt: timestamp
    };
    
    // Add transaction
    const newTransaction: Transaction = {
      id: transactionId,
      buyerId: user.id,
      sellerId: offer.sellerId,
      certificateType: offer.type,
      amount: offer.amount,
      price: offer.price,
      totalValue: totalCost,
      timestamp: timestamp
    };
    
    // Înregistrează activitatea în istoric
    addActivity({
      userId: user.id,
      timestamp: timestamp,
      type: 'PURCHASE',
      certificateId: certificateId,
      sellerId: offer.sellerId,
      amount: offer.amount,
      price: offer.price,
      totalValue: totalCost,
      details: `${offer.type} certificate from ${offer.sellerName}`
    });
    
    // Update state
    setPortfolio(prev => {
      const updatedCertificates = [...prev.certificates, newCertificate];
      const totalCER = updatedCertificates.filter(c => c.type === 'CER' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const totalEUA = updatedCertificates.filter(c => c.type === 'EUA' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const convertingCER = updatedCertificates.filter(c => c.status === 'Converting').reduce((sum, c) => sum + c.amount, 0);
      
      const newPortfolio = {
        certificates: updatedCertificates,
        totalCER,
        totalEUA,
        convertingCER
      };
      
      localStorage.setItem(`portfolio-${user.id}`, JSON.stringify(newPortfolio));
      
      return newPortfolio;
    });
    
    setTransactions(prev => {
      const newTransactions = [...prev, newTransaction];
      localStorage.setItem(`transactions-${user.id}`, JSON.stringify(newTransactions));
      return newTransactions;
    });
    
    // Remove offer from market
    setMarketOffers(prev => prev.filter(o => o.id !== offer.id));
    
    return true;
  }, [user, updateUserBalance]);
  
  const convertCertificate = useCallback(async (certificate: Certificate): Promise<boolean> => {
    if (!user || certificate.type !== 'CER' || certificate.status !== 'Available') {
      return false;
    }
    
    // Charge 2 EUR for the conversion
    updateUserBalance(user.balance - 2);
    
    // Timestamp pentru activitate
    const timestamp = new Date();
    
    // Înregistrează activitatea în istoric
    addActivity({
      userId: user.id,
      timestamp: timestamp,
      type: 'CONVERSION_START',
      certificateId: certificate.id,
      amount: certificate.amount,
      details: `Started conversion of ${certificate.amount} tons CER certificate`
    });
    
    setPortfolio(prev => {
      const updatedCertificates = prev.certificates.map(cert => 
        cert.id === certificate.id 
          ? { 
              ...cert, 
              status: 'Converting', 
              conversionStartedAt: timestamp 
            }
          : cert
      );
      
      const totalCER = updatedCertificates.filter(c => c.type === 'CER' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const totalEUA = updatedCertificates.filter(c => c.type === 'EUA' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const convertingCER = updatedCertificates.filter(c => c.status === 'Converting').reduce((sum, c) => sum + c.amount, 0);
      
      const newPortfolio = {
        certificates: updatedCertificates,
        totalCER,
        totalEUA,
        convertingCER
      };
      
      localStorage.setItem(`portfolio-${user.id}`, JSON.stringify(newPortfolio));
      
      return newPortfolio;
    });
    
    return true;
  }, [user, updateUserBalance]);
  
  const verifyCertificate = useCallback(async (certificate: Certificate): Promise<boolean> => {
    if (!user || certificate.type !== 'EUA' || certificate.status !== 'Available') {
      return false;
    }
    
    // Simulate verification with external registry
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Timestamp pentru activitate
    const timestamp = new Date();
    
    // Înregistrează activitatea de verificare
    addActivity({
      userId: user.id,
      timestamp: timestamp,
      type: 'VERIFICATION',
      certificateId: certificate.id,
      amount: certificate.amount,
      details: `Verified ${certificate.amount} tons EUA certificate`
    });
    
    setPortfolio(prev => {
      const updatedCertificates = prev.certificates.map(cert => 
        cert.id === certificate.id 
          ? { 
              ...cert, 
              status: 'Verified', 
              verifiedAt: timestamp
            }
          : cert
      );
      
      const totalCER = updatedCertificates.filter(c => c.type === 'CER' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const totalEUA = updatedCertificates.filter(c => c.type === 'EUA' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const convertingCER = updatedCertificates.filter(c => c.status === 'Converting').reduce((sum, c) => sum + c.amount, 0);
      
      const newPortfolio = {
        certificates: updatedCertificates,
        totalCER,
        totalEUA,
        convertingCER
      };
      
      localStorage.setItem(`portfolio-${user.id}`, JSON.stringify(newPortfolio));
      
      return newPortfolio;
    });
    
    return true;
  }, [user]);
  
  const surrenderCertificate = useCallback(async (certificate: Certificate): Promise<boolean> => {
    if (!user || certificate.type !== 'EUA' || certificate.status !== 'Verified') {
      return false;
    }
    
    // Simulate verification with external registry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Timestamp pentru activitate
    const timestamp = new Date();
    
    // Înregistrează activitatea de predare a certificatului
    addActivity({
      userId: user.id,
      timestamp: timestamp,
      type: 'SURRENDER',
      certificateId: certificate.id,
      amount: certificate.amount,
      details: `Surrendered ${certificate.amount} tons EUA certificate for emissions compliance`
    });
    
    // Update CO2 emissions
    setEmissions(prev => {
      const newEmissions = {
        ...prev,
        surrendered: prev.surrendered + certificate.amount,
        remaining: prev.remaining - certificate.amount
      };
      
      localStorage.setItem(`emissions-${user.id}`, JSON.stringify(newEmissions));
      
      return newEmissions;
    });
    
    // Remove certificate from portfolio
    setPortfolio(prev => {
      const updatedCertificates = prev.certificates.filter(cert => cert.id !== certificate.id);
      
      const totalCER = updatedCertificates.filter(c => c.type === 'CER' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const totalEUA = updatedCertificates.filter(c => c.type === 'EUA' && c.status === 'Available').reduce((sum, c) => sum + c.amount, 0);
      const convertingCER = updatedCertificates.filter(c => c.status === 'Converting').reduce((sum, c) => sum + c.amount, 0);
      
      const newPortfolio = {
        certificates: updatedCertificates,
        totalCER,
        totalEUA,
        convertingCER
      };
      
      localStorage.setItem(`portfolio-${user.id}`, JSON.stringify(newPortfolio));
      
      return newPortfolio;
    });
    
    return true;
  }, [user]);

  return (
    <CertificateContext.Provider 
      value={{ 
        portfolio, 
        marketOffers, 
        transactions, 
        emissions,
        purchaseCertificate, 
        convertCertificate,
        verifyCertificate,
        surrenderCertificate,
        updateMarketOffers
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
}