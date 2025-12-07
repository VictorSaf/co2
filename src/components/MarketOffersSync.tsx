import { useEffect, useRef } from 'react';
import { useCertificates } from '../context/CertificateContext';
import { useStats } from '../context/StatsContext';
import { v4 as uuidv4 } from 'uuid';
import { getRandomSeller } from '../data/sellers';
import { MarketOffer, CertificateType } from '../types';

/**
 * Component that syncs market offers with live prices
 * Ensures the best (lowest) price for each certificate type matches the live price
 */
export default function MarketOffersSync() {
  const { marketOffers, updateMarketOffers } = useCertificates();
  const { realTimeEUA, realTimeCER } = useStats();
  const initializedRef = useRef(false);

  // Initialize offers with live prices when they first become available
  // Delete all existing offers and recreate them only when live prices are available
  useEffect(() => {
    // If we have live prices, ensure offers are created/updated correctly
    if (realTimeEUA.price !== null && realTimeCER.price !== null) {
      // Check if we need to recreate offers (if they don't exist or have wrong prices)
      const needsRecreation = marketOffers.length === 0 || 
        marketOffers.some(offer => 
          (offer.type === 'CER' && offer.price < realTimeCER.price!) ||
          (offer.type === 'EUA' && offer.price < realTimeEUA.price!)
        );

      if (needsRecreation) {
        initializedRef.current = true;
        
        // Delete all existing offers and create new ones with correct prices
        const cerOffers: MarketOffer[] = Array(10).fill(null).map((_, i) => {
          const seller = getRandomSeller('CER');
          // First offer matches live price exactly, others are higher
          const price = i === 0 
            ? realTimeCER.price! 
            : parseFloat((realTimeCER.price! + Math.random() * 3 + 0.5).toFixed(2));
          
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'CER' as CertificateType,
            amount: Math.floor(Math.random() * 5000) + 1000,
            price: price,
            timestamp: new Date(),
          };
        });
        
        const euaOffers: MarketOffer[] = Array(8).fill(null).map((_, i) => {
          const seller = getRandomSeller('EUA');
          // First offer matches live price exactly, others are higher
          const price = i === 0 
            ? realTimeEUA.price! 
            : parseFloat((realTimeEUA.price! + Math.random() * 5 + 1).toFixed(2));
          
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'EUA' as CertificateType,
            amount: Math.floor(Math.random() * 3000) + 500,
            price: price,
            timestamp: new Date(),
          };
        });
        
        // Sort offers by price (lowest first) before setting
        const sortedCerOffers = cerOffers.sort((a, b) => a.price - b.price);
        const sortedEuaOffers = euaOffers.sort((a, b) => a.price - b.price);
        
        updateMarketOffers(() => [...sortedCerOffers, ...sortedEuaOffers]);
      }
    } else {
      // If live prices are not available, delete all offers
      if (marketOffers.length > 0) {
        updateMarketOffers(() => []);
        initializedRef.current = false;
      }
    }
  }, [marketOffers.length, realTimeEUA.price, realTimeCER.price, updateMarketOffers]);

  // Sync best prices with live prices when live prices update or offers change
  // Ensures best price matches live price and all offers are at or above live price
  // This runs continuously to catch any offers that might slip below live prices
  useEffect(() => {
    if (marketOffers.length === 0) return;
    if (!realTimeEUA.price && !realTimeCER.price) {
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
      
      if (realTimeCER.price !== null) {
        const hasInvalidCER = updatedOffers.some(o => o.type === 'CER' && o.price < realTimeCER.price!);
        if (hasInvalidCER) {
          needsRecreation = true;
        }
      }

      // If any offers are invalid, recreate all offers
      if (needsRecreation && realTimeEUA.price !== null && realTimeCER.price !== null) {
        const cerOffers: MarketOffer[] = Array(10).fill(null).map((_, i) => {
          const seller = getRandomSeller('CER');
          const price = i === 0 
            ? realTimeCER.price! 
            : parseFloat((realTimeCER.price! + Math.random() * 3 + 0.5).toFixed(2));
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'CER' as CertificateType,
            amount: Math.floor(Math.random() * 5000) + 1000,
            price: price,
            timestamp: new Date(),
          };
        });
        
        const euaOffers: MarketOffer[] = Array(8).fill(null).map((_, i) => {
          const seller = getRandomSeller('EUA');
          const price = i === 0 
            ? realTimeEUA.price! 
            : parseFloat((realTimeEUA.price! + Math.random() * 5 + 1).toFixed(2));
          return {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: 'EUA' as CertificateType,
            amount: Math.floor(Math.random() * 3000) + 500,
            price: price,
            timestamp: new Date(),
          };
        });
        
        const sortedCerOffers = cerOffers.sort((a, b) => a.price - b.price);
        const sortedEuaOffers = euaOffers.sort((a, b) => a.price - b.price);
        return [...sortedCerOffers, ...sortedEuaOffers];
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

      // Sync CER offers with live Chinese CER price
      if (realTimeCER.price !== null) {
        const cerOffers = updatedOffers.filter(o => o.type === 'CER');
        if (cerOffers.length > 0) {
          const sortedCerOffers = [...cerOffers].sort((a, b) => a.price - b.price);
          const bestOffer = sortedCerOffers[0];
          
          updatedOffers = updatedOffers.map(offer => {
            if (offer.type === 'CER') {
              if (offer.id === bestOffer.id) {
                if (Math.abs(offer.price - realTimeCER.price!) > 0.01) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeCER.price!, timestamp: new Date() };
                }
              } else if (offer.price < realTimeCER.price!) {
                needsUpdate = true;
                return { ...offer, price: realTimeCER.price!, timestamp: new Date() };
              }
            }
            return offer;
          });
        }
      }

      // Sort offers by type and price (lowest first) for consistent display
      if (needsUpdate) {
        const cerOffers = updatedOffers.filter(o => o.type === 'CER').sort((a, b) => a.price - b.price);
        const euaOffers = updatedOffers.filter(o => o.type === 'EUA').sort((a, b) => a.price - b.price);
        updatedOffers = [...cerOffers, ...euaOffers];
      }

      return needsUpdate ? updatedOffers : prevOffers;
    });
  }, [realTimeEUA.price, realTimeCER.price, marketOffers.length, updateMarketOffers]);

  // Periodic sync check to ensure all offers are at or above live prices
  // This runs every 5 seconds to catch any offers that might slip below live prices
  useEffect(() => {
    if (marketOffers.length === 0) return;
    if (!realTimeEUA.price && !realTimeCER.price) return;

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

        // Check and fix CER offers
        if (realTimeCER.price !== null) {
          const cerOffers = updatedOffers.filter(o => o.type === 'CER');
          if (cerOffers.length > 0) {
            const sortedCerOffers = [...cerOffers].sort((a, b) => a.price - b.price);
            const bestOffer = sortedCerOffers[0];
            
            updatedOffers = updatedOffers.map(offer => {
              if (offer.type === 'CER') {
                if (offer.id === bestOffer.id) {
                  if (Math.abs(offer.price - realTimeCER.price!) > 0.01) {
                    needsUpdate = true;
                    return { ...offer, price: realTimeCER.price!, timestamp: new Date() };
                  }
                } else if (offer.price < realTimeCER.price!) {
                  needsUpdate = true;
                  return { ...offer, price: realTimeCER.price!, timestamp: new Date() };
                }
              }
              return offer;
            });
          }
        }

        if (needsUpdate) {
          const cerOffers = updatedOffers.filter(o => o.type === 'CER').sort((a, b) => a.price - b.price);
          const euaOffers = updatedOffers.filter(o => o.type === 'EUA').sort((a, b) => a.price - b.price);
          return [...cerOffers, ...euaOffers];
        }
        return prevOffers;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(syncInterval);
  }, [marketOffers.length, realTimeEUA.price, realTimeCER.price, updateMarketOffers]);

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
            if (offer.type === 'CER' && realTimeCER.price !== null) {
              minPrice = realTimeCER.price;
            } else if (offer.type === 'EUA' && realTimeEUA.price !== null) {
              minPrice = realTimeEUA.price;
            } else {
              // Fallback to hardcoded minimums if live prices aren't available
              minPrice = offer.type === 'CER' ? 37 : 57;
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
          const type: CertificateType = Math.random() < 0.6 ? 'CER' : 'EUA';
          const seller = getRandomSeller(type);
          
          // Use live price as base, with some variation above it
          let basePrice: number;
          if (type === 'CER' && realTimeCER.price !== null) {
            basePrice = realTimeCER.price;
          } else if (type === 'EUA' && realTimeEUA.price !== null) {
            basePrice = realTimeEUA.price;
          } else {
            // Fallback to hardcoded base prices if live prices aren't available
            basePrice = type === 'CER' ? 40 : 62;
          }
          
          const newOffer: MarketOffer = {
            id: uuidv4(),
            sellerId: seller.id,
            sellerName: seller.name,
            type: type,
            amount: Math.floor(Math.random() * (type === 'CER' ? 5000 : 3000)) + (type === 'CER' ? 1000 : 500),
            price: parseFloat((Math.random() * (type === 'CER' ? 5 : 8) + basePrice + 0.5).toFixed(2)),
            timestamp: new Date()
          };
          
          // Sort offers by type and price after adding new offer
          const cerOffers = [...updatedOffers.filter(o => o.type === 'CER'), ...(newOffer.type === 'CER' ? [newOffer] : [])].sort((a, b) => a.price - b.price);
          const euaOffers = [...updatedOffers.filter(o => o.type === 'EUA'), ...(newOffer.type === 'EUA' ? [newOffer] : [])].sort((a, b) => a.price - b.price);
          
          return [...cerOffers, ...euaOffers];
        }
        
        return updatedOffers;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [marketOffers.length, realTimeEUA.price, realTimeCER.price, updateMarketOffers]);

  return null; // This component doesn't render anything
}

