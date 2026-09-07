import React from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({
  title, subtitle, icon, action
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </h1>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
