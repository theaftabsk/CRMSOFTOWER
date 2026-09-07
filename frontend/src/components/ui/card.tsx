import * as React from 'react';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`border-b border-slate-800/80 pb-4 mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <h3 className={`text-sm font-bold text-slate-100 flex items-center gap-2 ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <p className={`text-xs text-slate-400 mt-1 ${className}`}>{children}</p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);
