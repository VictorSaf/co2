import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getConfig, updateConfig, type PlatformConfig } from '../../services/adminService';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Configuration() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState<PlatformConfig>({
    platformName: 'Nihao Carbon Certificates',
    contactEmail: 'contact@nihao.com',
    cacheDuration: 120,
    rateLimitPerDay: 200,
    rateLimitPerHour: 50,
  });
  const [formData, setFormData] = useState({
    cacheDuration: 120,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConfig();
      setConfig(data);
      setFormData({
        cacheDuration: data.cacheDuration,
      });
    } catch (err: any) {
      setError(err.message || t('errorLoadingConfig'));
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    // Validate cache duration
    if (formData.cacheDuration < 60 || formData.cacheDuration > 600) {
      setError(t('cacheDurationInvalid'));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updatedConfig = await updateConfig({
        cacheDuration: formData.cacheDuration,
      });

      setConfig(updatedConfig);
      setFormData({
        cacheDuration: updatedConfig.cacheDuration,
      });
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errorSavingConfig'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('configuration')}
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">{t('configSavedSuccessfully')}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('generalSettings')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('platformName')}
              </label>
              <input
                type="text"
                value={config.platformName}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contactEmail')}
              </label>
              <input
                type="email"
                value={config.contactEmail}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Cache Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('cacheSettings')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cacheDuration')} ({t('seconds')})
              </label>
              <input
                type="number"
                value={formData.cacheDuration}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 120;
                  setFormData({ ...formData, cacheDuration: value });
                  if (error) setError(null);
                }}
                min="60"
                max="600"
                className={`w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                  error ? 'border-red-500' : ''
                }`}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('cacheDurationDescription')}
              </p>
              {error && error.includes('cache') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rate Limiting Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('rateLimitingSettings')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('requestsPerDay')}
              </label>
              <input
                type="number"
                value={config.rateLimitPerDay}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('requestsPerHour')}
              </label>
              <input
                type="number"
                value={config.rateLimitPerHour}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

