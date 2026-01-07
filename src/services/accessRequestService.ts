/**
 * Access Request Service for API calls
 * 
 * Provides functions for submitting access requests from the login page.
 * 
 * Features:
 * - Standardized error handling
 * - Type-safe API calls
 */
import axios, { AxiosError } from 'axios';

// Backend API URL
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

export interface AccessRequestData {
  entity: string;
  contact: string;
  position: string;
  reference: string;
}

export interface AccessRequestResponse {
  message: string;
  requestId: string;
}

export interface AccessRequestError {
  error: string;
  errorCode?: string;
}

/**
 * Submit an access request
 * 
 * @param data - Access request data (entity, contact, reference)
 * @returns Promise with success message and request ID
 * @throws Error if request fails
 */
export async function submitAccessRequest(
  data: AccessRequestData
): Promise<AccessRequestResponse> {
  try {
    const response = await axios.post<AccessRequestResponse>(
      `${BACKEND_API_URL}/access-requests`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AccessRequestError>;
    
    if (axiosError.response) {
      // Server responded with error
      const errorData = axiosError.response.data;
      throw new Error(errorData?.error || 'Failed to submit access request');
    } else if (axiosError.request) {
      // Request made but no response received
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
}

