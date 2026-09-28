import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatCurrency(val: number | string | undefined | null, symbol: string = '₹'): string {
  return `${symbol}${formatNumber(val)}`;
}
