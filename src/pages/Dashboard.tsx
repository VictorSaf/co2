import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { useCertificates } from '../context/CertificateContext';
import { useStats } from '../context/StatsContext';
import { useTranslation } from 'react-i18next';
import ActivityHistory from '../components/ActivityHistory';

Chart.register(...registerables);

export default function Dashboard() {
  const { portfolio, emissions } = useCertificates();
  const { marketStats, realTimeEUA } = useStats();
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
        
        // Format dates for the chart
        const labels = marketStats.priceHistory.map(entry => {
          const date = new Date(entry.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        // Create new chart
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: t('cerPriceEuro'),
                data: marketStats.priceHistory.map(entry => entry.priceCER),
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
              },
              {
                label: t('euaPriceEuro'),
                data: marketStats.priceHistory.map(entry => entry.priceEUA),
                borderColor: 'rgb(14, 159, 110)',
                backgroundColor: 'rgba(14, 159, 110, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false,
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
              },
              y: {
                beginAtZero: false,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
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
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                  },
                },
              },
              legend: {
                position: 'top',
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
  }, [marketStats.priceHistory]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('dashboard')}</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('portfolio')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('cerCertificates')}</p>
                <p className="text-2xl font-semibold text-primary-600">{portfolio.totalCER.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('euaCertificates')}</p>
                <p className="text-2xl font-semibold text-secondary-600">{portfolio.totalEUA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('converting')}</p>
                <p className="text-2xl font-semibold text-amber-500">{portfolio.convertingCER.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('valueEst')}</p>
                <p className="text-2xl font-semibold text-green-600">
                  €{((portfolio.totalCER * marketStats.averagePriceCER) + 
                     (portfolio.totalEUA * marketStats.averagePriceEUA)).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/portfolio" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                {t('viewPortfolio')} →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('marketPrices')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('cerPrice')}</p>
                <p className="text-2xl font-semibold text-primary-600">€{marketStats.averagePriceCER.toFixed(2)}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{t('euaPrice')}</p>
                  {realTimeEUA.price !== null && (
                    <span className="text-xs text-green-600 font-medium">
                      {t('live') || 'LIVE'}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-semibold text-secondary-600">
                  €{marketStats.averagePriceEUA.toFixed(2)}
                </p>
                {realTimeEUA.change24h !== null && realTimeEUA.change24h !== 0 && (
                  <p className={`text-xs mt-1 ${realTimeEUA.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {realTimeEUA.change24h > 0 ? '+' : ''}{realTimeEUA.change24h.toFixed(2)}% (24h)
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('24hCerVolume')}</p>
                <p className="text-2xl font-semibold text-gray-700">{marketStats.volumeCER.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('24hEuaVolume')}</p>
                <p className="text-2xl font-semibold text-gray-700">{marketStats.volumeEUA.toLocaleString()} {t('tonsUnit')}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/market" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                {t('goToMarket')} →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('emissions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('totalEmissions')}</p>
                <p className="text-2xl font-semibold text-gray-700">{emissions.total.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('surrendered')}</p>
                <p className="text-2xl font-semibold text-green-600">{emissions.surrendered.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('remaining')}</p>
                <p className="text-2xl font-semibold text-red-600">{emissions.remaining.toLocaleString()} {t('tonsUnit')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('compliance')}</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {((emissions.surrendered / emissions.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/emissions" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                {t('viewEmissions')} →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Price Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">{t('certificatePriceHistory')}</h2>
            <Link to="/market-analysis" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              {t('viewDetailedAnalysis')} →
            </Link>
          </div>
          <div className="h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/market" className="btn btn-primary">
              {t('buyCertificates')}
            </Link>
            <Link to="/portfolio" className="btn btn-secondary">
              {t('convertCerToEua')}
            </Link>
            <Link to="/emissions" className="btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500">
              {t('surrenderCertificates')}
            </Link>
            <Link to="/market-analysis" className="btn bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500">
              {t('marketAnalysis')}
            </Link>
          </div>
        </div>
        
        {/* Activity History */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <ActivityHistory />
        </div>
      </div>
    </div>
  );
}