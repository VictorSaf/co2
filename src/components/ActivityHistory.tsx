import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Activity, ActivityType, getFilteredActivityHistory } from '../data/activityHistory';

// Componenta pentru afișarea istoricului de activități
export default function ActivityHistory() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'ALL'>('ALL');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [showAllUsers, setShowAllUsers] = useState<boolean>(true);

  // Încarcă istoricul activităților
  useEffect(() => {
    if (user) {
      // Obține istoricul filtrat în funcție de perioadă
      const filterDate = new Date();
      if (timeRange === 'week') {
        filterDate.setDate(filterDate.getDate() - 7);
      } else if (timeRange === 'month') {
        filterDate.setMonth(filterDate.getMonth() - 1);
      } else {
        filterDate.setMonth(filterDate.getMonth() - 6); // istoric 6 luni
      }
      
      // Obține activitățile filtrate
      const filtered = getFilteredActivityHistory(
        showAllUsers ? null : user.id, 
        timeRange !== 'all' ? filterDate : null, 
        null, 
        filter !== 'ALL' ? filter as ActivityType : null,
        showAllUsers
      );
      
      setActivities(filtered);
      setLoading(false);
    }
  }, [user, filter, timeRange, showAllUsers]);

  // Funcție pentru a obține eticheta și culoarea corectă pentru tipul de activitate
  const getActivityLabel = (type: ActivityType): { label: string; color: string } => {
    switch (type) {
      case 'PURCHASE':
        return { label: t('activityPurchase'), color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
      case 'CONVERSION_START':
        return { label: t('activityConversionStart'), color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' };
      case 'CONVERSION_COMPLETE':
        return { label: t('activityConversionComplete'), color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' };
      case 'VERIFICATION':
        return { label: t('activityVerification'), color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300' };
      case 'SURRENDER':
        return { label: t('activitySurrender'), color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
      default:
        return { label: type, color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' };
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">{t('activityHistory')}</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Filtrare utilizatori */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setShowAllUsers(true)}
              className={`px-3 py-1 text-xs font-medium ${
                showAllUsers
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border rounded-l-md`}
            >
              {t('allMarketActivity')}
            </button>
            <button
              type="button"
              onClick={() => setShowAllUsers(false)}
              className={`px-3 py-1 text-xs font-medium ${
                !showAllUsers
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-t border-b border-r rounded-r-md`}
            >
              {t('myActivity')}
            </button>
          </div>
          
          {/* Filtre temporale */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-xs font-medium ${
                timeRange === 'week'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border rounded-l-md`}
            >
              {t('lastWeek')}
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-xs font-medium ${
                timeRange === 'month'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-t border-b border-r`}
            >
              {t('lastMonth')}
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-xs font-medium ${
                timeRange === 'all'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-t border-b border-r rounded-r-md`}
            >
              {t('allTime')}
            </button>
          </div>
          
          {/* Filtrare după tipul de activitate */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityType | 'ALL')}
            className="text-xs rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
          >
            <option value="ALL">{t('allActivities')}</option>
            <option value="PURCHASE">{t('activityPurchase')}</option>
            <option value="CONVERSION_START">{t('activityConversionStart')}</option>
            <option value="CONVERSION_COMPLETE">{t('activityConversionComplete')}</option>
            <option value="VERIFICATION">{t('activityVerification')}</option>
            <option value="SURRENDER">{t('activitySurrender')}</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">{t('loading')}</div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">{t('noActivitiesFound')}</div>
      ) : (
        <div className="overflow-hidden shadow dark:shadow-gray-900/50 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                  {t('activityDate')}
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {t('activityType')}
                </th>
                {showAllUsers && (
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {t('participant')}
                  </th>
                )}
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {t('activityDetails')}
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {t('amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {activities.map((activity) => {
                const { label, color } = getActivityLabel(activity.type);
                const isCurrentUser = user && activity.userId === user.id;
                
                return (
                  <tr key={activity.id} className={!isCurrentUser ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-xs text-gray-900 dark:text-gray-100 sm:pl-6">
                      {format(new Date(activity.timestamp), 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {label}
                      </span>
                    </td>
                    {showAllUsers && (
                      <td className="whitespace-nowrap px-3 py-3 text-xs">
                        {isCurrentUser ? (
                          <span className="text-primary-600 dark:text-primary-400 font-medium">{t('you')}</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">{t('thirdParty')}</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {isCurrentUser 
                        ? activity.details 
                        : t('anonymizedActivity', { type: t(activity.type === 'PURCHASE' 
                            ? 'activityPurchase' 
                            : activity.type === 'CONVERSION_START' 
                            ? 'activityConversionStart' 
                            : activity.type === 'CONVERSION_COMPLETE' 
                            ? 'activityConversionComplete' 
                            : activity.type === 'VERIFICATION' 
                            ? 'activityVerification' 
                            : 'activitySurrender')})}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-right text-gray-700 dark:text-gray-300">
                      {isCurrentUser ? (
                        <>
                          {activity.amount ? `${activity.amount.toLocaleString()} ${t('tonsUnit')}` : '-'}
                          {activity.price ? ` @ €${activity.price.toFixed(2)}` : ''}
                          {activity.totalValue ? ` = €${activity.totalValue.toLocaleString()}` : ''}
                        </>
                      ) : (
                        activity.amount ? `${t('approximately')} ${Math.round(activity.amount/1000)*1000} ${t('tonsUnit')}` : '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}