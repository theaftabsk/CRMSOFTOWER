import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(val: number, currency: string = '₹'): string {
  if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`;
  return `${currency}${val.toLocaleString()}`;
}
