'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StrategyStat } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Target } from 'lucide-react';

interface StrategyPerformanceChartProps {
  stats: StrategyStat[];
}

export function StrategyPerformanceChart({ stats }: StrategyPerformanceChartProps) {
  if (!stats.length) return null;

  const width = 800;
  const height = 240;
  const padding = 40;

  const pnls = stats.map((s) => s.totalPnL);
  const maxPnL = Math.max(1000, ...pnls);
  const minPnL = Math.min(-1000, ...pnls);
  const range = maxPnL - minPnL || 1;

  const barWidth = Math.min(60, (width - 2 * padding) / stats.length - 15);

  const getX = (idx: number) => padding + idx * ((width - 2 * padding) / stats.length) + 10;
  const getY = (val: number) => height - padding - ((val - minPnL) / range) * (height - 2 * padding);
  const zeroY = getY(0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          Strategy Performance & Expectancy
        </CardTitle>
        <span className="text-xs text-slate-400 font-mono">
          Expectancy = (Win Rate × Avg Win) − (Loss Rate × Avg Loss)
        </span>
      </CardHeader>

      <div className="relative w-full mt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
          {/* Zero line */}
          <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeDasharray="4 4" />

          {/* Bars */}
          {stats.map((s, idx) => {
            const x = getX(idx);
            const y = getY(s.totalPnL);
            const barHeight = Math.abs(y - zeroY);
            const rectY = s.totalPnL >= 0 ? y : zeroY;
            const fill = s.totalPnL >= 0 ? '#10b981' : '#f43f5e';

            return (
              <g key={s.strategy} className="group">
                <rect
                  x={x}
                  y={rectY}
                  width={barWidth}
                  height={Math.max(4, barHeight)}
                  rx="4"
                  fill={fill}
                  className="opacity-80 hover:opacity-100 transition-all cursor-pointer"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 15}
                  textAnchor="middle"
                  fill="#94a3b8"
                  className="text-[11px] font-mono"
                >
                  {s.strategy}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Expectancy Stats Table */}
      <div className="mt-4 border-t border-slate-800 pt-4 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800 pb-2 uppercase text-[10px]">
              <th className="py-2">Strategy</th>
              <th className="py-2">Trades</th>
              <th className="py-2">Win Rate</th>
              <th className="py-2 text-right">Total P&L</th>
              <th className="py-2 text-center">Profit Factor</th>
              <th className="py-2 text-right">Expectancy / Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stats.map((s) => (
              <tr key={s.strategy} className="hover:bg-slate-900/40">
                <td className="py-2.5 font-bold text-slate-200">{s.strategy}</td>
                <td className="py-2.5 text-slate-400">{s.tradeCount}</td>
                <td className="py-2.5 text-indigo-400 font-bold">{s.winRate}%</td>
                <td className={`py-2.5 text-right font-bold ${s.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(s.totalPnL)}
                </td>
                <td className="py-2.5 text-center font-bold text-slate-300">{s.profitFactor}</td>
                <td className="py-2.5 text-right font-bold text-emerald-400">
                  ₹{s.expectancy} <span className="text-[10px] text-slate-500 font-normal">({s.expectancyR}R)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
