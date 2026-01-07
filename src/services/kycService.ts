/**
 * KYC Service for API calls
 * 
 * Provides functions for interacting with the KYC/Onboarding API endpoints.
 * Includes automatic retry logic for network failures and 5xx errors.
 * 
 * All functions require user authentication (user ID retrieved from localStorage).
 * 
 * Features:
 * - Automatic retry on network failures (up to 3 retries)
 * - Real-time upload progress tracking
 * - Standardized error handling
 * - Type-safe API calls
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type {
  OnboardingData,
  KYCDocument,
  KYCWorkflow,
  UserKYC,
  EUETSAccount,
  EUETSVerificationResult,
  SuitabilityAssessment,
  AppropriatenessAssessment,
  DocumentType,
} from '../types/kyc';
import { API_CONFIG } from '../design-system/tokens';

// Backend API URL
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

/**
 * Axios instance with default configuration and retry logic.
 * 
 * Automatically retries failed requests (network errors or 5xx responses)
 * up to API_CONFIG.MAX_RETRIES times with API_CONFIG.RETRY_DELAY delay.
 * 
 * Does not retry 4xx errors (client errors) as these are typically
 * permanent failures (authentication, validation, etc.).
 */
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
});

// Add request interceptor to mark KYC status requests
apiClient.interceptors.request.use(
  (config) => {
    // Mark KYC status requests so we can handle 404s specially
    if (config.url?.includes('/kyc/status') || config.url?.endsWith('/kyc/status')) {
      (config as any)._suppress404Log = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor with retry logic and 404 suppression for KYC status
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean; _suppress404Log?: boolean; _retryCount?: number };
    const url = config.url || '';
    const isKYCStatus = url.includes('/kyc/status') || config._suppress404Log;
    
    // Transform 404 errors for /kyc/status into a valid response to prevent console errors
    // This is expected behavior when user hasn't started onboarding, not an actual error
    if (error.response?.status === 404 && isKYCStatus) {
      // Create a response-like object that axios will treat as success
      // The validateStatus in getKYCStatus() will accept this 404 as valid
      const fakeResponse = {
        data: error.response.data || { code: 'KYC_NOT_FOUND', error: 'KYC onboarding not started' },
        status: 404,
        statusText: 'Not Found',
        headers: error.response.headers,
        config: error.config,
        request: error.request
      };
      
      // Return as resolved promise - this prevents axios from logging it as an error
      // The browser may still show it in Network tab, but it won't appear in console
      return Promise.resolve(fakeResponse as any);
    }
    
    // Handle 429 (Too Many Requests) with exponential backoff
    if (error.response?.status === 429) {
      const retryCount = config._retryCount || 0;
      const maxRetries = 2; // Max 2 retries for rate limit errors
      
      if (retryCount < maxRetries) {
        config._retryCount = retryCount + 1;
        config._retry = true;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return apiClient(config);
      }
      // If max retries reached, reject with user-friendly error
      const rateLimitError = new Error('Too many requests. Please wait a moment and try again.') as any;
      rateLimitError.response = error.response;
      return Promise.reject(rateLimitError);
    }
    
    // Don't retry if already retried or if it's a 4xx error (client error, except 429)
    if (config._retry || (error.response && error.response.status < 500 && error.response.status !== 429)) {
      return Promise.reject(error);
    }
    
    // Retry on network errors or 5xx errors
    if (!config._retry) {
      config._retry = true;
      
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get user ID from auth context or localStorage
 * TODO: Replace with proper auth token
 */
function getUserId(): string | null {
  // For now, get from localStorage (mock auth)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      const userId = parsed.id || null;
      // Validate UUID format before returning
      if (userId && isValidUUID(userId)) {
        return userId;
      }
      // If invalid UUID, return null to trigger error handling
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get headers with user ID
 */
function getHeaders(): Record<string, string> {
  const userId = getUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  return headers;
}

/**
 * Start onboarding process
 */
export async function startOnboarding(userData: OnboardingData): Promise<{ workflow: KYCWorkflow }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.post(
    '/kyc/register',
    {
      user_id: userId,
      ...userData,
    },
    { headers: getHeaders() }
  );

  // Clear cache since KYC status has changed
  clearKYCStatusCache();

  return response.data;
}

/**
 * Upload a KYC document with progress tracking.
 * 
 * @param file - File to upload (PDF, PNG, JPG, JPEG)
 * @param documentType - Type of document being uploaded
 * @param onProgress - Optional callback for upload progress (0.0 to 1.0)
 * @returns Promise resolving to uploaded document data
 * @throws Error if user is not authenticated or upload fails
 */
export async function uploadDocument(
  file: File,
  documentType: DocumentType,
  onProgress?: (progress: number) => void
): Promise<{ document: KYCDocument }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  const headers = getHeaders();
  delete headers['Content-Type']; // Let browser set multipart/form-data

  const response = await apiClient.post(
    '/kyc/documents/upload',
    formData,
    {
      headers: {
        ...headers,
        'X-User-ID': userId,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = progressEvent.loaded / progressEvent.total;
          onProgress(progress);
        }
      },
    }
  );

  // Clear caches since document upload affects both KYC status and documents list
  clearKYCStatusCache();
  clearDocumentsCache();

  return response.data;
}

// Request deduplication and caching for documents
let documentsCache: { data: KYCDocument[]; timestamp: number } | null = null;
let documentsPromise: Promise<{ documents: KYCDocument[] }> | null = null;
const DOCUMENTS_CACHE_TTL = 15000; // Cache for 15 seconds to prevent duplicate requests

/**
 * Get all documents for the current user
 * 
 * Features:
 * - Request deduplication: If a request is already in progress, returns the same promise
 * - Short-term caching: Caches results for 10 seconds to prevent duplicate requests
 * - Rate limit handling: Handles 429 errors gracefully
 */
export async function getDocuments(): Promise<{ documents: KYCDocument[] }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check cache first (if within TTL)
  const now = Date.now();
  if (documentsCache && (now - documentsCache.timestamp) < DOCUMENTS_CACHE_TTL) {
    return { documents: documentsCache.data };
  }

  // If request is already in progress, return the same promise (deduplication)
  if (documentsPromise) {
    return documentsPromise;
  }

  // Create new request promise
  documentsPromise = (async () => {
    try {
      const response = await apiClient.get(
        '/kyc/documents',
        { 
          headers: getHeaders(),
          validateStatus: (status) => {
            // Accept 200, 429 (rate limit), and other statuses for error handling
            return status < 500;
          }
        }
      );

      // Handle 429 rate limit errors gracefully
      if (response.status === 429) {
        // If we have cached data, return it even if stale
        if (documentsCache) {
          console.warn('Rate limit hit for documents, returning cached data');
          documentsPromise = null;
          return { documents: documentsCache.data };
        }
        // Otherwise throw error
        const rateLimitError = new Error('Too many requests. Please wait a moment and try again.') as any;
        rateLimitError.response = response;
        documentsPromise = null;
        throw rateLimitError;
      }

      const result = response.data;
      
      // Cache the result
      documentsCache = {
        data: result.documents || result.document || [],
        timestamp: now
      };

      return result;
    } catch (error: any) {
      // Handle 429 errors from axios
      if (error.response?.status === 429) {
        // If we have cached data, return it even if stale
        if (documentsCache) {
          console.warn('Rate limit hit for documents, returning cached data');
          documentsPromise = null;
          return { documents: documentsCache.data };
        }
        // Otherwise throw error
        const rateLimitError = new Error('Too many requests. Please wait a moment and try again.') as any;
        rateLimitError.response = error.response;
        documentsPromise = null;
        throw rateLimitError;
      }
      documentsPromise = null;
      throw error;
    } finally {
      // Clear the promise after a short delay
      setTimeout(() => {
        documentsPromise = null;
      }, 1000);
    }
  })();

  return documentsPromise;
}

/**
 * Clear documents cache
 * Call this after operations that might change documents (e.g., upload, delete)
 */
export function clearDocumentsCache(): void {
  documentsCache = null;
  documentsPromise = null;
}

// Cache for image previews (blob URLs)
const imagePreviewCache = new Map<string, string>();

/**
 * Get authenticated image preview URL
 * Converts the preview endpoint to a blob URL with authentication headers
 */
export async function getDocumentPreviewUrl(documentId: string): Promise<string | null> {
  // Check cache first
  if (imagePreviewCache.has(documentId)) {
    return imagePreviewCache.get(documentId) || null;
  }

  const userId = getUserId();
  if (!userId) {
    return null;
  }

  try {
    const headers = getHeaders();
    const response = await apiClient.get(
      `/kyc/documents/${documentId}/preview`,
      {
        headers,
        responseType: 'blob', // Important: get as blob for image
        validateStatus: (status) => status === 200 || status === 404 || status === 401
      }
    );

    if (response.status === 200 && response.data) {
      // Create blob URL from response
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Cache the blob URL
      imagePreviewCache.set(documentId, blobUrl);
      
      return blobUrl;
    }

    return null;
  } catch (error: any) {
    // Silently fail - return null to show fallback icon
    return null;
  }
}

/**
 * Clear image preview cache for a specific document
 */
export function clearDocumentPreviewCache(documentId?: string): void {
  if (documentId) {
    const cachedUrl = imagePreviewCache.get(documentId);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      imagePreviewCache.delete(documentId);
    }
  } else {
    // Clear all cached previews
    imagePreviewCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    imagePreviewCache.clear();
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  await apiClient.delete(
    `/kyc/documents/${documentId}`,
    { headers: getHeaders() }
  );

  // Clear caches since document deletion affects both KYC status and documents list
  clearKYCStatusCache();
  clearDocumentsCache();
}

/**
 * Submit KYC dossier for review
 */
export async function submitKYC(): Promise<{ status: string }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.post(
    '/kyc/submit',
    {},
    { headers: getHeaders() }
  );

  // Clear cache since KYC status has changed (submitted for review)
  clearKYCStatusCache();

  return response.data;
}

// Request deduplication and caching for KYC status
let kycStatusCache: { data: { user: UserKYC; workflow: KYCWorkflow | null } | null; timestamp: number } | null = null;
let kycStatusPromise: Promise<{ user: UserKYC; workflow: KYCWorkflow | null } | null> | null = null;
const KYC_STATUS_CACHE_TTL = 10000; // Cache for 10 seconds to prevent duplicate requests

/**
 * Get current KYC status
 * Returns null if user hasn't started onboarding (404), throws error for other cases
 * 
 * Features:
 * - Request deduplication: If a request is already in progress, returns the same promise
 * - Short-term caching: Caches results for 5 seconds to prevent rapid duplicate requests
 * - Rate limit handling: Handles 429 errors with exponential backoff retry
 */
export async function getKYCStatus(): Promise<{ user: UserKYC; workflow: KYCWorkflow | null } | null> {
  const userId = getUserId();
  if (!userId) {
    const error = new Error('User not authenticated') as any;
    error.response = { status: 401, data: { error: 'Authentication required', code: 'AUTH_REQUIRED' } };
    throw error;
  }

  // Check cache first (if within TTL)
  const now = Date.now();
  if (kycStatusCache && (now - kycStatusCache.timestamp) < KYC_STATUS_CACHE_TTL) {
    return kycStatusCache.data;
  }

  // If request is already in progress, return the same promise (deduplication)
  if (kycStatusPromise) {
    return kycStatusPromise;
  }

  const headers = getHeaders();
  if (!headers['X-User-ID']) {
    const error = new Error('User ID not available') as any;
    error.response = { status: 401, data: { error: 'Authentication required', code: 'AUTH_REQUIRED' } };
    throw error;
  }

  // Create new request promise
  kycStatusPromise = (async () => {
    try {
      const response = await apiClient.get(
        '/kyc/status',
        { 
          headers, 
          validateStatus: (status) => {
            // Accept both 200 and 404 as valid responses
            // 404 means user hasn't started onboarding (expected, not an error)
            // This prevents axios from throwing an error and logging to console
            return status === 200 || status === 404;
          }
        }
      );

      // If 404, user hasn't started onboarding - return null silently
      // This is expected behavior, not an error condition
      const result = response.status === 404 ? null : response.data;

      // Cache the result
      kycStatusCache = {
        data: result,
        timestamp: now
      };

      return result;
    } catch (error: any) {
      // Fallback: If error still occurs (shouldn't happen with validateStatus), handle gracefully
      if (error.response?.status === 404) {
        // Cache null result for 404
        kycStatusCache = {
          data: null,
          timestamp: now
        };
        return null;
      }
      // Re-throw other errors (network errors, 500 errors, rate limit errors, etc.)
      throw error;
    } finally {
      // Clear the promise so new requests can be made after cache expires
      kycStatusPromise = null;
    }
  })();

  return kycStatusPromise;
}

/**
 * Clear KYC status cache
 * Call this after operations that might change KYC status (e.g., document upload, KYC submit)
 * to ensure fresh data is fetched on next getKYCStatus() call
 */
export function clearKYCStatusCache(): void {
  kycStatusCache = null;
  kycStatusPromise = null;
}

/**
 * Verify EU ETS Registry account
 */
export async function verifyEUETSAccount(
  accountData: EUETSAccount
): Promise<{ verification: EUETSVerificationResult }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.post(
    '/kyc/eu-ets-verify',
    accountData,
    { headers: getHeaders() }
  );

  return response.data;
}

/**
 * Submit suitability assessment
 */
export async function submitSuitabilityAssessment(
  assessment: Omit<SuitabilityAssessment, 'submitted_at'>
): Promise<{ assessment: SuitabilityAssessment }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.post(
    '/kyc/suitability-assessment',
    assessment,
    { headers: getHeaders() }
  );

  return response.data;
}

/**
 * Submit appropriateness assessment
 */
export async function submitAppropriatenessAssessment(
  assessment: Omit<AppropriatenessAssessment, 'submitted_at'>
): Promise<{ assessment: AppropriatenessAssessment }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.post(
    '/kyc/appropriateness-assessment',
    assessment,
    { headers: getHeaders() }
  );

  return response.data;
}

/**
 * Get workflow status
 */
export async function getWorkflow(): Promise<{ workflow: KYCWorkflow }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.get(
    '/kyc/workflow',
    { headers: getHeaders() }
  );

  return response.data;
}

/**
 * Get knowledge test questions
 */
export async function getKnowledgeQuestions(): Promise<{ questions: any[] }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await apiClient.get(
    '/kyc/knowledge-questions',
    { headers: getHeaders() }
  );

  return response.data;
}

