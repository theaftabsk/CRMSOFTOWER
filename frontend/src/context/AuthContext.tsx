'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  organizationId: string;
  organizationName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  organization: { id: string; name: string };
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, organizationName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { setActiveOrgId } from '../lib/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        if (data.user.organizationId) {
          setActiveOrgId(data.user.organizationId);
        }
        try {
          localStorage.setItem('crm_user', JSON.stringify(data.user));
        } catch {}
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { 
          success: false, 
          error: data.message || 'Invalid email or password' 
        };
      }

      setUser(data.user);
      if (data.user?.organizationId) {
        setActiveOrgId(data.user.organizationId);
      }
      try {
        localStorage.setItem('crm_user', JSON.stringify(data.user));
      } catch {}
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: 'Failed to connect to authentication server' 
      };
    }
  };

  const register = async (name: string, email: string, password: string, organizationName?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, organizationName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { 
          success: false, 
          error: data.message || 'Registration failed' 
        };
      }

      setUser(data.user);
      if (data.user?.organizationId) {
        setActiveOrgId(data.user.organizationId);
      }
      try {
        localStorage.setItem('crm_user', JSON.stringify(data.user));
      } catch {}
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: 'Failed to connect to server' 
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setActiveOrgId('');
      try {
        localStorage.removeItem('crm_user');
        localStorage.removeItem('crm_current_org_id');
      } catch {}
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization: {
          id: user?.organizationId || '',
          name: user?.organizationName || (user?.name ? `${user.name}'s Workspace` : 'Workspace'),
        },
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
