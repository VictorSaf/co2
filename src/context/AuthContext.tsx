import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { getKYCStatus } from '../services/kycService';
import type { KYCStatus } from '../types/kyc';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserBalance: (newBalance: number) => void;
  checkKYCStatus: () => Promise<void>;
  kycStatus: KYCStatus | null;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for Victor
// Generate a consistent UUID for Victor based on username
// IMPORTANT: This must match the algorithm in backend/init_db.py exactly
// This ensures the same UUID is used every time
function generateConsistentUUID(username: string): string {
  // Use the same hash algorithm as backend
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    // Convert to 32-bit unsigned integer (simulating Python's hash & hash behavior)
    hash = hash >>> 0;
  }
  // Format as UUID matching backend format: 00000000-0000-4000-8000-{hash}{hash}{hash}{hash}
  const positiveHash = hash.toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${positiveHash}${positiveHash}${positiveHash}${positiveHash}`.substring(0, 36);
}

const VICTOR_UUID = generateConsistentUUID('Victor');
const MOCK_USER: User = {
  id: VICTOR_UUID,
  username: 'Victor',
  balance: 100000000, // 100 million EUR
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  
  const checkKYCStatus = useCallback(async () => {
    // Don't check KYC status if user is not logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setKycStatus(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // Validate UUID format before making request
      if (!parsedUser?.id || !isValidUUID(parsedUser.id)) {
        setKycStatus(null);
        return;
      }

      const status = await getKYCStatus();
      
      // If status is null, user hasn't started onboarding
      if (!status) {
        setKycStatus(null);
        return;
      }
      
      const kycStatusValue = status.user.kyc_status;
      setKycStatus(kycStatusValue);
      
      // Update user with KYC status
      setUser((currentUser) => {
        if (currentUser) {
          const updatedUser = { ...currentUser, kycStatus: kycStatusValue, riskLevel: status.user.risk_level };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        }
        return currentUser;
      });
    } catch (err: any) {
      // Handle different error scenarios gracefully
      if (err.response?.status === 404) {
        // User hasn't started onboarding yet - this is expected, not an error
        setKycStatus(null);
      } else if (err.response?.status === 400 && err.response?.data?.code === 'INVALID_USER_ID') {
        // Invalid user ID format - regenerate a valid UUID
        console.warn('Invalid user ID format detected, regenerating UUID');
        const newUser = { ...MOCK_USER, id: generateConsistentUUID('Victor') };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        setKycStatus(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication errors - user might not be logged in
        setKycStatus(null);
      } else {
        // Other errors - silently set status to null (don't block the app)
        // This prevents unnecessary console noise for expected scenarios
        setKycStatus(null);
      }
    }
  }, []);

  // Validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const expectedUUID = generateConsistentUUID(parsedUser.username || 'Victor');
        
        // Validate UUID format - if invalid, regenerate it
        if (parsedUser?.id && !isValidUUID(parsedUser.id)) {
          console.warn('Invalid UUID format detected in stored user, regenerating');
          parsedUser.id = expectedUUID;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        // If UUID doesn't match expected UUID for this username, update it
        else if (parsedUser?.id && parsedUser.id !== expectedUUID && parsedUser.username === 'Victor') {
          console.warn('UUID mismatch detected for Victor, updating to correct UUID');
          parsedUser.id = expectedUUID;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
        // Try to load KYC status if user exists and has valid UUID
        if (parsedUser?.id && isValidUUID(parsedUser.id)) {
          checkKYCStatus();
        }
      } catch (e) {
        // If parsing fails, clear invalid data
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, [checkKYCStatus]);

  const login = useCallback(async (username: string, password: string) => {
    // For demo purposes, only accept Victor/VictorVic
    if (username === 'Victor' && password === 'VictorVic') {
      // Check if user already exists in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const expectedUUID = generateConsistentUUID('Victor');
          
          // If UUID doesn't match expected UUID, update it
          if (parsedUser.id !== expectedUUID) {
            console.warn('UUID mismatch detected for Victor, updating to correct UUID');
            parsedUser.id = expectedUUID;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
          
          setUser(parsedUser);
        } catch (e) {
          // If parsing fails, use mock data
          console.error('Failed to parse stored user data:', e);
          setUser(MOCK_USER);
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
        }
      } else {
        // First time login, use mock data
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    // Don't remove user data from localStorage to preserve balance
    // Instead, just set the local state to null for logging out
    setUser(null);
  }, []);

  const updateUserBalance = useCallback((newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.username === 'Victor';
  }, [user]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserBalance,
    checkKYCStatus,
    kycStatus,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}