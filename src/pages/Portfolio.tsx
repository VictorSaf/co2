import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useCertificates } from '../context/CertificateContext';
import { Certificate } from '../types';
import { useTranslation } from 'react-i18next';

export default function Portfolio() {
  const { portfolio, convertCertificate, verifyCertificate } = useCertificates();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'CEA' | 'EUA' | 'Converting'>('CEA');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'convert' | 'verify'>('convert');
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progressTimers, setProgressTimers] = useState<Record<string, number>>({});
  
  const handleConvert = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setActionType('convert');
    setActionStatus('idle');
    setShowActionModal(true);
  };
  
  const handleVerify = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setActionType('verify');
    setActionStatus('idle');
    setShowActionModal(true);
  };
  
  const handleConfirmAction = async () => {
    if (!selectedCertificate) return;
    
    setActionStatus('loading');
    
    try {
      let success = false;
      
      if (actionType === 'convert') {
        success = await convertCertificate(selectedCertificate);
      } else if (actionType === 'verify') {
        success = await verifyCertificate(selectedCertificate);
      }
      
      if (success) {
        setActionStatus('success');
        setTimeout(() => {
          setShowActionModal(false);
          setActionStatus('idle');
          setSelectedCertificate(null);
        }, 2000);
      } else {
        setActionStatus('error');
      }
    } catch {
      setActionStatus('error');
    }
  };
  

  // Update progress timers for converting certificates
  useEffect(() => {
    const convertingCertificates = portfolio.certificates.filter(cert => cert.status === 'Converting');
    
    if (convertingCertificates.length > 0) {
      const interval = setInterval(() => {
        setProgressTimers(() => {
          const newTimers: Record<string, number> = {};
          
          convertingCertificates.forEach(cert => {
            if (!cert.conversionStartedAt) return;
            
            const startTime = new Date(cert.conversionStartedAt).getTime();
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            const totalSeconds = 5 * 60; // 5 minutes in seconds
            
            // Calculate progress percentage (0-100)
            const progress = Math.min(100, Math.floor((elapsedSeconds / totalSeconds) * 100));
            
            // Stocăm doar procentul în timer - timpul rămas îl vom calcula la afișare
            newTimers[cert.id] = progress;
          });
          
          return newTimers;
        });
      }, 1000); // Actualizăm la fiecare secundă pentru afișare în timp real
      
      return () => clearInterval(interval);
    }
  }, [portfolio.certificates]);
  
  // Funcție pentru calculul timpului rămas în minute și secunde
  const getTimeRemaining = (certificateId: string, conversionStartedAt?: Date): { minutes: number; seconds: number } => {
    if (!conversionStartedAt) {
      return { minutes: 5, seconds: 0 };
    }
    
    const startTime = new Date(conversionStartedAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const totalSeconds = 5 * 60; // 5 minutes in seconds
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    return { minutes, seconds };
  };
  
  const renderCertificatesList = () => {
    let filteredCertificates: Certificate[] = [];
    
    if (activeTab === 'CEA') {
      filteredCertificates = portfolio.certificates.filter(cert => cert.type === 'CEA' && cert.status === 'Available');
    } else if (activeTab === 'EUA') {
      filteredCertificates = portfolio.certificates.filter(cert => cert.type === 'EUA' && (cert.status === 'Available' || cert.status === 'Verified'));
    } else if (activeTab === 'Converting') {
      filteredCertificates = portfolio.certificates.filter(cert => cert.status === 'Converting');
    }
    
    if (filteredCertificates.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noCertificatesInPortfolio', {0: activeTab === 'Converting' ? t('converting').toLowerCase() : activeTab})}</p>
          {activeTab === 'CEA' && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('visitMarket')}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('certificateID')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('amount')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('purchasePrice')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('purchaseDate')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('status')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCertificates.map((certificate) => (
              <tr key={certificate.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {certificate.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {certificate.amount.toLocaleString()} {t('tonsUnit')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  €{certificate.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {certificate.purchasedAt ? format(new Date(certificate.purchasedAt), 'yyyy-MM-dd HH:mm') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {certificate.status === 'Available' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {t('available')}
                    </span>
                  )}
                  {certificate.status === 'Converting' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          {t('converting')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {(() => {
                            const { minutes, seconds } = getTimeRemaining(certificate.id, certificate.conversionStartedAt);
                            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full transition-all duration-1000 relative" 
                          style={{ width: `${progressTimers[certificate.id] || 0}%` }}
                        >
                          <div className="absolute inset-0 overflow-hidden">
                            <span 
                              className="absolute inset-0 -translate-x-1/2 bg-white bg-opacity-20 transform -skew-x-12 animate-shimmer"
                              style={{ 
                                animation: 'shimmer 1.5s infinite',
                                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
                              }}
                            ></span>
                          </div>
                        </div>
                      </div>
                      <style>{`
                        @keyframes shimmer {
                          0% { transform: translateX(-100%) skewX(-12deg); }
                          100% { transform: translateX(200%) skewX(-12deg); }
                        }
                      `}</style>
                    </div>
                  )}
                  {certificate.status === 'Verified' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {t('verified')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {certificate.type === 'CEA' && certificate.status === 'Available' && (
                    <button
                      onClick={() => handleConvert(certificate)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      {t('convertToEUA')}
                    </button>
                  )}
                  {certificate.type === 'EUA' && certificate.status === 'Available' && (
                    <button
                      onClick={() => handleVerify(certificate)}
                      className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-300"
                    >
                      {t('verify')}
                    </button>
                  )}
                  {certificate.status === 'Converting' && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {t('processingConversion')}
                    </span>
                  )}
                  {certificate.status === 'Verified' && (
                    <Link
                      to="/emissions"
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                    >
                      {t('surrender')}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('portfolioTitle')}</h1>
          
          <div className="mt-3 sm:mt-0 bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-md">
            <div className="flex">
              <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                <span className="block text-xs text-gray-500 dark:text-gray-400">{t('cerCertificates')}</span>
                <span className="text-lg font-medium text-primary-700 dark:text-primary-400">{portfolio.totalCEA.toLocaleString()} {t('tonsUnit')}</span>
              </div>
              <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                <span className="block text-xs text-gray-500 dark:text-gray-400">{t('euaCertificates')}</span>
                <span className="text-lg font-medium text-secondary-700 dark:text-secondary-400">{portfolio.totalEUA.toLocaleString()} {t('tonsUnit')}</span>
              </div>
              <div className="p-3">
                <span className="block text-xs text-gray-500 dark:text-gray-400">{t('converting')}</span>
                <span className="text-lg font-medium text-amber-600 dark:text-amber-400">{portfolio.convertingCEA.toLocaleString()} {t('tonsUnit')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Portfolio Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('CEA')}
                className={`${
                  activeTab === 'CEA'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('cerCertificatesTab')}
              </button>
              <button
                onClick={() => setActiveTab('EUA')}
                className={`${
                  activeTab === 'EUA'
                    ? 'border-secondary-500 text-secondary-600 dark:text-secondary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('euaCertificatesTab')}
              </button>
              <button
                onClick={() => setActiveTab('Converting')}
                className={`${
                  activeTab === 'Converting'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                {t('convertingTab')} ({portfolio.certificates.filter(cert => cert.status === 'Converting').length})
              </button>
            </nav>
          </div>
          
          <div className="p-4 sm:p-6">
            {renderCertificatesList()}
          </div>
        </div>
        
        {/* Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('aboutCertificatesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-primary-800 dark:text-primary-400 mb-2">{t('chineseCertificatesTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('cerPortfolioDesc')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('conversionProcessTitle')}</h4>
                <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal pl-4 space-y-1">
                  <li>{t('conversionStep1')}</li>
                  <li>{t('conversionStep2')}</li>
                  <li>{t('conversionStep3')}</li>
                  <li>{t('conversionStep4')}</li>
                  <li>{t('conversionStep5')}</li>
                </ol>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-secondary-800 dark:text-secondary-400 mb-2">{t('europeanCertificatesTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('euaPortfolioDesc')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('verificationProcessTitle')}</h4>
                <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal pl-4 space-y-1">
                  <li>{t('verificationStep1')}</li>
                  <li>{t('verificationStep2')}</li>
                  <li>{t('verificationStep3')}</li>
                  <li>{t('verificationStep4')}</li>
                  <li>{t('verificationStep5')}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action modal */}
      {showActionModal && selectedCertificate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            {actionStatus === 'idle' && (
              <>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {actionType === 'convert' ? t('convertCERtoEUA') : t('verifyEUACertificate')}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {actionType === 'convert' 
                      ? t('convertDialogDesc')
                      : t('verifyDialogDesc')}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{t('certificateDetailsLabel')}</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                      <li className="mb-1">ID: {selectedCertificate.id.substring(0, 8)}...</li>
                      <li className="mb-1">{t('amountLabel')} {selectedCertificate.amount.toLocaleString()} {t('tonsUnit')}</li>
                      <li>{t('type')} {selectedCertificate.type}</li>
                    </ul>
                  </div>
                  {actionType === 'convert' && (
                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium">{t('conversionFee')}</p>
                      <p>{t('totalFee')}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-opacity-90 ${
                      actionType === 'convert' ? 'bg-primary-600' : 'bg-secondary-600'
                    }`}
                  >
                    {actionType === 'convert' ? t('convertCertificate') : t('verifyCertificate')}
                  </button>
                </div>
              </>
            )}
            
            {actionStatus === 'loading' && (
              <div className="text-center py-4">
                <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700 dark:text-gray-300">
                  {actionType === 'convert' 
                    ? t('initiatingConversion')
                    : t('verifyingCertificate')}
                </p>
              </div>
            )}
            
            {actionStatus === 'success' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {actionType === 'convert' 
                    ? t('conversionStarted')
                    : t('certificateVerified')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {actionType === 'convert' 
                    ? t('conversionStartedDesc')
                    : t('verificationSuccessDesc')}
                </p>
              </div>
            )}
            
            {actionStatus === 'error' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {actionType === 'convert' ? t('conversionFailed') : t('verificationFailed')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('actionErrorMessage', {0: actionType === 'convert' ? 'conversion' : 'verification'})}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActionStatus('idle')}
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