import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAccessRequests,
  getAccessRequestDetails,
  reviewAccessRequest,
  type AccessRequest,
  type ReviewData,
} from '../../services/adminService';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  BellIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Badge } from '../../design-system';

const REQUESTS_PER_PAGE = 50;

export default function AccessRequestsManagement() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [reviewForm, setReviewForm] = useState<ReviewData>({ status: '', notes: '' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckedAtRef = useRef<Date | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = currentPage * REQUESTS_PER_PAGE;
      const response = await getAccessRequests({
        status: statusFilter || undefined,
        limit: REQUESTS_PER_PAGE,
        offset: offset,
        search: debouncedSearchTerm || undefined,
      });
      setRequests(response.requests);
      setTotalRequests(response.total);
      
      // Set lastCheckedAt after first successful load (for polling baseline)
      if (lastCheckedAtRef.current === null && response.requests.length > 0) {
        // Use the oldest request's created_at as baseline, or current time if no requests
        const oldestRequest = response.requests[response.requests.length - 1];
        const baseline = oldestRequest?.createdAt 
          ? new Date(oldestRequest.createdAt)
          : new Date();
        lastCheckedAtRef.current = baseline;
      }
    } catch (err: any) {
      setError(err.message || t('errorLoadingAccessRequests'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearchTerm, currentPage, t]);

  // Debounce search input
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when search changes
    }, 300); // 300ms debounce

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  // Load requests when filters or page change
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const checkForNewRequests = useCallback(async () => {
    if (lastCheckedAtRef.current === null) {
      // Skip if baseline not set yet
      return;
    }

    try {
      const response = await getAccessRequests({
        status: 'pending',
        limit: 100,
        offset: 0,
      });

      // Count new requests (created after lastCheckedAt)
      const newRequests = response.requests.filter((req) => {
        if (!req.createdAt) return false;
        const createdAt = new Date(req.createdAt);
        return createdAt > lastCheckedAtRef.current!;
      });

      if (newRequests.length > 0) {
        setNewRequestsCount(newRequests.length);
        // Show notification
        setSuccessMessage(t('newRequestNotification', { count: newRequests.length }));
        // Reload requests to show new ones (only if on first page or no filter)
        if (currentPage === 0 && !statusFilter && !debouncedSearchTerm) {
          loadRequests();
        }
      }

      // Update lastCheckedAt to current time
      const now = new Date();
      lastCheckedAtRef.current = now;
    } catch (err: any) {
      // Silently fail polling errors
      console.error('Error checking for new requests:', err);
    }
  }, [t, currentPage, statusFilter, debouncedSearchTerm, loadRequests]);

  // Set up polling separately from filter effects
  useEffect(() => {
    // Start polling for new requests
    pollingIntervalRef.current = setInterval(() => {
      checkForNewRequests();
    }, 10000); // Poll every 10 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkForNewRequests]);

  const handleViewDetails = async (request: AccessRequest) => {
    try {
      const details = await getAccessRequestDetails(request.id);
      setSelectedRequest(details);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      setError(err.message || t('errorLoadingRequestDetails'));
    }
  };

  const handleReview = (request: AccessRequest) => {
    setSelectedRequest(request);
    setReviewForm({
      status: request.status,
      notes: request.notes || '',
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedRequest) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await reviewAccessRequest(selectedRequest.id, reviewForm);
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setSuccessMessage(t('statusUpdated'));
      loadRequests();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('errorReviewingRequest'));
    }
  };

  const totalPages = Math.ceil(totalRequests / REQUESTS_PER_PAGE);
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status?: string) => {
    const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
      pending: 'warning',
      reviewed: 'info',
      approved: 'success',
      rejected: 'error',
    };

    const variant = statusVariant[status || 'pending'] || 'warning';
    return (
      <Badge variant={variant} size="sm">
        {status || 'pending'}
      </Badge>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('accessRequestsManagement')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('accessRequestsSubtitle')}
            </p>
          </div>
          {newRequestsCount > 0 && (
            <div className="flex items-center space-x-2">
              <BellIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <Badge variant="warning" size="md">
                {newRequestsCount} {t('newRequests')}
              </Badge>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label htmlFor="search-requests" className="sr-only">
              {t('searchRequests')}
            </label>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              id="search-requests"
              type="text"
              placeholder={t('searchRequests')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              aria-label={t('searchRequests')}
            />
          </div>

          <label htmlFor="status-filter" className="sr-only">
            {t('filterByStatus')}
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0); // Reset to first page when filter changes
            }}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            aria-label={t('filterByStatus')}
          >
            <option value="">{t('filterByStatus')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="reviewed">{t('reviewed')}</option>
            <option value="approved">{t('approved')}</option>
            <option value="rejected">{t('rejected')}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('entity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('position')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('reference')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('createdAt')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noRequestsFound')}
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {request.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title={t('viewDetails')}
                          aria-label={t('viewDetails') + ': ' + request.entity}
                        >
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleReview(request)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('reviewRequest')}
                          aria-label={t('reviewRequest') + ': ' + request.entity}
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalRequests > REQUESTS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('previousPage')}
            >
              {t('previous')}
            </button>
            <button
              onClick={handleNextPage}
              disabled={!canGoNext}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('nextPage')}
            >
              {t('next')}
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('showingResults', {
                  start: currentPage * REQUESTS_PER_PAGE + 1,
                  end: Math.min((currentPage + 1) * REQUESTS_PER_PAGE, totalRequests),
                  total: totalRequests,
                })}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label={t('pagination')}>
                <button
                  onClick={handlePreviousPage}
                  disabled={!canGoPrevious}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('previousPage')}
                >
                  <span className="sr-only">{t('previous')}</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('page')} {currentPage + 1} {t('of')} {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!canGoNext}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('nextPage')}
                >
                  <span className="sr-only">{t('next')}</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Transition show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDetailsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4" id="details-modal-title">
                    {t('requestDetails')}
                  </Dialog.Title>

                  {selectedRequest && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('entity')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.entity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('contact')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.contact}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('position')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.position || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('reference')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.reference || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('createdAt')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRequest.createdAt)}</p>
                        </div>
                        {selectedRequest.reviewedAt && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('reviewedAt')}</p>
                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRequest.reviewedAt)}</p>
                          </div>
                        )}
                        {selectedRequest.reviewedBy && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('reviewedBy')}</p>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.reviewedBy}</p>
                          </div>
                        )}
                      </div>
                      {selectedRequest.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('notes')}</p>
                          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            {selectedRequest.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    >
                      {t('close')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Review Modal */}
      <Transition show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsReviewModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4" id="review-modal-title">
                    {t('reviewAccessRequest')}
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="review-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('changeStatus')}
                      </label>
                      <select
                        id="review-status"
                        value={reviewForm.status}
                        onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        aria-label={t('changeStatus')}
                        aria-required="true"
                      >
                        <option value="">{t('selectStatus')}</option>
                        <option value="pending">{t('pending')}</option>
                        <option value="reviewed">{t('reviewed')}</option>
                        <option value="approved">{t('approved')}</option>
                        <option value="rejected">{t('rejected')}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('addNotes')}
                      </label>
                      <textarea
                        id="review-notes"
                        value={reviewForm.notes || ''}
                        onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                        rows={4}
                        maxLength={1000}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder={t('notesPlaceholder')}
                        aria-label={t('addNotes')}
                        aria-describedby="notes-char-count"
                      />
                      <p id="notes-char-count" className="mt-1 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                        {(reviewForm.notes || '').length}/1000
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReview}
                      disabled={!reviewForm.status}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('save')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

