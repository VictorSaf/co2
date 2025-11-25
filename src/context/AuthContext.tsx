import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for Victor
const MOCK_USER: User = {
  id: '1',
  username: 'Victor',
  balance: 100000000, // 100 million EUR
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    // For demo purposes, only accept Victor/VictorVic
    if (username === 'Victor' && password === 'VictorVic') {
      // Check if user already exists in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserBalance,
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