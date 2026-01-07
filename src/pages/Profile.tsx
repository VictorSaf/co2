/**
 * Profile Page
 * Displays user information and KYC/onboarding status
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getKYCStatus, getDocuments } from '../services/kycService';
import type { UserKYC, KYCWorkflow, KYCDocument, WorkflowStep } from '../types/kyc';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kycData, setKycData] = useState<UserKYC | null>(null);
  const [workflow, setWorkflow] = useState<KYCWorkflow | null>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const status = await getKYCStatus();
      
      // If status is null, user hasn't started onboarding
      if (!status) {
        setKycData(null);
        setWorkflow(null);
        setError(null);
        return;
      }
      
      setKycData(status.user);
      setWorkflow(status.workflow);

      try {
        const docsResponse = await getDocuments();
        setDocuments(docsResponse.documents);
      } catch (docErr: any) {
        // If documents endpoint fails, set empty array (expected if no documents uploaded)
        // Don't show error for document loading failure - it's not critical
        setDocuments([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // User hasn't started onboarding - this is okay
        setKycData(null);
        setWorkflow(null);
        setError(null); // Clear error for 404
      } else if (err.response?.status === 400 && err.response?.data?.code === 'INVALID_USER_ID') {
        // Invalid user ID format - this shouldn't happen if UUID generation is correct
        // But handle it gracefully
        setKycData(null);
        setWorkflow(null);
        setError(t('profile.error.invalidUserId', 'Invalid user ID format. Please log out and log in again.'));
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication/authorization errors
        setError(t('profile.error.authError', 'Authentication required. Please sign in again.'));
      } else if (err.response?.status >= 500) {
        // Server errors
        setError(t('profile.error.serverError', 'Server error. Please try again later.'));
      } else if (err.message === 'User not authenticated') {
        setError(t('profile.error.authError', 'Authentication required. Please sign in again.'));
      } else {
        // Other errors - show user-friendly message
        const errorMessage = err.response?.data?.error || err.message || t('profile.loadError', 'Failed to load profile data');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'in_review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return t('profile.status.approved', 'Approved');
      case 'in_review':
        return t('profile.status.inReview', 'In Review');
      case 'rejected':
        return t('profile.status.rejected', 'Rejected');
      case 'pending':
        return t('profile.status.pending', 'Pending');
      case 'needs_update':
        return t('profile.status.needsUpdate', 'Needs Update');
      default:
        return t('profile.status.notStarted', 'Not Started');
    }
  };

  const getWorkflowStepLabel = (step: WorkflowStep) => {
    const stepLabels: Record<WorkflowStep, string> = {
      document_collection: t('profile.steps.documentCollection', 'Document Collection'),
      identity_verification: t('profile.steps.identityVerification', 'Identity Verification'),
      sanctions_check: t('profile.steps.sanctionsCheck', 'Sanctions Check'),
      eu_ets_verification: t('profile.steps.euEtsVerification', 'EU ETS Verification'),
      suitability_assessment: t('profile.steps.suitabilityAssessment', 'Suitability Assessment'),
      appropriateness_assessment: t('profile.steps.appropriatenessAssessment', 'Appropriateness Assessment'),
      final_review: t('profile.steps.finalReview', 'Final Review'),
      approved: t('profile.steps.approved', 'Approved'),
      rejected: t('profile.steps.rejected', 'Rejected'),
    };
    return stepLabels[step] || step;
  };

  const calculateProgress = (): number => {
    if (!workflow) return 0;
    
    const steps: WorkflowStep[] = [
      'document_collection',
      'eu_ets_verification',
      'suitability_assessment',
      'appropriateness_assessment',
      'final_review',
    ];
    
    const currentIndex = steps.indexOf(workflow.current_step);
    if (currentIndex === -1) {
      return workflow.status === 'completed' ? 100 : 0;
    }
    
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.document_type === documentType);
    if (!doc) {
      return { status: 'not_uploaded', label: t('profile.documents.notUploaded', 'Not Uploaded') };
    }
    
    switch (doc.verification_status) {
      case 'verified':
        return { status: 'verified', label: t('profile.documents.verified', 'Verified') };
      case 'rejected':
        return { status: 'rejected', label: t('profile.documents.rejected', 'Rejected') };
      default:
        return { status: 'pending', label: t('profile.documents.pending', 'Pending') };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* User Information skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Onboarding Status skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar skeleton */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {t('profile.title', 'Your Profile')}
        </h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {t('profile.userInformation', 'User Information')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('profile.username', 'Username')}
                  </label>
                  <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                    {user?.username || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('profile.email', 'Email')}
                  </label>
                  <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                    {kycData?.email || '-'}
                  </p>
                </div>
                {kycData?.company_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.companyName', 'Company Name')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                      {kycData.company_name}
                    </p>
                  </div>
                )}
                {kycData?.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.address', 'Address')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                      {kycData.address}
                    </p>
                  </div>
                )}
                {kycData?.contact_person && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.contactPerson', 'Contact Person')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                      {kycData.contact_person}
                    </p>
                  </div>
                )}
                {kycData?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.phone', 'Phone')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                      {kycData.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Onboarding Status Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {t('profile.onboardingStatus', 'Onboarding Status')}
              </h2>
              
              {!kycData ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('profile.onboardingNotStarted', 'You haven\'t started the onboarding process yet.')}
                  </p>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {t('profile.startOnboarding', 'Start Onboarding')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.kycStatus', 'KYC Status')}
                    </label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(kycData.kyc_status)}`}>
                        {getStatusLabel(kycData.kyc_status)}
                      </span>
                    </div>
                  </div>

                  {workflow && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('profile.currentStep', 'Current Step')}
                        </label>
                        <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                          {getWorkflowStepLabel(workflow.current_step)}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                          {t('profile.workflowProgress', 'Progress')}
                        </label>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(calculateProgress())}% {t('profile.complete', 'complete')}
                        </p>
                      </div>
                    </>
                  )}

                  {kycData.kyc_status !== 'approved' && (
                    <Link
                      to="/onboarding"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {t('profile.continueOnboarding', 'Continue Onboarding')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Documents Status */}
            {kycData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {t('profile.documentsStatus', 'Documents Status')}
                </h2>
                <div className="space-y-3">
                  {[
                    'company_registration',
                    'financial_statement',
                    'tax_certificate',
                    'eu_ets_proof',
                    'power_of_attorney',
                  ].map((docType) => {
                    const docStatus = getDocumentStatus(docType);
                    return (
                      <div key={docType} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {t(`kyc.documents.${docType}`, docType)}
                        </span>
                        <span className={`text-sm font-medium ${
                          docStatus.status === 'verified' ? 'text-green-600 dark:text-green-400' :
                          docStatus.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                          docStatus.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          {docStatus.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link
                  to="/onboarding"
                  className="mt-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  {t('profile.viewDocuments', 'View Documents')} →
                </Link>
              </div>
            )}
          </div>

          {/* Assessment Status Sidebar */}
          {kycData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {t('profile.assessments', 'Assessments')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.euEtsVerification', 'EU ETS Verification')}
                    </label>
                    <div className="mt-1">
                      {kycData.eu_ets_registry_verified ? (
                        <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t('profile.verified', 'Verified')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {t('profile.notVerified', 'Not Verified')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.suitabilityAssessment', 'Suitability Assessment')}
                    </label>
                    <div className="mt-1">
                      {kycData.suitability_assessment ? (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {t('profile.completed', 'Completed')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('profile.notCompleted', 'Not Completed')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('profile.appropriatenessAssessment', 'Appropriateness Assessment')}
                    </label>
                    <div className="mt-1">
                      {kycData.appropriateness_assessment ? (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {t('profile.completed', 'Completed')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('profile.notCompleted', 'Not Completed')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

