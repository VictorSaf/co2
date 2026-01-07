/**
 * Onboarding Page
 * Main page for KYC onboarding process
 * 
 * Features:
 * - Free navigation between all steps (non-blocking)
 * - Document upload available on all steps via collapsible section
 * - Per-step expand/collapse state for document upload section
 * - Final submission validation (only place where documents block submission)
 * - Optimized document reloading (callback-based, not step-based)
 */
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import OnboardingStepper from '../components/onboarding/OnboardingStepper';
import DocumentUpload from '../components/onboarding/DocumentUpload';
import EUETSRegistryForm from '../components/onboarding/EUETSRegistryForm';
import SuitabilityAssessment from '../components/onboarding/SuitabilityAssessment';
import AppropriatenessAssessment from '../components/onboarding/AppropriatenessAssessment';
import {
  startOnboarding,
  getKYCStatus,
  submitKYC,
  getDocuments,
} from '../services/kycService';
import type {
  WorkflowStep,
  KYCDocument,
  UserKYC,
  EUETSVerificationResult,
  DocumentType,
  SuitabilityAssessment as SuitabilityAssessmentType,
  AppropriatenessAssessment as AppropriatenessAssessmentType,
} from '../types/kyc';

const STEPS: Array<{ id: WorkflowStep; name: string; description: string }> = [
  {
    id: 'document_collection',
    name: 'Documents',
    description: 'Upload required documents',
  },
  {
    id: 'eu_ets_verification',
    name: 'EU ETS Registry',
    description: 'Verify your registry account',
  },
  {
    id: 'suitability_assessment',
    name: 'Suitability',
    description: 'Complete suitability assessment',
  },
  {
    id: 'appropriateness_assessment',
    name: 'Appropriateness',
    description: 'Complete appropriateness assessment',
  },
  {
    id: 'final_review',
    name: 'Review',
    description: 'Review and submit',
  },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('document_collection');
  const [kycData, setKycData] = useState<UserKYC | null>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suitabilityComplete, setSuitabilityComplete] = useState(false);
  const [appropriatenessComplete, setAppropriatenessComplete] = useState(false);
  /**
   * Per-step state for document upload section collapse/expand.
   * Each step maintains its own independent state, so expanding on one step
   * doesn't affect the state of other steps.
   */
  const [showDocumentUpload, setShowDocumentUpload] = useState<Map<WorkflowStep, boolean>>(new Map());
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    contact_person: '',
    phone: '',
  });

  useEffect(() => {
    loadKYCStatus();
  }, []);

  // Ensure currentStep is always valid
  useEffect(() => {
    const validSteps: WorkflowStep[] = ['document_collection', 'eu_ets_verification', 'suitability_assessment', 'appropriateness_assessment', 'final_review'];
    if (!validSteps.includes(currentStep)) {
      setCurrentStep('document_collection');
    }
  }, [currentStep]);

  /**
   * Reload documents when KYC data changes (initial load or after updates).
   * Note: Documents are also reloaded via callbacks in handleDocumentUpload/handleDocumentDelete
   * to ensure consistency after upload/delete operations. This avoids unnecessary API calls
   * when navigating between steps.
   */
  useEffect(() => {
    if (kycData) {
      const reloadDocs = async () => {
        try {
          const docsResponse = await getDocuments();
          setDocuments(docsResponse.documents);
        } catch (err) {
          // Silently fail - documents might not be loaded yet
        }
      };
      reloadDocs();
    }
  }, [kycData]);

  const loadKYCStatus = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const status = await getKYCStatus();
      
      // If status is null, user hasn't started onboarding
      if (!status) {
        setKycData(null);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      setKycData(status.user);
      
      // Set current step from workflow, or default to document_collection if no workflow
      if (status.workflow && status.workflow.current_step) {
        const workflowStep = status.workflow.current_step;
        // Validate step is valid, otherwise default to document_collection
        const validSteps: WorkflowStep[] = ['document_collection', 'eu_ets_verification', 'suitability_assessment', 'appropriateness_assessment', 'final_review'];
        if (validSteps.includes(workflowStep)) {
            setCurrentStep(workflowStep);
        } else {
          // Invalid step, default to document_collection
          setCurrentStep('document_collection');
        }
      } else {
        // No workflow or no current_step - user exists but workflow not started properly
        // Default to document_collection to show upload form
        setCurrentStep('document_collection');
      }

      // Check if assessments are complete
      if (status.user.suitability_assessment) {
        setSuitabilityComplete(true);
      }
      if (status.user.appropriateness_assessment) {
        setAppropriatenessComplete(true);
      }

      // Load documents
      try {
        const docsResponse = await getDocuments();
        setDocuments(docsResponse.documents);
      } catch (docErr: any) {
        // If documents endpoint fails, don't block the page - just set empty array
        // This is expected if user hasn't uploaded any documents yet
        setDocuments([]);
      }

      // If already approved, redirect to dashboard
      if (status.user.kyc_status === 'approved') {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle different error scenarios with user-friendly messages
      if (err.response?.status === 404) {
        // User hasn't started onboarding yet - this is expected, not an error
        // Show initial form instead of error message
        setKycData(null);
        setError(null);
      } else if (err.response?.status === 400 && err.response?.data?.code === 'INVALID_USER_ID') {
        // Invalid user ID format - provide actionable error message
        setError(t('kyc.onboarding.invalidUserId', 'Invalid user ID format. Please log out and log in again.'));
        setKycData(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication/authorization errors - redirect to login
        setError(t('kyc.onboarding.authError', 'Authentication required. Please sign in again.'));
      } else if (err.response?.status >= 500) {
        // Server errors - provide retry suggestion
        setError(t('kyc.onboarding.serverError', 'Server error. Please try again later.'));
      } else if (err.message === 'User not authenticated' || err.message?.includes('not authenticated')) {
        // Authentication errors from service layer
        setError(t('kyc.onboarding.authError', 'Authentication required. Please sign in again.'));
      } else if (err.message?.includes('network') || err.message?.includes('Network')) {
        // Network errors - provide helpful message
        setError(t('kyc.onboarding.networkError', 'Network error. Please check your connection and try again.'));
      } else {
        // Other errors - show user-friendly message from API or generic fallback
        const errorMessage = err.response?.data?.error || err.message || t('kyc.onboarding.loadError', 'Failed to load KYC status. Please try again.');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    if (!formData.company_name || !formData.address || !formData.contact_person || !formData.phone) {
      setError(t('kyc.onboarding.allFieldsRequired', 'Please fill in all fields'));
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await startOnboarding(formData);
      await loadKYCStatus();
    } catch (err: any) {
      // Comprehensive error handling for onboarding start with user-friendly messages
      if (err.response?.status === 400) {
        const errorCode = err.response?.data?.code;
        if (errorCode === 'INVALID_USER_ID') {
          setError(t('kyc.onboarding.invalidUserId', 'Invalid user ID format. Please log out and log in again.'));
        } else if (errorCode === 'MISSING_FIELDS') {
          setError(t('kyc.onboarding.allFieldsRequired', 'Please fill in all fields'));
        } else {
          // Show API error message or fallback to generic validation error
          const errorMessage = err.response?.data?.error || t('kyc.onboarding.validationError', 'Invalid data. Please check your input.');
          setError(errorMessage);
        }
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication/authorization errors
        setError(t('kyc.onboarding.authError', 'Authentication required. Please sign in again.'));
      } else if (err.response?.status >= 500) {
        // Server errors - provide retry suggestion
        setError(t('kyc.onboarding.serverError', 'Server error. Please try again later.'));
      } else if (err.message === 'User not authenticated' || err.message?.includes('not authenticated')) {
        // Authentication errors from service layer
        setError(t('kyc.onboarding.authError', 'Authentication required. Please sign in again.'));
      } else if (err.message?.includes('network') || err.message?.includes('Network')) {
        // Network errors
        setError(t('kyc.onboarding.networkError', 'Network error. Please check your connection and try again.'));
      } else {
        // Other errors - show API error message or generic fallback
        setError(err.response?.data?.error || t('kyc.onboarding.startError', 'Failed to start onboarding. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle document upload success callback.
   * Updates local state immediately for instant feedback, then reloads
   * documents from server after a delay to ensure consistency.
   * This callback-based reloading avoids unnecessary API calls when
   * navigating between steps.
   */
  const handleDocumentUpload = async (document: KYCDocument) => {
    // Add document to list immediately for instant feedback
    setDocuments((prev) => {
      // Check if document already exists to avoid duplicates
      const exists = prev.some(doc => doc.id === document.id);
      if (exists) return prev;
      return [...prev, document];
    });
    
    // Reload documents from server after a delay to avoid rate limiting
    // Use setTimeout to debounce and allow success message to display first
    // Increased delay to 5 seconds to work with cache TTL
    setTimeout(async () => {
      try {
        const docsResponse = await getDocuments();
        setDocuments(docsResponse.documents);
      } catch (err: any) {
        // If reload fails (e.g., rate limit), keep the document we just added
        // Don't show error to user - document is already in the list
        // Cache will handle 429 errors gracefully
      }
    }, 5000); // Wait 5 seconds before reloading - cache will serve data if needed
    
    // Reload KYC status after a longer delay to avoid hitting rate limits
    setTimeout(async () => {
      try {
        await loadKYCStatus();
      } catch (err: any) {
        // Silently fail - don't disrupt user experience
        // Cache will handle 429 errors gracefully
      }
    }, 6000);
  };

  /**
   * Handle document deletion callback.
   * Updates local state immediately for instant feedback, then reloads
   * documents from server after a delay to ensure consistency.
   * This callback-based reloading ensures document lists stay synchronized
   * across all steps without requiring step-based reloading.
   */
  const handleDocumentDelete = async (documentId: string) => {
    // Remove document from list immediately for instant feedback
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    
    // Reload documents from server after a delay to ensure consistency
    setTimeout(async () => {
      try {
        const docsResponse = await getDocuments();
        setDocuments(docsResponse.documents);
      } catch (err) {
        // Silently fail - document is already removed from list
      }
    }, 1000);
    
    // Reload KYC status to update workflow state
    await loadKYCStatus();
  };

  const handleEUETSVerification = async (result: EUETSVerificationResult) => {
    if (result.verified) {
      await loadKYCStatus();
      // Move to next step
      setCurrentStep('suitability_assessment');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      await submitKYC();
      await loadKYCStatus();
      setCurrentStep('final_review');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit KYC dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequiredDocuments = (): DocumentType[] => {
    return [
      'company_registration',
      'financial_statement',
      'tax_certificate',
      'eu_ets_proof',
      'power_of_attorney',
    ];
  };

  const hasAllRequiredDocuments = (): boolean => {
    if (!documents || documents.length === 0) {
      return false;
    }
    const required = getRequiredDocuments();
    const uploaded = documents.map((doc) => doc.document_type);
    // Check that each required document type has at least one uploaded document
    const hasAll = required.every((type) => uploaded.includes(type));
    return hasAll;
  };

  const getMissingDocuments = (): DocumentType[] => {
    const required = getRequiredDocuments();
    const uploaded = documents.map((doc) => doc.document_type);
    return required.filter((type) => !uploaded.includes(type));
  };

  /**
   * Collapsible document upload section component.
   * Available on all onboarding steps, allowing users to upload documents
   * at any point in the process. Each step maintains its own expand/collapse state.
   */
  const DocumentUploadSection = () => {
    const documentCount = documents.length;
    const requiredCount = getRequiredDocuments().length;
    const missingDocs = getMissingDocuments();
    // Get expanded state for current step, default to false (collapsed)
    const isExpanded = showDocumentUpload.get(currentStep) || false;
    
    /**
     * Toggle expand/collapse state for the current step.
     * Updates the Map with a new entry for the current step, preserving
     * the state of all other steps.
     */
    const toggleExpand = () => {
      setShowDocumentUpload(new Map(showDocumentUpload).set(currentStep, !isExpanded));
    };

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={toggleExpand}
          className="w-full flex items-center justify-between py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
        >
          <span>
            {t('kyc.onboarding.uploadDocuments', 'Upload Documents')} ({documentCount} / {requiredCount}{' '}
            {t('kyc.onboarding.documentsUploaded', 'uploaded')})
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-6">
            {missingDocs.length > 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {t(
                    'kyc.onboarding.missingDocuments',
                    'Missing documents:'
                  )}{' '}
                  {missingDocs.map((type) => {
                    const labels: Record<DocumentType, string> = {
                      company_registration: t('kyc.documents.companyRegistration', 'Company Registration Certificate'),
                      financial_statement: t('kyc.documents.financialStatement', 'Financial Statement'),
                      tax_certificate: t('kyc.documents.taxCertificate', 'Tax Certificate'),
                      eu_ets_proof: t('kyc.documents.euEtsProof', 'EU ETS Registry Proof'),
                      power_of_attorney: t('kyc.documents.powerOfAttorney', 'Power of Attorney'),
                    };
                    return labels[type];
                  }).join(', ')}
                </p>
              </div>
            )}

            <DocumentUpload
              documentType="company_registration"
              label={t('kyc.documents.companyRegistration', 'Company Registration Certificate')}
              description={t(
                'kyc.documents.companyRegistrationDesc',
                'Registration certificate - Maximum 90 days old'
              )}
              required
              onUploadSuccess={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              existingDocuments={documents}
            />

            <DocumentUpload
              documentType="financial_statement"
              label={t('kyc.documents.financialStatement', 'Financial Statement')}
              description={t('kyc.documents.financialStatementDesc', 'Latest balance sheet')}
              required
              onUploadSuccess={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              existingDocuments={documents}
            />

            <DocumentUpload
              documentType="tax_certificate"
              label={t('kyc.documents.taxCertificate', 'Tax Certificate')}
              description={t('kyc.documents.taxCertificateDesc', 'Tax registration certificate')}
              required
              onUploadSuccess={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              existingDocuments={documents}
            />

            <DocumentUpload
              documentType="eu_ets_proof"
              label={t('kyc.documents.euEtsProof', 'EU ETS Registry Proof')}
              description={t('kyc.documents.euEtsProofDesc', 'Proof of EU ETS Registry account')}
              required
              onUploadSuccess={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              existingDocuments={documents}
            />

            <DocumentUpload
              documentType="power_of_attorney"
              label={t('kyc.documents.powerOfAttorney', 'Power of Attorney')}
              description={t(
                'kyc.documents.powerOfAttorneyDesc',
                'Authorization for legal representative'
              )}
              required
              onUploadSuccess={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              existingDocuments={documents}
            />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user hasn't started onboarding, show initial form with stepper
  if (!kycData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 overflow-visible">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('kyc.onboarding.title', 'Client Onboarding')}
            </h1>
            <OnboardingStepper currentStep="document_collection" steps={STEPS} />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('kyc.onboarding.welcome', 'Welcome to Nihao Carbon Certificates')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t(
                'kyc.onboarding.description',
                'Please provide your company information to start the onboarding process.'
              )}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('kyc.onboarding.companyName', 'Company Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('kyc.onboarding.address', 'Address')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('kyc.onboarding.contactPerson', 'Contact Person')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('kyc.onboarding.phone', 'Phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={handleStartOnboarding}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('kyc.onboarding.start', 'Start Onboarding')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 overflow-visible">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('kyc.onboarding.title', 'Client Onboarding')}
          </h1>
          <OnboardingStepper 
            currentStep={currentStep} 
            steps={STEPS} 
            onStepClick={setCurrentStep}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {currentStep === 'document_collection' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('kyc.onboarding.uploadDocuments', 'Upload Required Documents')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(
                  'kyc.onboarding.documentsDescription',
                  'Please upload all required documents. All documents must be valid and up to date.'
                )}
              </p>

              <DocumentUpload
                documentType="company_registration"
                label={t('kyc.documents.companyRegistration', 'Company Registration Certificate')}
                description={t(
                  'kyc.documents.companyRegistrationDesc',
                  'Registration certificate - Maximum 90 days old'
                )}
                required
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                existingDocuments={documents}
              />

              <DocumentUpload
                documentType="financial_statement"
                label={t('kyc.documents.financialStatement', 'Financial Statement')}
                description={t('kyc.documents.financialStatementDesc', 'Latest balance sheet')}
                required
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                existingDocuments={documents}
              />

              <DocumentUpload
                documentType="tax_certificate"
                label={t('kyc.documents.taxCertificate', 'Tax Certificate')}
                description={t('kyc.documents.taxCertificateDesc', 'Tax registration certificate')}
                required
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                existingDocuments={documents}
              />

              <DocumentUpload
                documentType="eu_ets_proof"
                label={t('kyc.documents.euEtsProof', 'EU ETS Registry Proof')}
                description={t('kyc.documents.euEtsProofDesc', 'Proof of EU ETS Registry account')}
                required
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                existingDocuments={documents}
              />

              <DocumentUpload
                documentType="power_of_attorney"
                label={t('kyc.documents.powerOfAttorney', 'Power of Attorney')}
                description={t(
                  'kyc.documents.powerOfAttorneyDesc',
                  'Authorization for legal representative'
                )}
                required
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                existingDocuments={documents}
              />

              <div className="mt-6 space-y-4">
                {!hasAllRequiredDocuments() && (
                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t(
                        'kyc.onboarding.documentsIncomplete',
                        'You have not uploaded all required documents yet. You can continue and upload them later, but all documents must be uploaded before final submission.'
                      )}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      {documents.length} / {getRequiredDocuments().length}{' '}
                      {t('kyc.onboarding.documentsUploaded', 'documents uploaded')}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setCurrentStep('eu_ets_verification')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {t('kyc.onboarding.continue', 'Continue to Next Step')}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'eu_ets_verification' && (
            <div>
              <EUETSRegistryForm
                onVerificationComplete={handleEUETSVerification}
                initialAccount={kycData.eu_ets_registry_account}
                initialCountry={kycData.eu_ets_registry_country}
              />
              <DocumentUploadSection />
              <button
                onClick={() => setCurrentStep('suitability_assessment')}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('kyc.onboarding.continue', 'Continue to Next Step')}
              </button>
            </div>
          )}

          {currentStep === 'suitability_assessment' && (
            <div>
              <SuitabilityAssessment
                onComplete={(assessment: SuitabilityAssessmentType) => {
                  setSuitabilityComplete(true);
                  setCurrentStep('appropriateness_assessment');
                }}
                initialData={kycData.suitability_assessment}
              />
              <DocumentUploadSection />
              {!suitabilityComplete && (
                <button
                  onClick={() => setCurrentStep('appropriateness_assessment')}
                  className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('kyc.onboarding.skipForNow', 'Skip for now')}
                </button>
              )}
            </div>
          )}

          {currentStep === 'appropriateness_assessment' && (
            <div>
              <AppropriatenessAssessment
                onComplete={(assessment: AppropriatenessAssessmentType) => {
                  setAppropriatenessComplete(true);
                  setCurrentStep('final_review');
                }}
                initialData={kycData.appropriateness_assessment}
              />
              <DocumentUploadSection />
              {!appropriatenessComplete && (
                <button
                  onClick={() => setCurrentStep('final_review')}
                  className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('kyc.onboarding.skipForNow', 'Skip for now')}
                </button>
              )}
            </div>
          )}

          {currentStep === 'final_review' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('kyc.onboarding.review', 'Review and Submit')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(
                  'kyc.onboarding.reviewDescription',
                  'Please review your information before submitting. Once submitted, your dossier will be reviewed by our compliance team.'
                )}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('kyc.onboarding.documentsStatus', 'Documents Status')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {documents.length} / {getRequiredDocuments().length}{' '}
                    {t('kyc.onboarding.documentsUploaded', 'documents uploaded')}
                  </p>
                  {!hasAllRequiredDocuments() && (
                    <div className="mt-2 rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                        {t('kyc.onboarding.missingDocumentsRequired', 'Missing required documents:')}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {getMissingDocuments().map((type) => {
                          const labels: Record<DocumentType, string> = {
                            company_registration: t('kyc.documents.companyRegistration', 'Company Registration Certificate'),
                            financial_statement: t('kyc.documents.financialStatement', 'Financial Statement'),
                            tax_certificate: t('kyc.documents.taxCertificate', 'Tax Certificate'),
                            eu_ets_proof: t('kyc.documents.euEtsProof', 'EU ETS Registry Proof'),
                            power_of_attorney: t('kyc.documents.powerOfAttorney', 'Power of Attorney'),
                          };
                          return labels[type];
                        }).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('kyc.onboarding.euEtsStatus', 'EU ETS Registry Status')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {kycData.eu_ets_registry_verified
                      ? t('kyc.onboarding.verified', 'Verified')
                      : t('kyc.onboarding.notVerified', 'Not verified')}
                  </p>
                </div>
              </div>

              <DocumentUploadSection />

              {!hasAllRequiredDocuments() && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {t(
                      'kyc.onboarding.cannotSubmitWithoutDocuments',
                      'You cannot submit your KYC dossier without uploading all required documents. Please upload the missing documents above before submitting.'
                    )}
                  </p>
                </div>
              )}

              {!kycData.eu_ets_registry_verified && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {t(
                      'kyc.onboarding.cannotSubmitWithoutEts',
                      'You cannot submit your KYC dossier without verifying your EU ETS Registry account. Please complete the EU ETS verification step.'
                    )}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!hasAllRequiredDocuments() || !kycData.eu_ets_registry_verified || isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('kyc.onboarding.submitting', 'Submitting...')}
                  </>
                ) : (
                  t('kyc.onboarding.submit', 'Submit for Review')
                )}
              </button>
            </div>
          )}

          {kycData && kycData.kyc_status === 'in_review' && (
            <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t(
                  'kyc.onboarding.inReview',
                  'Your KYC dossier is under review. You will be notified once the review is complete.'
                )}
              </p>
            </div>
          )}

          {/* Fallback: If no step matches, show document collection by default */}
          {currentStep && 
           currentStep !== 'document_collection' && 
           currentStep !== 'eu_ets_verification' && 
           currentStep !== 'suitability_assessment' && 
           currentStep !== 'appropriateness_assessment' && 
           currentStep !== 'final_review' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('kyc.onboarding.uploadDocuments', 'Upload Required Documents')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(
                  'kyc.onboarding.documentsDescription',
                  'Please upload all required documents. All documents must be valid and up to date.'
                )}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {t('kyc.onboarding.invalidStep', 'Invalid step detected. Please refresh the page or contact support.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

