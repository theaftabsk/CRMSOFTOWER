import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val || 0);
  return num.toLocaleString('en-IN');
}

export function formatCurrency(val: number | string | undefined | null, currency: string = '₹'): string {
  const num = Number(val || 0);
  if (num >= 100000) return `${currency}${(num / 100000).toFixed(1)}L`;
  return `${currency}${num.toLocaleString('en-IN')}`;
}
