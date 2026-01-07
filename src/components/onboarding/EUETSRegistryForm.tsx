/**
 * EU ETS Registry Form Component
 * Form for entering and verifying EU ETS Registry account information
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { verifyEUETSAccount } from '../../services/kycService';
import type { EUETSVerificationResult } from '../../types/kyc';

interface EUETSRegistryFormProps {
  onVerificationComplete?: (result: EUETSVerificationResult) => void;
  initialAccount?: string;
  initialCountry?: string;
}

const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
];

export default function EUETSRegistryForm({
  onVerificationComplete,
  initialAccount = '',
  initialCountry = '',
}: EUETSRegistryFormProps) {
  const { t } = useTranslation();
  const [accountNumber, setAccountNumber] = useState(initialAccount);
  const [country, setCountry] = useState(initialCountry);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<EUETSVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!accountNumber || !country) {
      setError(t('kyc.euEts.allFieldsRequired', 'Please fill in all fields'));
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await verifyEUETSAccount({
        account_number: accountNumber,
        country: country,
      });

      setVerificationResult(result.verification);
      onVerificationComplete?.(result.verification);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        t('kyc.euEts.verificationFailed', 'Verification failed. Please try again.')
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('kyc.euEts.title', 'EU ETS Registry Account Verification')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t(
            'kyc.euEts.description',
            'Please provide your EU ETS Registry account information for verification.'
          )}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('kyc.euEts.country', 'Country')} <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            disabled={isVerifying || verificationResult?.verified}
          >
            <option value="">
              {t('kyc.euEts.selectCountry', 'Select a country')}
            </option>
            {EU_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="accountNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('kyc.euEts.accountNumber', 'Account Number')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={t('kyc.euEts.accountNumberPlaceholder', 'Enter your registry account number')}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            disabled={isVerifying || verificationResult?.verified}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {verificationResult && (
          <div
            className={`rounded-md p-4 ${
              verificationResult.verified
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}
          >
            <div className="flex items-center">
              {verificationResult.verified ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('kyc.euEts.verified', 'Account verified successfully')}
                  </p>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t('kyc.euEts.verificationFailed', 'Verification failed')}
                    </p>
                    {verificationResult.error && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        {verificationResult.error}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || !accountNumber || !country || verificationResult?.verified}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying
            ? t('kyc.euEts.verifying', 'Verifying...')
            : verificationResult?.verified
            ? t('kyc.euEts.verified', 'Verified')
            : t('kyc.euEts.verify', 'Verify Account')}
        </button>
      </div>
    </div>
  );
}

