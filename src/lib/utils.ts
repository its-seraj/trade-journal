import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(abs);
  
  return isNegative ? `-${formatted}` : `+${formatted}`;
}

export function formatRawCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getPnLColorClass(amount: number): string {
  if (amount > 0) return 'text-emerald-400 font-semibold';
  if (amount < 0) return 'text-rose-400 font-semibold';
  return 'text-slate-400 font-medium';
}

export function getPnLBgClass(amount: number): string {
  if (amount > 0) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  if (amount < 0) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  return 'bg-slate-800/40 border-slate-700/30 text-slate-400';
}
