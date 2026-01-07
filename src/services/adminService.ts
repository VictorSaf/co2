import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

// Generate consistent admin ID for Victor (same UUID generation as backend)
// IMPORTANT: This must match the algorithm in backend/init_db.py exactly
function generateAdminId(): string {
  const username = 'Victor';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    // Convert to 32-bit unsigned integer (simulating Python's hash & hash behavior)
    // Python keeps it as a positive 32-bit integer, so we use unsigned right shift
    hash = hash >>> 0;
  }
  const positiveHash = hash.toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${positiveHash}${positiveHash}${positiveHash}${positiveHash}`.substring(0, 36);
}

function getAdminHeaders(): Record<string, string> {
  const adminId = generateAdminId();
  return {
    'X-Admin-ID': adminId,
    'Content-Type': 'application/json',
  };
}

// Helper function to build API paths consistently
function buildApiPath(endpoint: string): string {
  if (BACKEND_API_URL.startsWith('/')) {
    return `${BACKEND_API_URL}${endpoint}`;
  }
  return `${BACKEND_API_URL}/api${endpoint}`;
}

export interface User {
  id: string;
  username: string;
  email: string;
  companyName?: string;
  kycStatus?: string;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password?: string;
  companyName?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
}

export interface AccessRequest {
  id: string;
  entity: string;
  contact: string;
  position: string;
  reference: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AccessRequestsResponse {
  requests: AccessRequest[];
  total: number;
  limit: number;
  offset: number;
}

export interface AccessRequestFilters {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ReviewData {
  status: string;
  notes?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  perPage: number;
}

export interface PlatformConfig {
  platformName: string;
  contactEmail: string;
  cacheDuration: number;
  rateLimitPerDay: number;
  rateLimitPerHour: number;
}

export interface PriceUpdateStatus {
  eua: {
    pollingInterval: number;
    cacheDuration: number;
    endpoint: string;
    libraries: {
      backend: string[];
      frontend: string[];
    };
    dataSources: string[];
    lastUpdate?: string;
    lastSource?: string;
    lastPrice?: number;
    sourcePrices?: Array<{
      source: string;
      lastPrice: number | null;
      lastUpdate: string | null;
    }>;
    status?: string;
  };
  cea: {
    pollingInterval: number;
    cacheDuration: number;
    endpoint: string;
    libraries: {
      backend: string[];
      frontend: string[];
    };
    method: string;
    lastUpdate?: string;
    status?: string;
  };
  historical: {
    libraries: string[];
    method: string;
    dataFiles: string[];
  };
}

export async function getAllUsers(page: number = 1, perPage: number = 50, filters?: {
  kycStatus?: string;
  riskLevel?: string;
  search?: string;
}): Promise<UsersResponse> {
  try {
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: perPage.toString(),
    };
    
    if (filters?.kycStatus) {
      params.kyc_status = filters.kycStatus;
    }
    if (filters?.riskLevel) {
      params.risk_level = filters.riskLevel;
    }
    if (filters?.search) {
      params.search = filters.search;
    }
    
    const response = await axios.get<UsersResponse>(buildApiPath('/admin/users'), {
      params,
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch users');
    }
    throw new Error('Network error while fetching users');
  }
}

export async function getUserDetails(userId: string): Promise<User> {
  try {
    const response = await axios.get<User>(buildApiPath(`/admin/users/${userId}`), {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch user details');
    }
    throw new Error('Network error while fetching user details');
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  try {
    const response = await axios.put<User>(buildApiPath(`/admin/users/${userId}`), data, {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to update user');
    }
    throw new Error('Network error while updating user');
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await axios.delete(buildApiPath(`/admin/users/${userId}`), {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to delete user');
    }
    throw new Error('Network error while deleting user');
  }
}

export async function getConfig(): Promise<PlatformConfig> {
  try {
    const response = await axios.get<PlatformConfig>(buildApiPath('/admin/config'), {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch configuration');
    }
    throw new Error('Network error while fetching configuration');
  }
}

export async function updateConfig(config: Partial<PlatformConfig>): Promise<PlatformConfig> {
  try {
    const response = await axios.put<PlatformConfig>(buildApiPath('/admin/config'), config, {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to update configuration');
    }
    throw new Error('Network error while updating configuration');
  }
}

export async function getPriceUpdateStatus(): Promise<PriceUpdateStatus> {
  try {
    const response = await axios.get<PriceUpdateStatus>(buildApiPath('/admin/price-updates/status'), {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch price update status');
    }
    throw new Error('Network error while fetching price update status');
  }
}

export async function refreshPrices(): Promise<void> {
  try {
    // Refresh EUA price
    await axios.post(buildApiPath('/eua/price/refresh'), {}, {
      headers: getAdminHeaders(),
      timeout: 15000,
    });
    
    // Refresh CEA price (by calling the endpoint which will regenerate)
    await axios.get(buildApiPath('/cea/price'), {
      headers: getAdminHeaders(),
      timeout: 15000,
    });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to refresh prices');
    }
    throw new Error('Network error while refreshing prices');
  }
}

export async function createUser(data: CreateUserData): Promise<User> {
  try {
    const response = await axios.post<User>(buildApiPath('/admin/users'), data, {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to create user');
    }
    throw new Error('Network error while creating user');
  }
}

export async function getAccessRequests(filters?: AccessRequestFilters): Promise<AccessRequestsResponse> {
  try {
    const params: Record<string, string> = {};
    
    if (filters?.status) {
      params.status = filters.status;
    }
    if (filters?.limit) {
      params.limit = filters.limit.toString();
    }
    if (filters?.offset) {
      params.offset = filters.offset.toString();
    }
    if (filters?.search) {
      params.search = filters.search;
    }
    
    const response = await axios.get<AccessRequestsResponse>(buildApiPath('/admin/access-requests'), {
      params,
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch access requests');
    }
    throw new Error('Network error while fetching access requests');
  }
}

export async function getAccessRequestDetails(requestId: string): Promise<AccessRequest> {
  try {
    const response = await axios.get<AccessRequest>(buildApiPath(`/admin/access-requests/${requestId}`), {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch access request details');
    }
    throw new Error('Network error while fetching access request details');
  }
}

export async function reviewAccessRequest(requestId: string, data: ReviewData): Promise<AccessRequest> {
  try {
    const response = await axios.post<AccessRequest>(buildApiPath(`/admin/access-requests/${requestId}/review`), data, {
      headers: getAdminHeaders(),
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to review access request');
    }
    throw new Error('Network error while reviewing access request');
  }
}

