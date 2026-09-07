import React from 'react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`space-y-6 text-slate-100 pb-12 ${className}`}>
    {children}
  </div>
);
