'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Trade } from '@/types';
import { generateEquityCurve } from '@/lib/calculations/analytics';
import { formatCurrency, formatRawCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface EquityCurveProps {
  trades: Trade[];
}

export function EquityCurveChart({ trades }: EquityCurveProps) {
  const [timeframe, setTimeframe] = useState<string>('All');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const data = generateEquityCurve(trades, timeframe);
  const filterOptions = ['1W', '1M', '3M', '6M', 'All'];

  if (!data.length) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Performance Equity Curve
          </CardTitle>
        </CardHeader>
        <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
          No trade data recorded for selected timeframe
        </div>
      </Card>
    );
  }

  // Calculate SVG bounds & scaling
  const width = 800;
  const height = 240;
  const padding = 40;

  const cumValues = data.map((d) => d.cumulativePnL);
  const minCum = Math.min(0, ...cumValues);
  const maxCum = Math.max(1000, ...cumValues);
  const rangeCum = maxCum - minCum || 1;

  const getX = (idx: number) => padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - ((val - minCum) / rangeCum) * (height - 2 * padding);

  // Generate cubic bezier path for smooth equity line
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.cumulativePnL), data: d }));
  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  // Fill area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Performance Equity Curve
          </CardTitle>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cumulative Net P&L Trajectory ({data.length} Trading Sessions)
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeframe(opt)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                timeframe === opt
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="relative w-full mt-4">
        {/* Interactive Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-2xl text-xs font-mono space-y-1 min-w-44 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 10}px`,
            }}
          >
            <div className="text-slate-400 border-b border-slate-800 pb-1 font-semibold">{hoveredPoint.data.date}</div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Cumulative P&L:</span>
              <span className="font-bold">{formatCurrency(hoveredPoint.data.cumulativePnL)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Daily P&L:</span>
              <span className={hoveredPoint.data.dailyPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(hoveredPoint.data.dailyPnL)}
              </span>
            </div>
          </div>
        )}

        {/* SVG Equity Curve Chart */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72 overflow-visible">
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeDasharray="4 4" />

          {/* Zero baseline line */}
          <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

          {/* Filled Gradient Area */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Cumulative Equity Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

          {/* Interactive Data Nodes */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-indigo-400 stroke-slate-900 stroke-2 hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}
