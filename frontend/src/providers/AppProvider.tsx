'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CRMProvider } from '../context/CRMContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CRMProvider>
        {children}
      </CRMProvider>
    </AuthProvider>
  );
};
