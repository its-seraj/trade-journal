'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { TimeSlotStat } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface HourlyDistributionChartProps {
  slots: TimeSlotStat[];
}

export function HourlyDistributionChart({ slots }: HourlyDistributionChartProps) {
  if (!slots.length) return null;

  const width = 800;
  const height = 220;
  const padding = 40;

  const pnls = slots.map((s) => s.totalPnL);
  const maxPnL = Math.max(1000, ...pnls);
  const minPnL = Math.min(-1000, ...pnls);
  const range = maxPnL - minPnL || 1;

  const barWidth = Math.min(60, (width - 2 * padding) / slots.length - 15);

  const getX = (idx: number) => padding + idx * ((width - 2 * padding) / slots.length) + 10;
  const getY = (val: number) => height - padding - ((val - minPnL) / range) * (height - 2 * padding);
  const zeroY = getY(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Time of Day Performance
        </CardTitle>
        <span className="text-xs text-slate-400 font-mono">
          Identify profitable trading windows vs unprofitable hours
        </span>
      </CardHeader>

      <div className="relative w-full mt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-60 overflow-visible">
          {/* Baseline */}
          <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeDasharray="4 4" />

          {/* Bars */}
          {slots.map((s, idx) => {
            const x = getX(idx);
            const y = getY(s.totalPnL);
            const barHeight = Math.abs(y - zeroY);
            const rectY = s.totalPnL >= 0 ? y : zeroY;
            const fill = s.totalPnL >= 0 ? '#10b981' : '#f43f5e';

            return (
              <g key={s.slot} className="group">
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
                  className="text-[10px] font-mono"
                >
                  {s.slot}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
