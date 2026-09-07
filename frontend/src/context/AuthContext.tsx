'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, Organization } from '../types/crm';
import { initialOrganization, initialUsers } from '../lib/initialData';

interface AuthContextType {
  user: User;
  organization: Organization;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(initialUsers[0]);
  const [organization] = useState<Organization>(initialOrganization);

  const logout = () => {
    console.log('Logged out user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      setUser,
      isAuthenticated: true,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
