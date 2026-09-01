import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  isCurrency?: boolean;
  type?: 'pnl' | 'metric' | 'percentage' | 'neutral';
  numericValue?: number;
  icon?: React.ElementType;
  tooltip?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  isCurrency,
  type = 'metric',
  numericValue,
  icon: Icon,
}: StatCardProps) {
  let valueColor = 'text-slate-100';
  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

  if (type === 'pnl' && numericValue !== undefined) {
    if (numericValue > 0) {
      valueColor = 'text-emerald-400';
      badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (numericValue < 0) {
      valueColor = 'text-rose-400';
      badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  }

  const formattedValue =
    isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 font-medium tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className={cn('text-2xl font-bold tracking-tight font-mono', valueColor)}>
          {formattedValue}
        </span>
        {numericValue !== undefined && type === 'pnl' && (
          <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1', badgeColor)}>
            {numericValue > 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : numericValue < 0 ? (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            ) : (
              <Minus className="w-3 h-3 text-slate-400" />
            )}
          </span>
        )}
      </div>

      {subValue && (
        <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
          {subValue}
        </p>
      )}
    </Card>
  );
}
