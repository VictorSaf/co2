import { useStats } from '../context/StatsContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LivePriceTicker() {
  const { realTimeEUA, realTimeCEA, refreshEUAPrice, refreshCEAPrice } = useStats();
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRefresh = async () => {
    await Promise.all([refreshEUAPrice(), refreshCEAPrice()]);
  };

  const getChangeIndicator = (change24h: number | null) => {
    if (change24h === null || change24h === 0) {
      return null;
    }
    
    const isPositive = change24h > 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    
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
  const isLoading = realTimeEUA.isLoading || realTimeCEA.isLoading;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('livePrices') || 'Live Prices'}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('refresh') || 'Refresh'}
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EU ETS Price */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('liveEUAPrice') || 'Live EU ETS Price'}
            </h3>
            {realTimeEUA.isLoading && (
              <ArrowPathIcon className="h-3 w-3 animate-spin text-gray-400 dark:text-gray-500" />
            )}
          </div>
          
          <div className="flex items-baseline space-x-3">
            {realTimeEUA.price !== null ? (
              <>
                <span className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                  €{realTimeEUA.price.toFixed(2)}
                </span>
                {getChangeIndicator(realTimeEUA.change24h)}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-400 dark:text-gray-500">
                  {realTimeEUA.error || (t('loading') || 'Loading...')}
                </span>
              </div>
            )}
          </div>
          
          {realTimeEUA.lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('lastUpdated') || 'Last updated'}: {format(realTimeEUA.lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Chinese CEA Price */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('liveCEAPrice') || 'Live Chinese CEA Price'}
            </h3>
            {realTimeCEA.isLoading && (
              <ArrowPathIcon className="h-3 w-3 animate-spin text-gray-400 dark:text-gray-500" />
            )}
          </div>
          
          <div className="flex items-baseline space-x-3">
            {realTimeCEA.price !== null ? (
              <>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  €{realTimeCEA.price.toFixed(2)}
                </span>
                {getChangeIndicator(realTimeCEA.change24h)}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-400 dark:text-gray-500">
                  {realTimeCEA.error || (t('loading') || 'Loading...')}
                </span>
              </div>
            )}
          </div>
          
          {realTimeCEA.lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('lastUpdated') || 'Last updated'}: {format(realTimeCEA.lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Conversion Price */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('conversionPrice') || 'Conversion Price'}
            </h3>
          </div>
          
          {conversionRange ? (
            <>
              <div className="flex flex-col space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    €{conversionRange.min.toFixed(2)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">-</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    €{conversionRange.max.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({t('discountRange') || '6-12% discount'})
                </p>
                <div className="flex items-center gap-1 mt-1 relative">
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    {t('dependingOnVolume') || 'depending on volume'}
                  </p>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <InformationCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 cursor-help" />
                    {showTooltip && realTimeEUA.price !== null && (
                      <div className="absolute right-0 bottom-full mb-2 w-80 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg p-3 shadow-xl z-50 border border-gray-700">
                        <p className="mb-2 text-gray-300 dark:text-gray-400">{t('minVolumeTrade') || 'Min. volume trade 10 Mio EUR.'}</p>
                        <ul className="space-y-1.5">
                          {getVolumeDiscountPrices()?.map((tier, index) => (
                            <li key={index} className="flex justify-between items-start">
                              <span className="text-gray-300 dark:text-gray-400">{tier.volumeRange}</span>
                              <div className="text-right ml-2">
                                <span className="text-white dark:text-gray-100 font-semibold">{tier.discount}% {t('discount') || 'discount'}</span>
                                <div className="text-white dark:text-gray-100 font-bold mt-0.5">
                                  €{tier.price.toFixed(2)}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {/* Arrow pointer */}
                        <div className="absolute top-full right-4 -mt-1">
                          <div className="w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-lg text-gray-400 dark:text-gray-500">
                {t('loading') || 'Loading...'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {(realTimeEUA.error && realTimeEUA.price === null) || (realTimeCEA.error && realTimeCEA.price === null) ? (
        <div className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          {t('usingMarketData') || 'Using market data as fallback'}
        </div>
      ) : null}
    </div>
  );
}

