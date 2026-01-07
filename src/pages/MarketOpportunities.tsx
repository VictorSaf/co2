/**
 * Market Opportunities Page
 * Displays detected arbitrage and swap opportunities
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../design-system';
import { getMarketOpportunities, type MarketOpportunity } from '../services/marketOpportunitiesService';
import { useStats } from '../context/StatsContext';

export default function MarketOpportunities() {
  const { t } = useTranslation();
  const { realTimeEUA, realTimeCEA } = useStats();
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'arbitrage' | 'swap_optimization' | 'liquidity_crisis'>('all');

  useEffect(() => {
    loadOpportunities();
  }, [realTimeEUA.price, realTimeCEA.price]);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const opps = await getMarketOpportunities({
        euaPrice: realTimeEUA.price || undefined,
        ceaPrice: realTimeCEA.price || undefined,
      });
      
      setOpportunities(opps);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOpportunities = filter === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.type === filter);

  const getOpportunityColor = (type: string) => {
    switch (type) {
      case 'arbitrage':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'swap_optimization':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'liquidity_crisis':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('marketOpportunities') || 'Market Opportunities'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('marketOpportunitiesSubtitle') || 'Discover arbitrage and swap opportunities'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'arbitrage', 'swap_optimization', 'liquidity_crisis'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`) || filterType}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        </Card>
      )}

      {/* Opportunities List */}
      {!isLoading && !error && (
        <>
          {filteredOpportunities.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('noOpportunities') || 'No opportunities found at this time'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpportunities.map((opp, index) => (
                <Card key={index} className={getOpportunityColor(opp.type)}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                      {opp.type}
                    </span>
                    {opp.expiresAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(opp.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {opp.description}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {opp.potentialSavings}
                  </p>
                  {opp.swapRatio && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>{t('swapRatio') || 'Swap Ratio'}:</strong> 1:{opp.swapRatio.toFixed(2)}
                    </div>
                  )}
                  <div className="mt-4 p-2 bg-white dark:bg-gray-800 rounded text-sm font-medium text-gray-900 dark:text-white">
                    {opp.action}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

