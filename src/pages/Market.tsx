import { useState } from 'react';
import { format } from 'date-fns';
import { useCertificates } from '../context/CertificateContext';
import { useAuth } from '../context/AuthContext';
import { MarketOffer } from '../types';
import { useTranslation } from 'react-i18next';
import LivePriceTicker from '../components/LivePriceTicker';

export default function Market() {
  const { marketOffers, purchaseCertificate } = useCertificates();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Sort offers by price (lowest first) to ensure best price is shown first
  const ceaOffers = marketOffers.filter(offer => offer.type === 'CEA').sort((a, b) => a.price - b.price);
  
  const handleBuy = (offer: MarketOffer) => {
    try {
      setSelectedOffer(offer);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error opening purchase modal:', error);
    }
  };
  
  const handleConfirmPurchase = async () => {
    if (!selectedOffer || !user) return;
    
    // Check if user has enough balance
    const totalCost = selectedOffer.price * selectedOffer.amount;
    if (totalCost > user.balance) {
      setErrorMessage(t('insufficientBalanceMessage', {0: totalCost.toLocaleString(), 1: user.balance.toLocaleString()}));
      setPurchaseStatus('error');
      return;
    }
    
    setPurchaseStatus('loading');
    
    try {
      const success = await purchaseCertificate(selectedOffer);
      if (success) {
        setPurchaseStatus('success');
        setTimeout(() => {
          setShowConfirmModal(false);
          setPurchaseStatus('idle');
          setSelectedOffer(null);
        }, 2000);
      } else {
        setPurchaseStatus('error');
        setErrorMessage(t('failedToPurchase'));
      }
    } catch {
      setPurchaseStatus('error');
      setErrorMessage(t('errorOccurred'));
    }
  };
  
  const getRandomUpDownClass = () => {
    const random = Math.random();
    if (random > 0.6) return 'text-green-600 dark:text-green-400';
    if (random < 0.4) return 'text-red-600 dark:text-red-400';
    return 'text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('marketTitle')}</h1>
        
        {/* Live Price Ticker */}
        <div className="mb-6">
          <LivePriceTicker />
        </div>
        
        {/* Market Offers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 mb-8">
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-0">
                      {t('seller')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('amount')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('price')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('totalValue')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('lastUpdated')}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">{t('actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ceaOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-0">
                        {offer.sellerName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {offer.amount.toLocaleString()} {t('tonsUnit')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`font-medium ${getRandomUpDownClass()} dark:text-gray-300`}>
                          €{offer.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        €{(offer.price * offer.amount).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(offer.timestamp), 'HH:mm:ss')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          type="button"
                          onClick={() => handleBuy(offer)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 font-medium"
                        >
                          {t('buy')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {ceaOffers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {t('noOffersAvailable')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('aboutCertificates', {0: 'CEA'})}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('ceaDescription')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Market Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('tradingTips')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">{t('priceDifference')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('priceDifferenceDesc')}
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">{t('conversionTime')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('conversionTimeDesc')}
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">{t('verification')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('verificationDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase confirmation modal */}
      {showConfirmModal && selectedOffer && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            {purchaseStatus === 'idle' && (
              <>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('confirmPurchase')}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('aboutToPurchase')}
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <li className="mb-1"><span className="font-medium">{t('type')}</span> {selectedOffer.type} {t('certificate')}</li>
                    <li className="mb-1"><span className="font-medium">{t('amountLabel')}</span> {selectedOffer.amount.toLocaleString()} {t('tonsUnit')}</li>
                    <li className="mb-1"><span className="font-medium">{t('priceLabel')}</span> €{selectedOffer.price.toFixed(2)} per {t('tonsUnit')}</li>
                    <li className="font-medium text-primary-700 dark:text-primary-400">{t('totalCostLabel')} €{(selectedOffer.price * selectedOffer.amount).toLocaleString()}</li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('yourCurrentBalance')} <span className="font-medium text-green-600 dark:text-green-400">€{user?.balance.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {t('confirmPurchase')}
                  </button>
                </div>
              </>
            )}
            
            {purchaseStatus === 'loading' && (
              <div className="text-center py-4">
                <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700 dark:text-gray-300">{t('processingPurchase')}</p>
              </div>
            )}
            
            {purchaseStatus === 'success' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('purchaseSuccessful')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('purchaseSuccessDesc', {0: selectedOffer.amount.toLocaleString(), 1: selectedOffer.type})}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('certificatesAvailableInPortfolio')}
                </p>
              </div>
            )}
            
            {purchaseStatus === 'error' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('purchaseFailed')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {errorMessage || t('errorOccurred')}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseStatus('idle');
                      setErrorMessage('');
                    }}
                    className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}