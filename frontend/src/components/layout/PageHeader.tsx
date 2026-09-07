import React from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({
  title, subtitle, icon, action
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-xl font-semibold text-[#111111] flex items-center gap-2 tracking-tight">
        {icon}
        <span>{title}</span>
      </h1>
      {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
