import { useEffect, useRef } from 'react';
import { useCertificates } from '../context/CertificateContext';
import { useStats } from '../context/StatsContext';
import { v4 as uuidv4 } from 'uuid';
import { getRandomSeller } from '../data/sellers';
import { MarketOffer, CertificateType } from '../types';

/**
 * Generate volume based on weighted distribution
 * 30% small volumes, 40% medium volumes, 30% large volumes
 */
function generateVolume(type: 'CEA' | 'EUA'): number {
  const rand = Math.random();
  if (rand < 0.3) {
    // 30% small volumes: CEA 500-2000, EUA 200-1000
    return type === 'CEA' 
      ? Math.floor(Math.random() * 1500) + 500  // Range: 500-2000
      : Math.floor(Math.random() * 800) + 200;  // Range: 200-1000
  } else if (rand < 0.7) {
    // 40% medium volumes: CEA 2000-6000, EUA 1000-3500
    return type === 'CEA'
      ? Math.floor(Math.random() * 4000) + 2000  // Range: 2000-6000
      : Math.floor(Math.random() * 2500) + 1000; // Range: 1000-3500
  } else {
    // 30% large volumes: CEA 8000-15000, EUA 5000-10000
    return type === 'CEA'
      ? Math.floor(Math.random() * 7000) + 8000  // Range: 8000-15000
      : Math.floor(Math.random() * 5000) + 5000; // Range: 5000-10000
  }
}

/**
 * Component that syncs market offers with live prices
 * Ensures the best (lowest) price for each certificate type matches the live price
 */
export default function MarketOffersSync() {
  const { marketOffers, updateMarketOffers } = useCertificates();
  const { realTimeEUA, realTimeCEA } = useStats();
  const initializedRef = useRef(false);

  // Initialize offers with live prices when they first become available
  // Delete all existing offers and recreate them only when live prices are available
  useEffect(() => {
    // If we have live prices, ensure offers are created/updated correctly
    if (realTimeEUA.price !== null && realTimeCEA.price !== null) {
      // Check if we need to recreate offers (if they don't exist or have wrong prices)
      const needsRecreation = marketOffers.length === 0 || 
        marketOffers.some(offer => 
          (offer.type === 'CEA' && offer.price < realTimeCEA.price!) ||
          (offer.type === 'EUA' && offer.price < realTimeEUA.price!)
        );

      if (needsRecreation) {
        initializedRef.current = true;

        // Delete all existing offers and create new ones with correct prices
        const ceaOffers: MarketOffer[] = Array(18).fill(null).map((_, i) => {
          const seller = getRandomSeller('CEA');
          // First offer matches live price exactly, others are higher with smaller variation
          const price = i === 0 
            ? realTimeCEA.price! 
            : parseFloat((realTimeCEA.price! + Math.random() * 1 + 0.5).toFixed(2)); // 0.5-1.5 EUR variation
          
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'CEA' as CertificateType,
            amount: generateVolume('CEA'),
            price: price,
            timestamp: new Date(),
          };
        });
        
        const euaOffers: MarketOffer[] = Array(15).fill(null).map((_, i) => {
          const seller = getRandomSeller('EUA');
          // First offer matches live price exactly, others are higher with smaller variation
          const price = i === 0 
            ? realTimeEUA.price! 
            : parseFloat((realTimeEUA.price! + Math.random() * 1 + 1).toFixed(2)); // 1-2 EUR variation
          
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'EUA' as CertificateType,
            amount: generateVolume('EUA'),
            price: price,
            timestamp: new Date(),
          };
        });
        
        // Sort offers by price (lowest first) before setting
        const sortedCeaOffers = ceaOffers.sort((a, b) => a.price - b.price);
        const sortedEuaOffers = euaOffers.sort((a, b) => a.price - b.price);
        
        updateMarketOffers(() => [...sortedCeaOffers, ...sortedEuaOffers]);
      }
    } else {
      // If live prices are not available, delete all offers
      if (marketOffers.length > 0) {
        updateMarketOffers(() => []);
        initializedRef.current = false;
      }
    }
  }, [marketOffers.length, realTimeEUA.price, realTimeCEA.price, updateMarketOffers]);

  // Sync best prices with live prices when live prices update or offers change
  // Ensures best price matches live price and all offers are at or above live price
  // This runs continuously to catch any offers that might slip below live prices
  useEffect(() => {
    if (marketOffers.length === 0) return;
    if (!realTimeEUA.price && !realTimeCEA.price) {
      // If live prices are not available, delete all offers
      updateMarketOffers(() => []);
      return;
    }

    updateMarketOffers(prevOffers => {
      let updatedOffers = [...prevOffers];
      let needsUpdate = false;
      let needsRecreation = false;

      // Check if any offers are below live prices - if so, recreate all offers
      if (realTimeEUA.price !== null) {
        const hasInvalidEUA = updatedOffers.some(o => o.type === 'EUA' && o.price < realTimeEUA.price!);
        if (hasInvalidEUA) {
          needsRecreation = true;
        }
      }
      
      if (realTimeCEA.price !== null) {
        const hasInvalidCEA = updatedOffers.some(o => o.type === 'CEA' && o.price < realTimeCEA.price!);
        if (hasInvalidCEA) {
          needsRecreation = true;
        }
      }

      // If any offers are invalid, recreate all offers
      if (needsRecreation && realTimeEUA.price !== null && realTimeCEA.price !== null) {

        const ceaOffers: MarketOffer[] = Array(18).fill(null).map((_, i) => {
          const seller = getRandomSeller('CEA');
          const price = i === 0 
            ? realTimeCEA.price! 
            : parseFloat((realTimeCEA.price! + Math.random() * 1 + 0.5).toFixed(2)); // 0.5-1.5 EUR variation
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'CEA' as CertificateType,
            amount: generateVolume('CEA'),
            price: price,
            timestamp: new Date(),
          };
        });
        
        const euaOffers: MarketOffer[] = Array(15).fill(null).map((_, i) => {
          const seller = getRandomSeller('EUA');
          const price = i === 0 
            ? realTimeEUA.price! 
            : parseFloat((realTimeEUA.price! + Math.random() * 1 + 1).toFixed(2)); // 1-2 EUR variation
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'EUA' as CertificateType,
            amount: generateVolume('EUA'),
            price: price,
            timestamp: new Date(),
          };
        });
        
        const sortedCeaOffers = ceaOffers.sort((a, b) => a.price - b.price);
        const sortedEuaOffers = euaOffers.sort((a, b) => a.price - b.price);
        return [...sortedCeaOffers, ...sortedEuaOffers];
      }

      // Otherwise, sync prices normally
      // Sync EUA offers with live EU ETS price
      if (realTimeEUA.price !== null) {
        const euaOffers = updatedOffers.filter(o => o.type === 'EUA');
        if (euaOffers.length > 0) {
          const sortedEuaOffers = [...euaOffers].sort((a, b) => a.price - b.price);
          const bestOffer = sortedEuaOffers[0];
          
          updatedOffers = updatedOffers.map(offer => {
            if (offer.type === 'EUA') {
              if (offer.id === bestOffer.id) {
                if (Math.abs(offer.price - realTimeEUA.price!) > 0.01) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeEUA.price!, timestamp: new Date() };
                }
              } else if (offer.price < realTimeEUA.price!) {
                needsUpdate = true;
                return { ...offer, price: realTimeEUA.price!, timestamp: new Date() };
              }
            }
            return offer;
          });
        }
      }

      // Sync CEA offers with live Chinese CEA price
      if (realTimeCEA.price !== null) {
        const ceaOffers = updatedOffers.filter(o => o.type === 'CEA');
        if (ceaOffers.length > 0) {
          const sortedCeaOffers = [...ceaOffers].sort((a, b) => a.price - b.price);
          const bestOffer = sortedCeaOffers[0];
          
          updatedOffers = updatedOffers.map(offer => {
            if (offer.type === 'CEA') {
              if (offer.id === bestOffer.id) {
                if (Math.abs(offer.price - realTimeCEA.price!) > 0.01) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeCEA.price!, timestamp: new Date() };
                }
              } else if (offer.price < realTimeCEA.price!) {
                needsUpdate = true;
                return { ...offer, price: realTimeCEA.price!, timestamp: new Date() };
              }
            }
            return offer;
          });
        }
      }

      // Sort offers by type and price (lowest first) for consistent display
      if (needsUpdate) {
        const ceaOffers = updatedOffers.filter(o => o.type === 'CEA').sort((a, b) => a.price - b.price);
        const euaOffers = updatedOffers.filter(o => o.type === 'EUA').sort((a, b) => a.price - b.price);
        updatedOffers = [...ceaOffers, ...euaOffers];
      }

      return needsUpdate ? updatedOffers : prevOffers;
    });
  }, [realTimeEUA.price, realTimeCEA.price, marketOffers.length, updateMarketOffers]);

  // Periodic sync check to ensure all offers are at or above live prices
  // This runs every 5 seconds to catch any offers that might slip below live prices
  useEffect(() => {
    if (marketOffers.length === 0) return;
    if (!realTimeEUA.price && !realTimeCEA.price) return;

    const syncInterval = setInterval(() => {
      updateMarketOffers(prevOffers => {
        let updatedOffers = [...prevOffers];
        let needsUpdate = false;

        // Check and fix EUA offers
        if (realTimeEUA.price !== null) {
          const euaOffers = updatedOffers.filter(o => o.type === 'EUA');
          if (euaOffers.length > 0) {
            const sortedEuaOffers = [...euaOffers].sort((a, b) => a.price - b.price);
            const bestOffer = sortedEuaOffers[0];
            
            updatedOffers = updatedOffers.map(offer => {
              if (offer.type === 'EUA') {
                if (offer.id === bestOffer.id) {
                  if (Math.abs(offer.price - realTimeEUA.price!) > 0.01) {
                    needsUpdate = true;
                    return { ...offer, price: realTimeEUA.price!, timestamp: new Date() };
                  }
                } else if (offer.price < realTimeEUA.price!) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeEUA.price!, timestamp: new Date() };
                }
              }
              return offer;
            });
          }
        }

        // Check and fix CEA offers
        if (realTimeCEA.price !== null) {
          const ceaOffers = updatedOffers.filter(o => o.type === 'CEA');
          if (ceaOffers.length > 0) {
            const sortedCeaOffers = [...ceaOffers].sort((a, b) => a.price - b.price);
            const bestOffer = sortedCeaOffers[0];
            
            updatedOffers = updatedOffers.map(offer => {
              if (offer.type === 'CEA') {
                if (offer.id === bestOffer.id) {
                  if (Math.abs(offer.price - realTimeCEA.price!) > 0.01) {
                    needsUpdate = true;
                    return { ...offer, price: realTimeCEA.price!, timestamp: new Date() };
                  }
                } else if (offer.price < realTimeCEA.price!) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeCEA.price!, timestamp: new Date() };
                }
              }
              return offer;
            });
          }
        }

        if (needsUpdate) {
          const ceaOffers = updatedOffers.filter(o => o.type === 'CEA').sort((a, b) => a.price - b.price);
          const euaOffers = updatedOffers.filter(o => o.type === 'EUA').sort((a, b) => a.price - b.price);
          return [...ceaOffers, ...euaOffers];
        }
        return prevOffers;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(syncInterval);
  }, [marketOffers.length, realTimeEUA.price, realTimeCEA.price, updateMarketOffers]);

  // Simulate market price changes using live prices as minimums
  useEffect(() => {
    if (marketOffers.length === 0) return;

    const interval = setInterval(() => {
      updateMarketOffers(prev => {
        const updatedOffers = prev.map(offer => {
          // 30% chance to update price
          if (Math.random() < 0.3) {
            const priceChange = parseFloat((Math.random() * 0.5 - 0.25).toFixed(2)); // -0.25 to +0.25 EUR
            const newPrice = parseFloat((offer.price + priceChange).toFixed(2));
            
            // Use live price as minimum
            let minPrice: number;
            if (offer.type === 'CEA' && realTimeCEA.price !== null) {
              minPrice = realTimeCEA.price;
            } else if (offer.type === 'EUA' && realTimeEUA.price !== null) {
              minPrice = realTimeEUA.price;
            } else {
              // Fallback to hardcoded minimums if live prices aren't available
              minPrice = offer.type === 'CEA' ? 37 : 57;
            }
            
            return {
              ...offer,
              price: Math.max(minPrice, newPrice),
              timestamp: new Date()
            };
          }
          return offer;
        });
        
        // 5% chance to add a new offer
        if (Math.random() < 0.05) {
          const type: CertificateType = Math.random() < 0.6 ? 'CEA' : 'EUA';
          const seller = getRandomSeller(type);
          
          // Use live price as base, with some variation above it
          let basePrice: number;
          if (type === 'CEA' && realTimeCEA.price !== null) {
            basePrice = realTimeCEA.price;
          } else if (type === 'EUA' && realTimeEUA.price !== null) {
            basePrice = realTimeEUA.price;
          } else {
            // Fallback to hardcoded base prices if live prices aren't available
            basePrice = type === 'CEA' ? 40 : 62;
          }
          
          // Generate volume with weighted distribution
          const amount = generateVolume(type);

          const newOffer: MarketOffer = {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: type,
            amount: amount,
            price: parseFloat((Math.random() * (type === 'CEA' ? 1 : 1) + basePrice + (type === 'CEA' ? 0.5 : 1)).toFixed(2)),
            timestamp: new Date()
          };
          
          // Sort offers by type and price after adding new offer
          const ceaOffers = [...updatedOffers.filter(o => o.type === 'CEA'), ...(newOffer.type === 'CEA' ? [newOffer] : [])].sort((a, b) => a.price - b.price);
          const euaOffers = [...updatedOffers.filter(o => o.type === 'EUA'), ...(newOffer.type === 'EUA' ? [newOffer] : [])].sort((a, b) => a.price - b.price);
          
          return [...ceaOffers, ...euaOffers];
        }
        
        return updatedOffers;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [marketOffers.length, realTimeEUA.price, realTimeCEA.price, updateMarketOffers]);

  return null; // This component doesn't render anything
}

