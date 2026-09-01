'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { Trade } from '@/types';
import {
  calculateStrategyStats,
  calculateTimeSlotStats,
  calculateDayOfWeekStats,
} from '@/lib/calculations/analytics';
import { StrategyPerformanceChart } from '@/components/analytics/StrategyPerformanceChart';
import { HourlyDistributionChart } from '@/components/analytics/HourlyDistributionChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, getPnLColorClass } from '@/lib/utils';
import { BarChart3, PieChart, Layers, Calendar, Compass } from 'lucide-react';

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(LocalJournalStore.getTrades());
  }, []);

  const strategyStats = calculateStrategyStats(trades);
  const timeSlotStats = calculateTimeSlotStats(trades);
  const dayOfWeekStats = calculateDayOfWeekStats(trades);

  // Long vs Short
  const longTrades = trades.filter((t) => t.position_type === 'Long');
  const shortTrades = trades.filter((t) => t.position_type === 'Short');
  const longPnL = longTrades.reduce((a, b) => a + b.net_pnl, 0);
  const shortPnL = shortTrades.reduce((a, b) => a + b.net_pnl, 0);

  // CE vs PE
  const ceTrades = trades.filter((t) => t.option_type === 'CE');
  const peTrades = trades.filter((t) => t.option_type === 'PE');
  const cePnL = ceTrades.reduce((a, b) => a + b.net_pnl, 0);
  const pePnL = peTrades.reduce((a, b) => a + b.net_pnl, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Performance Analytics Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Breakdown performance by strategy expectancy, time slot, day of week, and option type.
          </p>
        </div>
      </div>

      {/* STRATEGY PERFORMANCE & EXPECTANCY CHART */}
      <StrategyPerformanceChart stats={strategyStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIME OF DAY HOURLY CHART */}
        <HourlyDistributionChart slots={timeSlotStats} />

        {/* DAY OF WEEK PERFORMANCE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Day of Week Performance
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">P&L distribution across trading days</span>
          </CardHeader>
          <div className="space-y-3 mt-4 text-xs font-mono">
            {dayOfWeekStats.map((d) => (
              <div key={d.day} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div>
                  <span className="font-bold text-slate-200 block">{d.day}</span>
                  <span className="text-[10px] text-slate-500">{d.tradeCount} trades | Win Rate: {d.winRate}%</span>
                </div>
                <span className={`font-bold text-sm ${getPnLColorClass(d.totalPnL)}`}>
                  {formatCurrency(d.totalPnL)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* COMPARISON CARDS: Long vs Short & CE vs PE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Long vs Short */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Long vs Short Position Comparison
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 mt-2 text-xs font-mono">
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">LONG POSITIONS</span>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(longPnL)}</p>
              <span className="text-[11px] text-slate-500 block">
                {longTrades.length} Trades | Win Rate: {longTrades.length ? Math.round((longTrades.filter((t) => t.net_pnl > 0).length / longTrades.length) * 100) : 0}%
              </span>
            </div>

            <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">SHORT POSITIONS</span>
              <p className="text-lg font-bold text-rose-400">{formatCurrency(shortPnL)}</p>
              <span className="text-[11px] text-slate-500 block">
                {shortTrades.length} Trades | Win Rate: {shortTrades.length ? Math.round((shortTrades.filter((t) => t.net_pnl > 0).length / shortTrades.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>

        {/* CE vs PE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Call (CE) vs Put (PE) Options Breakdown
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 mt-2 text-xs font-mono">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">CALL (CE) OPTIONS</span>
              <p className={`text-lg font-bold ${getPnLColorClass(cePnL)}`}>{formatCurrency(cePnL)}</p>
              <span className="text-[11px] text-slate-500 block">
                {ceTrades.length} Trades | Win Rate: {ceTrades.length ? Math.round((ceTrades.filter((t) => t.net_pnl > 0).length / ceTrades.length) * 100) : 0}%
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">PUT (PE) OPTIONS</span>
              <p className={`text-lg font-bold ${getPnLColorClass(pePnL)}`}>{formatCurrency(pePnL)}</p>
              <span className="text-[11px] text-slate-500 block">
                {peTrades.length} Trades | Win Rate: {peTrades.length ? Math.round((peTrades.filter((t) => t.net_pnl > 0).length / peTrades.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
