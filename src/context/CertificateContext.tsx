import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addMinutes } from 'date-fns';
import { Certificate, Portfolio, MarketOffer, Transaction, CertificateType, CO2Emissions } from '../types';
import { useAuth } from './AuthContext';
import { sellers, getRandomSeller, getSellerById } from '../data/sellers';
import { addActivity, initializeActivityHistory, ActivityType } from '../data/activityHistory';

interface CertificateContextType {
  portfolio: Portfolio;
  marketOffers: MarketOffer[];
  transactions: Transaction[];
  emissions: CO2Emissions;
  purchaseCertificate: (offer: MarketOffer) => Promise<boolean>;
  convertCertificate: (certificate: Certificate) => Promise<boolean>;
  verifyCertificate: (certificate: Certificate) => Promise<boolean>;
  surrenderCertificate: (certificate: Certificate) => Promise<boolean>;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Initial market offers - folosind entități reale
const initialCEROffers: MarketOffer[] = Array(10).fill(null).map(() => {
  const seller = getRandomSeller('CER');
  return {
    id: uuidv4(),
    sellerId: seller.id,
    sellerName: seller.name,
    type: 'CER' as CertificateType,
    amount: Math.floor(Math.random() * 5000) + 1000,
    price: parseFloat((Math.random() * 5 + 38).toFixed(2)), // 38-43 EUR
    timestamp: new Date(),
  };
});

const initialEUAOffers: MarketOffer[] = Array(8).fill(null).map(() => {
  const seller = getRandomSeller('EUA');
  return {
    id: uuidv4(),
    sellerId: seller.id,
    sellerName: seller.name,
    type: 'EUA' as CertificateType,
    amount: Math.floor(Math.random() * 3000) + 500,
    price: parseFloat((Math.random() * 8 + 58).toFixed(2)), // 58-66 EUR
    timestamp: new Date(),
  };
});

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
  const [marketOffers, setMarketOffers] = useState<MarketOffer[]>([
    ...initialCEROffers,
    ...initialEUAOffers
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [emissions, setEmissions] = useState<CO2Emissions>(initialEmissions);
  
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
          certificates: parsedPortfolio.certificates.map((cert: any) => ({
            ...cert,
            purchasedAt: cert.purchasedAt ? new Date(cert.purchasedAt) : undefined,
            conversionStartedAt: cert.conversionStartedAt ? new Date(cert.conversionStartedAt) : undefined,
            conversionCompletedAt: cert.conversionCompletedAt ? new Date(cert.conversionCompletedAt) : undefined,
            verifiedAt: cert.verifiedAt ? new Date(cert.verifiedAt) : undefined,
          }))
        });
      }
      
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions).map((tx: any) => ({
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
  
  // Simulate market price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketOffers(prev => {
        const updatedOffers = prev.map(offer => {
          // 30% chance to update price
          if (Math.random() < 0.3) {
            const priceChange = parseFloat((Math.random() * 0.5 - 0.25).toFixed(2)); // -0.25 to +0.25 EUR
            return {
              ...offer,
              price: Math.max(offer.type === 'CER' ? 37 : 57, parseFloat((offer.price + priceChange).toFixed(2)))
            };
          }
          return offer;
        });
        
        // 5% chance to add a new offer
        if (Math.random() < 0.05) {
          const type = Math.random() < 0.6 ? 'CER' : 'EUA';
          const seller = getRandomSeller(type);
          
          const newOffer: MarketOffer = {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: type,
            amount: Math.floor(Math.random() * (type === 'CER' ? 5000 : 3000)) + (type === 'CER' ? 1000 : 500),
            price: parseFloat((Math.random() * (type === 'CER' ? 5 : 8) + (type === 'CER' ? 38 : 58)).toFixed(2)),
            timestamp: new Date()
          };
          return [...updatedOffers, newOffer];
        }
        
        return updatedOffers;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
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
        surrenderCertificate
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