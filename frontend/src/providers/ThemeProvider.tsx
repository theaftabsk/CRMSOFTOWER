'use client';

import React from 'react';
import { CRMProvider } from '../context/CRMContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CRMProvider>{children}</CRMProvider>;
};
