import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { subMonths } from 'date-fns';
import { useCertificates } from '../context/CertificateContext';
import { useStats } from '../context/StatsContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import ActivityHistory from '../components/ActivityHistory';
import { getChartThemeColors } from '../utils/chartTheme';
import { Card } from '../design-system';

Chart.register(...registerables);

export default function Dashboard() {
  const { portfolio, emissions } = useCertificates();
  const { marketStats, realTimeEUA } = useStats();
  const { theme } = useTheme();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        // Ensure priceHistory exists and is an array
        if (!marketStats.priceHistory || !Array.isArray(marketStats.priceHistory) || marketStats.priceHistory.length === 0) {
          console.warn('Price history is not available, skipping chart initialization');
          return;
        }
        
        // Filter price history to last 3 months
        const threeMonthsAgo = subMonths(new Date(), 3);
        const filteredHistory = marketStats.priceHistory.filter(entry => {
          if (!entry || !entry.date) return false;
          try {
            const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
            return entryDate >= threeMonthsAgo;
          } catch (error) {
            console.warn('Invalid date in price history entry:', entry);
            return false;
          }
        });
        
        // Ensure we have data to display
        if (filteredHistory.length === 0) {
          console.warn('No price history data available for chart');
          return;
        }
        
        // Format dates for the chart
        const labels = filteredHistory.map(entry => {
          try {
            const date = entry.date instanceof Date ? entry.date : new Date(entry.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          } catch (error) {
            console.warn('Error formatting date:', entry);
            return '';
          }
        }).filter(label => label !== '');
        
        // Get theme colors
        const themeColors = getChartThemeColors(theme);
        
        // Ensure we have valid data points
        if (labels.length === 0 || filteredHistory.length === 0) {
          console.warn('Insufficient data for chart');
          return;
        }
        
        // Extract price data with validation
        const ceaData = filteredHistory.map(entry => {
          const price = entry?.priceCEA;
          return typeof price === 'number' && !isNaN(price) ? price : null;
        });
        const euaData = filteredHistory.map(entry => {
          const price = entry?.priceEUA;
          return typeof price === 'number' && !isNaN(price) ? price : null;
        });
        
        // Create new chart
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: t('ceaPriceEuro'),
                data: ceaData,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                spanGaps: true, // Allow gaps in data
              },
              {
                label: t('euaPriceEuro'),
                data: euaData,
                borderColor: 'rgb(14, 159, 110)',
                backgroundColor: 'rgba(14, 159, 110, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                spanGaps: true, // Allow gaps in data
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: themeColors.textColor,
                },
              },
              y: {
                beginAtZero: false,
                grid: {
                  color: themeColors.gridColor,
                },
                ticks: {
                  color: themeColors.textColor,
                  callback: function(value) {
                    return '€' + value;
                  },
                },
              },
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              tooltip: {
                backgroundColor: themeColors.tooltipBg,
                titleColor: themeColors.tooltipText,
                bodyColor: themeColors.tooltipText,
                borderColor: themeColors.tooltipBorder,
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    const value = context.parsed.y;
                    return context.dataset.label + ': €' + (value !== null ? value.toFixed(2) : '0.00');
                  },
                },
              },
              legend: {
                position: 'top',
                labels: {
                  color: themeColors.textColor,
                },
              },
            },
          },
        });
      }
    }
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketStats.priceHistory, theme]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard')}</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('portfolio')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('ceaCertificates')}</p>
                <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{portfolio.totalCEA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('euaCertificates')}</p>
                <p className="text-2xl font-semibold text-secondary-600 dark:text-secondary-400">{portfolio.totalEUA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('converting')}</p>
                <p className="text-2xl font-semibold text-amber-500 dark:text-amber-400">{portfolio.convertingCEA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('valueEst')}</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  €{((portfolio.totalCEA * (marketStats.averagePriceCEA || 0)) + 
                     (portfolio.totalEUA * (marketStats.averagePriceEUA || 0))).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/portfolio" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                {t('viewPortfolio')} →
              </Link>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('marketPrices')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('ceaPrice')}</p>
                <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  €{(marketStats.averagePriceCEA || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('euaPrice')}</p>
                  {realTimeEUA.price !== null && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {t('live') || 'LIVE'}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-semibold text-secondary-600 dark:text-secondary-400">
                  €{(marketStats.averagePriceEUA || 0).toFixed(2)}
                </p>
                {realTimeEUA.change24h !== null && realTimeEUA.change24h !== 0 && (
                  <p className={`text-xs mt-1 ${realTimeEUA.change24h > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {realTimeEUA.change24h > 0 ? '+' : ''}{realTimeEUA.change24h.toFixed(2)}% (24h)
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('24hCeaVolume')}</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{marketStats.volumeCEA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('24hEuaVolume')}</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{marketStats.volumeEUA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/market" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                {t('goToMarket')} →
              </Link>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('emissions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalEmissions')}</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{emissions.total.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('surrendered')}</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{emissions.surrendered.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('remaining')}</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{emissions.remaining.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('compliance')}</p>
                <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                  {emissions.total > 0 
                    ? ((emissions.surrendered / emissions.total) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/emissions" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                {t('viewEmissions')} →
              </Link>
            </div>
          </Card>
        </div>
        
        {/* Price Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('certificatePriceHistory')}</h2>
            <Link to="/market-analysis" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
              {t('viewDetailedAnalysis')} →
            </Link>
          </div>
          <div className="h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/market" className="btn btn-primary w-full">
              {t('buyCertificates')}
            </Link>
            <Link to="/portfolio" className="btn btn-secondary w-full">
              {t('convertCeaToEua')}
            </Link>
            <Link to="/emissions" className="btn btn-success w-full">
              {t('surrenderCertificates')}
            </Link>
            <Link to="/market-analysis" className="btn btn-info w-full">
              {t('marketAnalysis')}
            </Link>
          </div>
        </div>
        
        {/* Activity History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mt-8">
          <ActivityHistory />
        </div>
      </div>
    </div>
  );
}