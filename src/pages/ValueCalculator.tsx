/**
 * Value Calculator Page
 * Allows users to calculate benefits for CEA sellers or swap buyers
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../design-system';
import {
  calculateSellerScenario,
  calculateBuyerSwapScenario,
  saveScenario,
  type SellerScenarioRequest,
  type BuyerSwapScenarioRequest,
} from '../services/valueCalculatorService';
import { useStats } from '../context/StatsContext';

type CalculatorMode = 'seller' | 'buyer';

export default function ValueCalculator() {
  const { t } = useTranslation();
  const { realTimeEUA, realTimeCEA } = useStats();
  const [mode, setMode] = useState<CalculatorMode>('seller');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Seller form state
  const [sellerForm, setSellerForm] = useState<SellerScenarioRequest>({
    volume: 1000000,
    currentPrice: realTimeCEA.price || 8.0,
    urgency: 'normal',
    confidentiality: false,
  });

  // Buyer form state
  const [buyerForm, setBuyerForm] = useState<BuyerSwapScenarioRequest>({
    euaVolume: 100000,
    euaPrice: realTimeEUA.price || 88.0,
    ceaPrice: realTimeCEA.price || 8.0,
    useCase: 'compliance',
    hasChinaOperations: false,
  });

  const handleSellerCalculate = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      const result = await calculateSellerScenario(sellerForm);
      setResults({ type: 'seller', data: result });
      
      // Auto-save scenario
      try {
        await saveScenario('seller_cea', sellerForm, result);
      } catch (saveErr) {
        console.warn('Failed to save scenario:', saveErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate scenario');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBuyerCalculate = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      const result = await calculateBuyerSwapScenario(buyerForm);
      setResults({ type: 'buyer', data: result });
      
      // Auto-save scenario
      try {
        await saveScenario('buyer_swap', buyerForm, result);
      } catch (saveErr) {
        console.warn('Failed to save scenario:', saveErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate scenario');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('valueCalculator') || 'Value Calculator'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('valueCalculatorSubtitle') || 'Calculate benefits of using Nihao vs alternatives'}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setMode('seller');
            setResults(null);
            setError(null);
          }}
          className={`px-4 py-2 font-medium ${
            mode === 'seller'
              ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {t('sellerCEA') || 'CEA Seller'}
        </button>
        <button
          onClick={() => {
            setMode('buyer');
            setResults(null);
            setError(null);
          }}
          className={`px-4 py-2 font-medium ${
            mode === 'buyer'
              ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {t('buyerSwap') || 'Swap Buyer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {mode === 'seller' ? (t('sellerInputs') || 'Seller Inputs') : (t('buyerInputs') || 'Buyer Inputs')}
          </h2>

          {mode === 'seller' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('volume') || 'Volume'} (tons)
                </label>
                <input
                  type="number"
                  value={sellerForm.volume}
                  onChange={(e) => setSellerForm({ ...sellerForm, volume: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('currentPrice') || 'Current Price'} (EUR/ton)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sellerForm.currentPrice}
                  onChange={(e) => setSellerForm({ ...sellerForm, currentPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('urgency') || 'Urgency'}
                </label>
                <select
                  value={sellerForm.urgency}
                  onChange={(e) => setSellerForm({ ...sellerForm, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="normal">{t('normal') || 'Normal'}</option>
                  <option value="urgent">{t('urgent') || 'Urgent'}</option>
                  <option value="panic">{t('panic') || 'Panic'}</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confidentiality"
                  checked={sellerForm.confidentiality}
                  onChange={(e) => setSellerForm({ ...sellerForm, confidentiality: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="confidentiality" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('confidentiality') || 'Confidentiality Required'}
                </label>
              </div>
              <button
                onClick={handleSellerCalculate}
                disabled={isCalculating}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isCalculating ? (t('calculating') || 'Calculating...') : (t('calculate') || 'Calculate')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('euaVolume') || 'EUA Volume'} (tons)
                </label>
                <input
                  type="number"
                  value={buyerForm.euaVolume}
                  onChange={(e) => setBuyerForm({ ...buyerForm, euaVolume: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('euaPrice') || 'EUA Price'} (EUR/ton)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyerForm.euaPrice}
                  onChange={(e) => setBuyerForm({ ...buyerForm, euaPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('useCase') || 'Use Case'}
                </label>
                <select
                  value={buyerForm.useCase}
                  onChange={(e) => setBuyerForm({ ...buyerForm, useCase: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="compliance">{t('compliance') || 'Compliance'}</option>
                  <option value="cbam">{t('cbam') || 'CBAM Optimization'}</option>
                  <option value="investment">{t('investment') || 'Investment'}</option>
                  <option value="divestment">{t('divestment') || 'Divestment'}</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasChinaOps"
                  checked={buyerForm.hasChinaOperations}
                  onChange={(e) => setBuyerForm({ ...buyerForm, hasChinaOperations: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="hasChinaOps" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('hasChinaOperations') || 'Has China Operations'}
                </label>
              </div>
              <button
                onClick={handleBuyerCalculate}
                disabled={isCalculating}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isCalculating ? (t('calculating') || 'Calculating...') : (t('calculate') || 'Calculate')}
              </button>
            </div>
          )}
        </Card>

        {/* Results */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('results') || 'Results'}
          </h2>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {results.type === 'seller' && results.data && (
                <>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      €{results.data.totalSavings?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('totalSavings') || 'Total Savings'} ({results.data.savingsPercentage?.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('nihaoPrice') || 'Nihao Price'}:</span>
                      <span className="font-medium">€{results.data.nihaoOffer?.price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('shanghaiPrice') || 'Shanghai Price'}:</span>
                      <span className="font-medium">€{results.data.shanghaiAlternative?.price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('executionTime') || 'Execution Time'}:</span>
                      <span className="font-medium">{results.data.nihaoOffer?.executionTime}</span>
                    </div>
                  </div>
                </>
              )}

              {results.type === 'buyer' && results.data && (
                <>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      €{results.data.totalSavings?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('totalSavings') || 'Total Savings'} ({results.data.savingsPercentage?.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('wfoeSavings') || 'WFOE Savings'}:</span>
                      <span className="font-medium">€{results.data.benefits?.wfoeSavings?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('nihaoFee') || 'Nihao Fee'}:</span>
                      <span className="font-medium">€{results.data.nihaoSwap?.fee?.toLocaleString()}</span>
                    </div>
                    {results.data.benefits?.cbamOptimization && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('cbamOptimization') || 'CBAM Optimization'}:</span>
                        <span className="font-medium">€{results.data.benefits.cbamOptimization.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {!results && !error && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {t('enterValuesAndCalculate') || 'Enter values and click Calculate to see results'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

