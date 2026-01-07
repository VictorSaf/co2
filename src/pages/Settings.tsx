import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import UserManagement from '../components/admin/UserManagement';
import Configuration from '../components/admin/Configuration';
import PriceUpdateMonitoring from '../components/admin/PriceUpdateMonitoring';
import AccessRequestsManagement from '../components/admin/AccessRequestsManagement';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin (Victor)
    if (!isAdmin()) {
      navigate('/dashboard', { 
        replace: true,
        state: { error: t('adminAccessRequired') }
      });
    }
  }, [user, navigate, isAdmin, t]);

  // Don't render if not admin
  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('settings')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('settingsSubtitle')}
          </p>
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white dark:bg-gray-800 p-1 shadow-sm">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              {t('userManagement')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              {t('configuration')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              {t('priceUpdateMonitoring')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              {t('accessRequests')}
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <UserManagement />
            </Tab.Panel>
            <Tab.Panel>
              <Configuration />
            </Tab.Panel>
            <Tab.Panel>
              <PriceUpdateMonitoring />
            </Tab.Panel>
            <Tab.Panel>
              <AccessRequestsManagement />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

