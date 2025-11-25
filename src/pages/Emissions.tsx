import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useCertificates } from '../context/CertificateContext';
import { Certificate } from '../types';
import { useTranslation } from 'react-i18next';

Chart.register(...registerables);

export default function Emissions() {
  const { portfolio, emissions, surrenderCertificate } = useCertificates();
  const { t } = useTranslation();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [surrenderStatus, setSurrenderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Filter verified EUA certificates
  const verifiedEUACertificates = portfolio.certificates.filter(
    cert => cert.type === 'EUA' && cert.status === 'Verified'
  );
  
  // Handle certificate surrender
  const handleSurrender = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setSurrenderStatus('idle');
    setShowSurrenderModal(true);
  };
  
  const handleConfirmSurrender = async () => {
    if (!selectedCertificate) return;
    
    setSurrenderStatus('loading');
    
    try {
      const success = await surrenderCertificate(selectedCertificate);
      
      if (success) {
        setSurrenderStatus('success');
        setTimeout(() => {
          setShowSurrenderModal(false);
          setSurrenderStatus('idle');
          setSelectedCertificate(null);
        }, 2000);
      } else {
        setSurrenderStatus('error');
      }
    } catch (error) {
      setSurrenderStatus('error');
    }
  };
  
  // Create emissions chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        // Create new chart
        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: [t('doughnutChartRemaining'), t('doughnutChartSurrendered')],
            datasets: [
              {
                data: [emissions.remaining, emissions.surrendered],
                backgroundColor: [
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                ],
                borderColor: [
                  'rgba(239, 68, 68, 1)',
                  'rgba(16, 185, 129, 1)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.formattedValue;
                    const percentage = ((context.raw as number) / emissions.total * 100).toFixed(1);
                    return `${label}: ${value} ${t('tonsUnit')} (${percentage}%)`;
                  },
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
  }, [emissions]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('emissionsTitle')}</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('totalEmissions')}</h2>
            <p className="text-3xl font-bold text-gray-800">{emissions.total.toLocaleString()} {t('tonsUnit')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('annualCO2emissions')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('surrendered')}</h2>
            <p className="text-3xl font-bold text-green-600">{emissions.surrendered.toLocaleString()} {t('tonsUnit')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('ofTotalEmissions', { 0: ((emissions.surrendered / emissions.total) * 100).toFixed(1) })}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('remaining')}</h2>
            <p className="text-3xl font-bold text-red-600">{emissions.remaining.toLocaleString()} {t('tonsUnit')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('ofTotalEmissions', { 0: ((emissions.remaining / emissions.total) * 100).toFixed(1) })}
            </p>
          </div>
        </div>
        
        {/* Emissions Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('emissionsOverview')}</h2>
            <div className="h-64">
              <canvas ref={chartRef}></canvas>
            </div>
            {emissions.surrendered > 0 && (
              <div className="mt-4 text-center">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {t('complianceAchieved', { 0: ((emissions.surrendered / emissions.total) * 100).toFixed(1) })}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('complianceStatus')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">{t('currentPeriod')}</h3>
                <p className="text-sm text-gray-600">{t('currentPeriodDates')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">{t('complianceDeadline')}</h3>
                <p className="text-sm text-gray-600">{t('deadlineDate')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">{t('complianceStatus')}</h3>
                {emissions.surrendered >= emissions.total ? (
                  <div className="flex items-center text-green-600">
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{t('fullyCompliant')}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{t('partialCompliance')}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('complianceSummary')}</h3>
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{t('totalEmissions')}:</span>
                    <span className="text-sm font-medium text-gray-800">{emissions.total.toLocaleString()} {t('tonsUnit')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{t('surrendered')}:</span>
                    <span className="text-sm font-medium text-green-600">{emissions.surrendered.toLocaleString()} {t('tonsUnit')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{t('shortfall')}</span>
                    <span className="text-sm font-medium text-red-600">{emissions.remaining.toLocaleString()} {t('tonsUnit')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Surrender Certificates Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{t('availableCertificatesForSurrender')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('surrenderDescription')}
            </p>
          </div>
          
          {verifiedEUACertificates.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('certificateID')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('verificationDate')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verifiedEUACertificates.map((certificate) => (
                  <tr key={certificate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {certificate.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {certificate.amount.toLocaleString()} {t('tonsUnit')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {t('verified')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {certificate.verifiedAt ? new Date(certificate.verifiedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSurrender(certificate)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {t('surrender')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>{t('noVerifiedEUA')}</p>
              <p className="mt-2 text-sm">
                {t('verifyPortfolioMessage')}
              </p>
            </div>
          )}
        </div>
        
        {/* Compliance Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('aboutEUETSCompliance')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('complianceProcess')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('complianceProcessDesc')}
              </p>
              <div className="bg-gray-50 rounded p-3 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1">{t('keyComplianceDates')}</h4>
                <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                  <li>{t('monitoringPeriod')}</li>
                  <li>{t('emissionsReportDeadline')}</li>
                  <li>{t('surrenderDeadline')}</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">{t('penaltiesForNonCompliance')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('penaltiesDesc')}
              </p>
              <div className="bg-red-50 rounded p-3 border border-red-200">
                <h4 className="text-sm font-medium text-red-700 mb-1">{t('nonComplianceConsequences')}</h4>
                <ul className="text-xs text-red-600 list-disc pl-4 space-y-1">
                  <li>{t('penalty100Euro')}</li>
                  <li>{t('obligationToSurrender')}</li>
                  <li>{t('publicationOfNames')}</li>
                  <li>{t('additionalPenalties')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Surrender confirmation modal */}
      {showSurrenderModal && selectedCertificate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {surrenderStatus === 'idle' && (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('surrenderCertificate')}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {t('surrenderDialogDesc')}
                  </p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 mb-1">{t('certificateDetailsLabel')}</p>
                    <ul className="text-sm text-gray-600">
                      <li className="mb-1">ID: {selectedCertificate.id.substring(0, 8)}...</li>
                      <li className="mb-1">{t('amountLabel')} {selectedCertificate.amount.toLocaleString()} {t('tonsUnit')}</li>
                      <li>{t('type')} {selectedCertificate.type}</li>
                    </ul>
                  </div>
                  <div className="mt-4 bg-green-50 rounded p-3">
                    <p className="text-sm font-medium text-green-800">
                      {t('afterSurrenderingDesc', {0: selectedCertificate.amount.toLocaleString()})}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSurrenderModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleConfirmSurrender}
                    className="px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700"
                  >
                    {t('surrenderCertificateButton')}
                  </button>
                </div>
              </>
            )}
            
            {surrenderStatus === 'loading' && (
              <div className="text-center py-4">
                <svg className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700">
                  {t('verifyingWithRegistry')}
                </p>
              </div>
            )}
            
            {surrenderStatus === 'success' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('certificateSurrenderedSuccess')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('emissionsReducedSuccess', {0: selectedCertificate.amount.toLocaleString()})}
                </p>
                <div className="bg-green-50 rounded p-3 text-sm text-green-800">
                  <p>{t('newComplianceLevel', {0: (((emissions.surrendered + selectedCertificate.amount) / emissions.total) * 100).toFixed(1)})}</p>
                </div>
              </div>
            )}
            
            {surrenderStatus === 'error' && (
              <div className="text-center py-4">
                <svg className="h-12 w-12 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('surrenderFailed')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('actionErrorMessage', {0: 'surrender'})}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSurrenderStatus('idle')}
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