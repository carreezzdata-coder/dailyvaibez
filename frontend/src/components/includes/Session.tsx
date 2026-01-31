// frontend/src/contexts/Session.tsx
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface Admin {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  permissions: any[];
  last_login: string | null;
  status: string;
}

interface SessionData {
  success: boolean;
  authenticated: boolean;
  user: Admin | null;
  error: string | null;
  message: string | null;
  csrf_token: string | null;
}

interface SessionContextType {
  user: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
  checkSession: () => Promise<void>;
  login: (credentials: { identifier: string; password: string }) => Promise<SessionData>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const handleSessionResponse = useCallback((data: SessionData) => {
    if (data.success && data.authenticated && data.user) {
      setUser(data.user);
      setError(null);
      setCsrfToken(data.csrf_token);
    } else {
      setUser(null);
      setError(data.error);
      setCsrfToken(null);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        handleSessionResponse(data);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            success: false, 
            authenticated: false, 
            user: null, 
            error: `HTTP ${response.status}`,
            message: null,
            csrf_token: null
          };
        }
        
        if (response.status === 401) {
          setUser(null);
          setError(null);
          setCsrfToken(null);
        } else {
          setError(errorData.error || 'Session check failed');
        }
        
        handleSessionResponse(errorData);
      }
    } catch (err) {
      const errorData: SessionData = {
        success: false,
        authenticated: false,
        user: null,
        error: 'Network error during session check',
        message: null,
        csrf_token: null
      };
      handleSessionResponse(errorData);
    } finally {
      setIsLoading(false);
    }
  }, [handleSessionResponse]);

  const login = async (credentials: { identifier: string; password: string }): Promise<SessionData> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          identifier: credentials.identifier.trim(),
          password: credentials.password.trim()
        })
      });
      
      let data: SessionData;
      try {
        data = await response.json();
      } catch (parseError) {
        data = {
          success: false,
          authenticated: false,
          user: null,
          error: 'Invalid server response',
          message: null,
          csrf_token: null
        };
      }
      
      handleSessionResponse(data);
      return data;
      
    } catch (err) {
      const errorData: SessionData = { 
        success: false, 
        authenticated: false, 
        user: null, 
        error: 'Login request failed - network error', 
        message: null,
        csrf_token: null
      };
      handleSessionResponse(errorData);
      return errorData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      await checkSession();
      
    } catch (err) {
      setUser(null);
      setError(null);
      setCsrfToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  useEffect(() => {
    const initializeSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await checkSession();
    };
    
    initializeSession();
  }, [checkSession]);

  const value: SessionContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    csrfToken,
    checkSession,
    login,
    logout,
    refreshSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};