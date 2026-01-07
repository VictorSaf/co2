import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPriceUpdateStatus, refreshPrices, type PriceUpdateStatus } from '../../services/adminService';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { POLLING_INTERVAL as EUA_POLLING_INTERVAL } from '../../services/euaPriceService';
import { POLLING_INTERVAL as CEA_POLLING_INTERVAL } from '../../services/ceaPriceService';

export default function PriceUpdateMonitoring() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<PriceUpdateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      setError(null);
      const data = await getPriceUpdateStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || t('errorLoadingStatus'));
      // Set default status structure if API fails
      setStatus({
        eua: {
          pollingInterval: EUA_POLLING_INTERVAL,
          cacheDuration: 120,
          endpoint: '/api/eua/price',
          libraries: {
            backend: ['requests', 'beautifulsoup4', 'json', 're'],
            frontend: ['axios'],
          },
          dataSources: [
            'ICE (Intercontinental Exchange)',
            'CarbonCredits.com',
            'Alpha Vantage API',
            'TradingView',
            'Investing.com',
            'MarketWatch',
            'ICE public pages',
            'OilPriceAPI (fallback)',
          ],
        },
        cea: {
          pollingInterval: CEA_POLLING_INTERVAL,
          cacheDuration: 120,
          endpoint: '/api/cea/price',
          libraries: {
            backend: ['requests', 'beautifulsoup4', 'json', 're'],
            frontend: ['axios'],
          },
          method: 'Generated based on EUA price (30-50% discount)',
        },
        historical: {
          libraries: ['requests', 'BeautifulSoup', 'json'],
          method: 'Realistic generation based on market trends',
          dataFiles: [
            'backend/data/historical_eua.json',
            'backend/data/historical_cea.json',
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await refreshPrices();
      // Reload status after refresh
      await loadStatus();
    } catch (err: any) {
      setError(err.message || t('errorRefreshingPrices'));
    } finally {
      setRefreshing(false);
    }
  };

  const formatInterval = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} ${t('minutes')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('never');
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('priceUpdateMonitoring')}
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('refreshing') : t('refreshPrices')}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {status && (
          <div className="space-y-6">
            {/* EUA Price Updates */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('euaPrice')} {t('updates')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('pollingInterval')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatInterval(status.eua.pollingInterval)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('cacheDuration')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{status.eua.cacheDuration} {t('seconds')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('endpoint')}</p>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{status.eua.endpoint}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lastUpdate')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(status.eua.lastUpdate)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lastSource')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{status.eua.lastSource || t('unknown')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lastPrice')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {status.eua.lastPrice ? `€${status.eua.lastPrice.toFixed(2)}` : t('unknown')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                  <div className="flex items-center">
                    {status.eua.status === 'success' ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">{t('success')}</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                        <span className="text-sm text-red-600 dark:text-red-400">{t('error')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('libraries')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Backend: {status.eua.libraries.backend.join(', ')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Frontend: {status.eua.libraries.frontend.join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('sourcePrices')}</p>
                {status.eua.sourcePrices && status.eua.sourcePrices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('dataSources')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('lastPrice')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('lastUpdate')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {status.eua.sourcePrices.map((sourcePrice) => {
                          const isCurrentSource = sourcePrice.source === status.eua.lastSource;
                          return (
                            <tr
                              key={sourcePrice.source}
                              className={isCurrentSource ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {isCurrentSource && <span className="font-bold">{sourcePrice.source}</span>}
                                {!isCurrentSource && sourcePrice.source}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {sourcePrice.lastPrice !== null && sourcePrice.lastPrice !== undefined
                                  ? `€${sourcePrice.lastPrice.toFixed(2)}`
                                  : t('neverUsed')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {sourcePrice.lastUpdate ? formatDate(sourcePrice.lastUpdate) : t('never')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {status.eua.dataSources.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* CEA Price Updates */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('ceaPrice')} {t('updates')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('pollingInterval')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatInterval(status.cea.pollingInterval)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('cacheDuration')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{status.cea.cacheDuration} {t('seconds')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('endpoint')}</p>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{status.cea.endpoint}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lastUpdate')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(status.cea.lastUpdate)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('method')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{status.cea.method}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                  <div className="flex items-center">
                    {status.cea.status === 'success' ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">{t('success')}</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                        <span className="text-sm text-red-600 dark:text-red-400">{t('error')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('libraries')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Backend: {status.cea.libraries.backend.join(', ')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Frontend: {status.cea.libraries.frontend.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Data Collector */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('historicalData')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('libraries')}</p>
                  <div className="flex flex-wrap gap-2">
                    {status.historical.libraries.map((lib, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {lib}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('method')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{status.historical.method}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('dataFiles')}</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {status.historical.dataFiles.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

