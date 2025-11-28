import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginData, RegisterData } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (user) {
      // Refresh token every 10 minutes
      const interval = setInterval(async () => {
        const result = await authService.refreshToken();
        if (result.error) {
          console.error('Token refresh failed:', result.error);
          handleLogout();
        }
      }, 10 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUser = async () => {
    setIsLoading(true);
    
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const result = await authService.getCurrentUser();
    
    if (result.user) {
      setUser(result.user);
      // Initialize Socket.IO connection
      initializeSocket();
    } else {
      // Try to refresh token
      const refreshResult = await authService.refreshToken();
      if (refreshResult.accessToken) {
        const userResult = await authService.getCurrentUser();
        if (userResult.user) {
          setUser(userResult.user);
          // Initialize Socket.IO connection
          initializeSocket();
        }
      }
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (data: LoginData): Promise<boolean> => {
    const result = await authService.login(data);
    
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    
    if (result.user) {
      setUser(result.user);
      // Initialize Socket.IO connection
      initializeSocket();
      toast.success('Login successful!');
      return true;
    }
    
    return false;
  };

  const handleRegister = async (data: RegisterData): Promise<boolean> => {
    const result = await authService.register(data);
    
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    
    if (result.user) {
      toast.success('Registration successful! Please login.');
      return true;
    }
    
    return false;
  };

  const handleLogout = async () => {
    await authService.logout();
    disconnectSocket();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};