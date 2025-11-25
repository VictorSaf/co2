import { useState } from 'react';
import { format } from 'date-fns';
import { useCertificates } from '../context/CertificateContext';
import { useAuth } from '../context/AuthContext';
import { MarketOffer } from '../types';
import { useTranslation } from 'react-i18next';

export default function Market() {
  const { marketOffers, purchaseCertificate } = useCertificates();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'CER' | 'EUA'>('CER');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const cerOffers = marketOffers.filter(offer => offer.type === 'CER');
  const euaOffers = marketOffers.filter(offer => offer.type === 'EUA');
  
  const handleBuy = (offer: MarketOffer) => {
    setSelectedOffer(offer);
    setShowConfirmModal(true);
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
    setIsPurchasing(true);
    
    try {
      const success = await purchaseCertificate(selectedOffer);
      if (success) {
        setPurchaseStatus('success');
        setTimeout(() => {
          setShowConfirmModal(false);
          setPurchaseStatus('idle');
          setIsPurchasing(false);
          setSelectedOffer(null);
        }, 2000);
      } else {
        setPurchaseStatus('error');
        setErrorMessage(t('failedToPurchase'));
        setIsPurchasing(false);
      }
    } catch (error) {
      setPurchaseStatus('error');
      setErrorMessage(t('errorOccurred'));
      setIsPurchasing(false);
    }
  };
  
  const getRandomUpDownClass = () => {
    const random = Math.random();
    if (random > 0.6) return 'text-green-600';
    if (random < 0.4) return 'text-red-600';
    return 'text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('marketTitle')}</h1>
        
        {/* Market Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('CER')}
                className={`${
                  activeTab === 'CER'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
              >
                {t('chineseCertificates')}
              </button>
              <button
                onClick={() => setActiveTab('EUA')}
                className={`${
                  activeTab === 'EUA'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
              >
                {t('europeanCertificates')}
              </button>
            </nav>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      {t('seller')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {t('amount')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {t('price')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {t('totalValue')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {t('lastUpdated')}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">{t('actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(activeTab === 'CER' ? cerOffers : euaOffers).map((offer) => (
                    <tr key={offer.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {offer.sellerName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {offer.amount.toLocaleString()} {t('tonsUnit')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`font-medium ${getRandomUpDownClass()}`}>
                          €{offer.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        €{(offer.price * offer.amount).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(offer.timestamp), 'HH:mm:ss')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => handleBuy(offer)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {t('buy')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {(activeTab === 'CER' ? cerOffers.length === 0 : euaOffers.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-4 text-sm text-gray-500 text-center">
                        {t('noOffersAvailable')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('aboutCertificates', {0: activeTab})}</h3>
              {activeTab === 'CER' ? (
                <p className="text-sm text-gray-600">
                  {t('cerDescription')}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {t('euaDescription')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Market Tips */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('tradingTips')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('priceDifference')}</h3>
              <p className="text-sm text-gray-600">
                {t('priceDifferenceDesc')}
              </p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('conversionTime')}</h3>
              <p className="text-sm text-gray-600">
                {t('conversionTimeDesc')}
              </p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('verification')}</h3>
              <p className="text-sm text-gray-600">
                {t('verificationDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase confirmation modal */}
      {showConfirmModal && selectedOffer && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {purchaseStatus === 'idle' && (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirmPurchase')}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('aboutToPurchase')}
                  </p>
                  <ul className="text-sm text-gray-700 mb-4">
                    <li className="mb-1"><span className="font-medium">{t('type')}</span> {selectedOffer.type} {t('certificate')}</li>
                    <li className="mb-1"><span className="font-medium">{t('amountLabel')}</span> {selectedOffer.amount.toLocaleString()} {t('tonsUnit')}</li>
                    <li className="mb-1"><span className="font-medium">{t('priceLabel')}</span> €{selectedOffer.price.toFixed(2)} per {t('tonsUnit')}</li>
                    <li className="font-medium text-primary-700">{t('totalCostLabel')} €{(selectedOffer.price * selectedOffer.amount).toLocaleString()}</li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    {t('yourCurrentBalance')} <span className="font-medium text-green-600">€{user?.balance.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
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
                <p className="text-gray-700">{t('processingPurchase')}</p>
              </div>
            )}
            
            {purchaseStatus === 'success' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('purchaseSuccessful')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('purchaseSuccessDesc', {0: selectedOffer.amount.toLocaleString(), 1: selectedOffer.type})}
                </p>
                <p className="text-sm text-gray-500">
                  {t('certificatesAvailableInPortfolio')}
                </p>
              </div>
            )}
            
            {purchaseStatus === 'error' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('purchaseFailed')}</h3>
                <p className="text-gray-600 mb-4">
                  {errorMessage || t('errorOccurred')}
                </p>
                <div className="flex justify-end">
                  <button
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