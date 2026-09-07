import * as React from 'react';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white border border-[#E5E5E5] rounded-[10px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:border-[#D4D4D4] ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`border-b border-[#E5E5E5] pb-3 mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <h3 className={`text-sm font-semibold text-[#111111] flex items-center gap-2 ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <p className={`text-xs text-[#666666] mt-1 ${className}`}>{children}</p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);
