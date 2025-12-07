import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStats } from '../context/StatsContext';
import { format, subMonths, subYears } from 'date-fns';
import { Chart, ChartOptions, LinearScale, CategoryScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

// Înregistrăm componentele Chart.js necesare
Chart.register(
  LinearScale,
  CategoryScale, 
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

// MACD (Moving Average Convergence Divergence) - kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateMACD = (_data: number[], _fastPeriod = 12, _slowPeriod = 26, _signalPeriod = 9) => {
  // Implementation kept for future use
  return { macdLine: [], signalLine: [], histogram: [] };
};

// RSI (Relative Strength Index)
const calculateRSI = (data: number[], period = 14) => {
  const rsi: number[] = [];
  const changes: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  // Initialize rsi array with nulls for the first period-1 elements
  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }
  
  for (let i = period; i < data.length; i++) {
    let gains = 0;
    let losses = 0;
    
    // Calculate average gains and losses over the period
    for (let j = i - period; j < i; j++) {
      if (changes[j] >= 0) {
        gains += changes[j];
      } else {
        losses += Math.abs(changes[j]);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
};

// Funcție pentru a calcula Bollinger Bands
const calculateBollingerBands = (data: number[], period = 20, multiplier = 2) => {
  const bands: { upper: number[], middle: number[], lower: number[] } = {
    upper: [],
    middle: [],
    lower: []
  };
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      bands.upper.push(NaN);
      bands.middle.push(NaN);
      bands.lower.push(NaN);
      continue;
    }
    
    // Calculate SMA for the period
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    const sma = sum / period;
    
    // Calculate standard deviation
    let squaredDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      squaredDiffSum += Math.pow(data[j] - sma, 2);
    }
    const stdDev = Math.sqrt(squaredDiffSum / period);
    
    bands.middle.push(sma);
    bands.upper.push(sma + (multiplier * stdDev));
    bands.lower.push(sma - (multiplier * stdDev));
  }
  
  return bands;
};

// Tipuri pentru proprietățile componentei
interface DataPoint {
  date: Date;
  priceCER: number;
  priceEUA: number;
}

export default function MarketAnalysis() {
  const { t } = useTranslation();
  const { marketStats, realTimeCER } = useStats();
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  const [indicatorType, setIndicatorType] = useState<'price' | 'volume' | 'spread' | 'volatility'>('price');
  const [selectedIndicators, setSelectedIndicators] = useState<{
    macd: boolean;
    rsi: boolean;
    bollingerBands: boolean;
  }>({
    macd: false,
    rsi: true,
    bollingerBands: true
  });

  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [priceVolatilityData, setPriceVolatilityData] = useState<number[]>([]);
  const [spreadData, setSpreadData] = useState<{dates: string[], spreads: number[]}>({dates: [], spreads: []});
  const [priceSpreadPercentage, setPriceSpreadPercentage] = useState<number>(0);
  const [showSpreadTooltip, setShowSpreadTooltip] = useState(false);
  
  // Use real historical data from marketStats
  useEffect(() => {
    const baseData = [...marketStats.priceHistory];
    
    // Determine date range based on timeframe
    const timeframeToDate = {
      '1M': subMonths(new Date(), 1),
      '3M': subMonths(new Date(), 3),
      '6M': subMonths(new Date(), 6),
      '1Y': subYears(new Date(), 1),
      'ALL': subYears(new Date(), 5) // Use 5 years for ALL timeframe
    };
    
    const startDate = timeframeToDate[timeframe];
    const endDate = new Date();
    
    // Filter historical data to the requested timeframe
    const filteredData = baseData
      .filter(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map(entry => ({
        date: entry.date instanceof Date ? entry.date : new Date(entry.date),
        priceCER: entry.priceCER,
        priceEUA: entry.priceEUA
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setHistoricalData(filteredData);
    
    // Calculate price spread
    if (filteredData.length > 0) {
      const latestData = filteredData[filteredData.length - 1];
      const spread = latestData.priceEUA - latestData.priceCER;
      const spreadPercentage = (spread / latestData.priceEUA) * 100;
      setPriceSpreadPercentage(parseFloat(spreadPercentage.toFixed(2)));
      
      // Calculate spread data for chart
      const dates = filteredData.map(d => format(d.date, 'dd MMM'));
      const spreads = filteredData.map(d => parseFloat((d.priceEUA - d.priceCER).toFixed(2)));
      setSpreadData({dates, spreads});
    }
    
    // Calculate price volatility (daily change percentage for EUA)
    const volatility: number[] = [];
    for (let i = 1; i < filteredData.length; i++) {
      const prevPrice = filteredData[i-1].priceEUA;
      const currentPrice = filteredData[i].priceEUA;
      const percentChange = ((currentPrice - prevPrice) / prevPrice) * 100;
      volatility.push(parseFloat(percentChange.toFixed(2)));
    }
    setPriceVolatilityData(volatility);
    
  }, [marketStats.priceHistory, timeframe]);
  
  // Calculate discount prices for each volume tier
  const getVolumeDiscountPrices = () => {
    const basePrice = marketStats.averagePriceEUA;
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
  
  // Preparare date pentru grafice
  const chartDataPrice = {
    labels: historicalData.map(d => format(d.date, 'dd MMM')),
    datasets: [
      {
        label: t('cerPriceEuro'),
        data: historicalData.map(d => d.priceCER),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 1,
        pointHoverRadius: 4,
      },
      {
        label: t('euaPriceEuro'),
        data: historicalData.map(d => d.priceEUA),
        borderColor: 'rgb(14, 159, 110)',
        backgroundColor: 'rgba(14, 159, 110, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 1,
        pointHoverRadius: 4,
      }
    ]
  };
  
  // Opțiuni pentru grafice
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        }
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
  };
  
  // Dacă Bollinger Bands este selectat, adaugă-le la grafic
  if (selectedIndicators.bollingerBands && indicatorType === 'price') {
    const euaPrices = historicalData.map(d => d.priceEUA);
    const bollingerBands = calculateBollingerBands(euaPrices);
    
    // Adaugă banda superioară
    chartDataPrice.datasets.push({
      label: t('bollingerUpper'),
      data: bollingerBands.upper,
      borderColor: 'rgba(255, 159, 64, 0.7)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.4,
      fill: false,
    });
    
    // Adaugă banda de mijloc (SMA)
    chartDataPrice.datasets.push({
      label: t('bollingerMiddle'),
      data: bollingerBands.middle,
      borderColor: 'rgba(255, 159, 64, 0.9)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.4,
      fill: false,
    });
    
    // Adaugă banda inferioară
    chartDataPrice.datasets.push({
      label: t('bollingerLower'),
      data: bollingerBands.lower,
      borderColor: 'rgba(255, 159, 64, 0.7)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.4,
      fill: false,
    });
  }
  
  // Date pentru graficul de spread
  const chartDataSpread = {
    labels: spreadData.dates,
    datasets: [
      {
        label: t('priceSpread'),
        data: spreadData.spreads,
        borderColor: 'rgb(154, 52, 235)',
        backgroundColor: 'rgba(154, 52, 235, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 1,
        pointHoverRadius: 4,
      }
    ]
  };
  
  // Date pentru RSI
  const chartDataRSI = {
    labels: historicalData.map(d => format(d.date, 'dd MMM')),
    datasets: [
      {
        label: 'RSI (EUA)',
        data: calculateRSI(historicalData.map(d => d.priceEUA)),
        borderColor: 'rgb(235, 170, 52)',
        backgroundColor: 'rgba(235, 170, 52, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      }
    ]
  };
  
  // Opțiuni pentru graficul RSI
  const chartOptionsRSI: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
          },
        },
      },
      annotation: {
        annotations: {
          overboughtLine: {
            type: 'line',
            yMin: 70,
            yMax: 70,
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: t('overbought'),
              position: 'end'
            }
          },
          oversoldLine: {
            type: 'line',
            yMin: 30,
            yMax: 30,
            borderColor: 'rgba(0, 255, 0, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: t('oversold'),
              position: 'end'
            }
          }
        }
      }
    },
  };
  
  // Date pentru Volatilitate
  const chartDataVolatility = {
    labels: historicalData.slice(1).map(d => format(d.date, 'dd MMM')),
    datasets: [
      {
        label: t('euaPriceVolatility'),
        data: priceVolatilityData,
        borderColor: 'rgb(52, 168, 235)',
        backgroundColor: (context: { raw?: number }) => {
          const value = context.raw || 0;
          return value >= 0 
            ? 'rgba(14, 159, 110, 0.3)' 
            : 'rgba(235, 87, 87, 0.3)';
        },
        borderWidth: 1,
        type: 'bar'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{t('marketAnalysis')}</h1>
          
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {/* Timeframe selectare */}
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium ${
                    timeframe === tf
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } border ${tf === '1M' ? 'rounded-l-md' : ''} ${tf === 'ALL' ? 'rounded-r-md' : ''}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Highlights / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">{t('currentEUAPrice')}</h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-secondary-600">
                €{marketStats.averagePriceEUA.toFixed(2)}
              </p>
              <p className="ml-2 text-sm text-green-600">
                +{((marketStats.averagePriceEUA / (historicalData.length > 30 ? historicalData[historicalData.length - 30].priceEUA : 60)) * 100 - 100).toFixed(1)}%
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{t('vs30DaysAgo')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">{t('currentCERPrice')}</h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-primary-600">
                €{(realTimeCER.price ?? marketStats.averagePriceCER).toFixed(2)}
              </p>
              <p className="ml-2 text-sm text-green-600">
                +{(((realTimeCER.price ?? marketStats.averagePriceCER) / (historicalData.length > 30 ? historicalData[historicalData.length - 30].priceCER : 40)) * 100 - 100).toFixed(1)}%
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{t('vs30DaysAgo')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">{t('currentPriceSpread')}</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-purple-600">
                €{(marketStats.averagePriceEUA - (realTimeCER.price ?? marketStats.averagePriceCER)).toFixed(2)}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1 relative">
              <p className="text-sm text-gray-500">{priceSpreadPercentage}% {t('spreadPercentage')}</p>
              <div 
                className="relative"
                onMouseEnter={() => setShowSpreadTooltip(true)}
                onMouseLeave={() => setShowSpreadTooltip(false)}
              >
                <InformationCircleIcon className="h-4 w-4 text-gray-500 cursor-help" />
                {showSpreadTooltip && (
                  <div className="absolute left-0 bottom-full mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50">
                    <p className="mb-2 text-gray-300">{t('minVolumeTrade') || 'Min. volume trade 10 Mio EUR.'}</p>
                    <ul className="space-y-1.5">
                      {getVolumeDiscountPrices().map((tier, index) => (
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
                    <div className="absolute top-full left-4 -mt-1">
                      <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">{t('marketStatus')}</h3>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-amber-600">
                {priceSpreadPercentage > 25 ? t('arbitrageOpportunity') : t('stableMarket')}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {priceSpreadPercentage > 25 
                ? t('favorableForCERConversion') 
                : t('normalTradingConditions')}
            </p>
          </div>
        </div>
        
        {/* Tab Selector pentru indicatori */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setIndicatorType('price')}
                className={`${
                  indicatorType === 'price'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('priceChart')}
              </button>
              <button
                onClick={() => setIndicatorType('spread')}
                className={`${
                  indicatorType === 'spread'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('spreadAnalysis')}
              </button>
              <button
                onClick={() => setIndicatorType('volatility')}
                className={`${
                  indicatorType === 'volatility'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('volatilityAnalysis')}
              </button>
              {selectedIndicators.rsi && (
                <button
                  onClick={() => setIndicatorType('volume')}
                  className={`${
                    indicatorType === 'volume'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  RSI
                </button>
              )}
            </nav>
          </div>
        </div>
        
        {/* Main Chart Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {indicatorType === 'price' && t('priceEvolution')}
                {indicatorType === 'spread' && t('priceSpreadEvolution')}
                {indicatorType === 'volatility' && t('priceVolatilityAnalysis')}
                {indicatorType === 'volume' && t('technicalIndicators')}
              </h2>
              
              {/* Technical Indicators Selector */}
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={selectedIndicators.bollingerBands}
                    onChange={() => setSelectedIndicators({
                      ...selectedIndicators,
                      bollingerBands: !selectedIndicators.bollingerBands
                    })}
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('bollingerBands')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={selectedIndicators.rsi}
                    onChange={() => setSelectedIndicators({
                      ...selectedIndicators,
                      rsi: !selectedIndicators.rsi
                    })}
                  />
                  <span className="ml-2 text-sm text-gray-700">RSI</span>
                </label>
              </div>
            </div>
            
            <div className="h-96">
              {indicatorType === 'price' && (
                <Line data={chartDataPrice} options={chartOptions} />
              )}
              {indicatorType === 'spread' && (
                <Line data={chartDataSpread} options={chartOptions} />
              )}
              {indicatorType === 'volatility' && (
                <Bar 
                  data={chartDataVolatility}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales?.y,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              )}
              {indicatorType === 'volume' && selectedIndicators.rsi && (
                <Line data={chartDataRSI} options={chartOptionsRSI} />
              )}
            </div>
          </div>
        </div>
        
        {/* Market Insights Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('marketInsights')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('euaMarketTrend')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {historicalData.length > 30 && historicalData[historicalData.length - 1].priceEUA > historicalData[historicalData.length - 30].priceEUA
                  ? t('bullishTrendEUA')
                  : t('bearishTrendEUA')}
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{t('30DayChange')}: {historicalData.length > 30 
                  ? ((historicalData[historicalData.length - 1].priceEUA / historicalData[historicalData.length - 30].priceEUA - 1) * 100).toFixed(2)
                  : "0.00"}%</span>
                <span>{t('volatility')}: {priceVolatilityData.length > 0 
                  ? Math.abs(priceVolatilityData.reduce((sum, val) => sum + val, 0) / priceVolatilityData.length).toFixed(2)
                  : "0.00"}%</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('cerMarketTrend')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {historicalData.length > 30 && historicalData[historicalData.length - 1].priceCER > historicalData[historicalData.length - 30].priceCER
                  ? t('bullishTrendCER')
                  : t('bearishTrendCER')}
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{t('30DayChange')}: {historicalData.length > 30 
                  ? ((historicalData[historicalData.length - 1].priceCER / historicalData[historicalData.length - 30].priceCER - 1) * 100).toFixed(2)
                  : "0.00"}%</span>
                <span>{t('conversionProfitability')}: {priceSpreadPercentage > 20 ? t('high') : priceSpreadPercentage > 10 ? t('medium') : t('low')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Forecast & Recommendation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('forecastRecommendation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-r pr-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('shortTermForecast')}</h3>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priceVolatilityData.slice(-7).reduce((sum, val) => sum + val, 0) > 0 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <p className="text-sm font-medium">
                  {priceVolatilityData.slice(-7).reduce((sum, val) => sum + val, 0) > 0 
                    ? t('bullish') 
                    : t('bearish')}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {priceVolatilityData.slice(-7).reduce((sum, val) => sum + val, 0) > 0 
                  ? t('shortTermBullishForecast') 
                  : t('shortTermBearishForecast')}
              </p>
            </div>
            
            <div className="border-r px-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('spreadOpportunity')}</h3>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priceSpreadPercentage > 20 
                    ? 'bg-green-500' 
                    : priceSpreadPercentage > 10 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}></div>
                <p className="text-sm font-medium">
                  {priceSpreadPercentage > 20 
                    ? t('excellent') 
                    : priceSpreadPercentage > 10 
                    ? t('good') 
                    : t('poor')}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {priceSpreadPercentage > 20 
                  ? t('excellentArbitrageOpportunity') 
                  : priceSpreadPercentage > 10 
                  ? t('decentArbitrageOpportunity') 
                  : t('minimumArbitrageOpportunity')}
              </p>
            </div>
            
            <div className="pl-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('tradingRecommendation')}</h3>
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full mr-2 bg-primary-500"></div>
                <p className="text-sm font-medium">
                  {priceSpreadPercentage > 20 
                    ? t('convertCERtoEUA') 
                    : (historicalData.length > 0 && priceVolatilityData.slice(-7).reduce((sum, val) => sum + val, 0) > 0)
                    ? t('buyAndHold')
                    : t('waitAndMonitor')}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {priceSpreadPercentage > 20 
                  ? t('convertCERRecommendation') 
                  : (historicalData.length > 0 && priceVolatilityData.slice(-7).reduce((sum, val) => sum + val, 0) > 0)
                  ? t('buyAndHoldRecommendation')
                  : t('waitAndMonitorRecommendation')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}