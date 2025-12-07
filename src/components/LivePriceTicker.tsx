import { useStats } from '../context/StatsContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LivePriceTicker() {
  const { realTimeEUA, realTimeCER, refreshEUAPrice, refreshCERPrice } = useStats();
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRefresh = async () => {
    await Promise.all([refreshEUAPrice(), refreshCERPrice()]);
  };

  const getChangeIndicator = (change24h: number | null) => {
    if (change24h === null || change24h === 0) {
      return null;
    }
    
    const isPositive = change24h > 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">
          {Math.abs(change24h).toFixed(2)}%
        </span>
      </div>
    );
  };

  // Calculate conversion price range (6-12% discount from EU ETS price)
  const getConversionPriceRange = () => {
    if (realTimeEUA.price === null) {
      return null;
    }
    const minPrice = realTimeEUA.price * (1 - 0.12); // 12% discount
    const maxPrice = realTimeEUA.price * (1 - 0.06); // 6% discount
    return {
      min: minPrice,
      max: maxPrice,
    };
  };

  // Calculate discount prices for each volume tier
  const getVolumeDiscountPrices = () => {
    if (realTimeEUA.price === null) {
      return null;
    }
    const basePrice = realTimeEUA.price;
    return [
      {
        volumeRange: t('volumeTier1') || '10 Mio to 15 Mio EUR trade volume',
        discount: 6,
        price: basePrice * (1 - 0.06),
      },
      {
        volumeRange: t('volumeTier2') || '15 Mio to 18 Mio trade volume',
        discount: 8,
        price: basePrice * (1 - 0.08),
      },
      {
        volumeRange: t('volumeTier3') || '18 Mio to 20 Mio trade volume',
        discount: 10,
        price: basePrice * (1 - 0.10),
      },
      {
        volumeRange: t('volumeTier4') || 'more than 20 Mio trade volume',
        discount: 12,
        price: basePrice * (1 - 0.12),
      },
    ];
  };

  const conversionRange = getConversionPriceRange();
  const isLoading = realTimeEUA.isLoading || realTimeCER.isLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('livePrices') || 'Live Prices'}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('refresh') || 'Refresh'}
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EU ETS Price */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {t('liveEUAPrice') || 'Live EU ETS Price'}
            </h3>
            {realTimeEUA.isLoading && (
              <ArrowPathIcon className="h-3 w-3 animate-spin text-gray-400" />
            )}
          </div>
          
          <div className="flex items-baseline space-x-3">
            {realTimeEUA.price !== null ? (
              <>
                <span className="text-2xl font-bold text-secondary-600">
                  €{realTimeEUA.price.toFixed(2)}
                </span>
                {getChangeIndicator(realTimeEUA.change24h)}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-400">
                  {realTimeEUA.error || (t('loading') || 'Loading...')}
                </span>
              </div>
            )}
          </div>
          
          {realTimeEUA.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              {t('lastUpdated') || 'Last updated'}: {format(realTimeEUA.lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Chinese CER Price */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {t('liveCERPrice') || 'Live Chinese CER Price'}
            </h3>
            {realTimeCER.isLoading && (
              <ArrowPathIcon className="h-3 w-3 animate-spin text-gray-400" />
            )}
          </div>
          
          <div className="flex items-baseline space-x-3">
            {realTimeCER.price !== null ? (
              <>
                <span className="text-2xl font-bold text-primary-600">
                  €{realTimeCER.price.toFixed(2)}
                </span>
                {getChangeIndicator(realTimeCER.change24h)}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-400">
                  {realTimeCER.error || (t('loading') || 'Loading...')}
                </span>
              </div>
            )}
          </div>
          
          {realTimeCER.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              {t('lastUpdated') || 'Last updated'}: {format(realTimeCER.lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Conversion Price */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {t('conversionPrice') || 'Conversion Price'}
            </h3>
          </div>
          
          {conversionRange ? (
            <>
              <div className="flex flex-col space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-indigo-600">
                    €{conversionRange.min.toFixed(2)}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-xl font-bold text-indigo-600">
                    €{conversionRange.max.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  ({t('discountRange') || '6-12% discount'})
                </p>
                <div className="flex items-center gap-1 mt-1 relative">
                  <p className="text-xs text-amber-600 italic">
                    {t('dependingOnVolume') || 'depending on volume'}
                  </p>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <InformationCircleIcon className="h-4 w-4 text-amber-600 cursor-help" />
                    {showTooltip && realTimeEUA.price !== null && (
                      <div className="absolute right-0 bottom-full mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50">
                        <p className="mb-2 text-gray-300">{t('minVolumeTrade') || 'Min. volume trade 10 Mio EUR.'}</p>
                        <ul className="space-y-1.5">
                          {getVolumeDiscountPrices()?.map((tier, index) => (
                            <li key={index} className="flex justify-between items-start">
                              <span className="text-gray-300">{tier.volumeRange}</span>
                              <div className="text-right ml-2">
                                <span className="text-white font-semibold">{tier.discount}% {t('discount') || 'discount'}</span>
                                <div className="text-white font-bold mt-0.5">
                                  €{tier.price.toFixed(2)}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {/* Arrow pointer */}
                        <div className="absolute top-full right-4 -mt-1">
                          <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-lg text-gray-400">
                {t('loading') || 'Loading...'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {(realTimeEUA.error && realTimeEUA.price === null) || (realTimeCER.error && realTimeCER.price === null) ? (
        <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {t('usingMarketData') || 'Using market data as fallback'}
        </div>
      ) : null}
    </div>
  );
}

