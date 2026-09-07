import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className = '', variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    info: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
