import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      default: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      outline: 'border border-slate-700 hover:bg-slate-800/80 text-slate-300',
      ghost: 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-xs',
      lg: 'px-6 py-2.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
