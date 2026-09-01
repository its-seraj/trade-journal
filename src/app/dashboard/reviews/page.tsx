'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { Trade } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, getPnLColorClass } from '@/lib/utils';
import { calculateStrategyStats, calculateTimeSlotStats } from '@/lib/calculations/analytics';
import { CalendarRange, Award, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export default function ReviewsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [reviewTab, setReviewTab] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    setTrades(LocalJournalStore.getTrades());
  }, []);

  const risk = LocalJournalStore.getRiskSettings();
  const startingCapital = risk.capital || 150000;
  const netPnL = trades.reduce((a, b) => a + b.net_pnl, 0);
  const endingCapital = startingCapital + netPnL;
  const returnPercent = Number(((netPnL / startingCapital) * 100).toFixed(1));

  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const winRate = trades.length ? Math.round((wins.length / trades.length) * 100) : 0;

  const strategyStats = calculateStrategyStats(trades);
  const bestStrategy = strategyStats.length ? [...strategyStats].sort((a, b) => b.totalPnL - a.totalPnL)[0] : null;
  const worstStrategy = strategyStats.length ? [...strategyStats].sort((a, b) => a.totalPnL - b.totalPnL)[0] : null;

  const timeSlots = calculateTimeSlotStats(trades);
  const bestSlot = timeSlots.length ? [...timeSlots].sort((a, b) => b.totalPnL - a.totalPnL)[0] : null;
  const worstSlot = timeSlots.length ? [...timeSlots].sort((a, b) => a.totalPnL - b.totalPnL)[0] : null;

  // Best day & Worst day
  const datePnLMap = new Map<string, number>();
  trades.forEach((t) => {
    datePnLMap.set(t.trade_date, (datePnLMap.get(t.trade_date) || 0) + t.net_pnl);
  });
  const dateEntries = Array.from(datePnLMap.entries());
  const bestDay = dateEntries.length ? [...dateEntries].sort((a, b) => b[1] - a[1])[0] : null;
  const worstDay = dateEntries.length ? [...dateEntries].sort((a, b) => a[1] - b[1])[0] : null;

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-400" />
            Periodic Performance Reviews
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured Weekly & Monthly summaries with capital growth tracking.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setReviewTab('weekly')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              reviewTab === 'weekly' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setReviewTab('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              reviewTab === 'monthly' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {/* CAPITAL GROWTH SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase">Starting Capital</span>
          <p className="text-xl font-bold text-slate-200 mt-1">{formatCurrency(startingCapital)}</p>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase">Net Performance P&L</span>
          <p className={`text-xl font-bold mt-1 ${getPnLColorClass(netPnL)}`}>{formatCurrency(netPnL)}</p>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase">Ending Capital</span>
          <p className="text-xl font-bold text-indigo-400 mt-1">{formatCurrency(endingCapital)}</p>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase">Account Return %</span>
          <p className={`text-xl font-bold mt-1 ${returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {returnPercent > 0 ? `+${returnPercent}%` : `${returnPercent}%`}
          </p>
        </Card>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Top Drivers & Best Parameters
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 mt-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Best Strategy:</span>
              <span className="font-bold text-emerald-400">
                {bestStrategy ? `${bestStrategy.strategy} (${formatCurrency(bestStrategy.totalPnL)})` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Best Trading Window:</span>
              <span className="font-bold text-emerald-400">
                {bestSlot ? `${bestSlot.slot} (${formatCurrency(bestSlot.totalPnL)})` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Single Best Day:</span>
              <span className="font-bold text-emerald-400">
                {bestDay ? `${bestDay[0]} (${formatCurrency(bestDay[1])})` : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Worst Parameters & Leaks
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 mt-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Worst Strategy:</span>
              <span className="font-bold text-rose-400">
                {worstStrategy ? `${worstStrategy.strategy} (${formatCurrency(worstStrategy.totalPnL)})` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Worst Trading Window:</span>
              <span className="font-bold text-rose-400">
                {worstSlot ? `${worstSlot.slot} (${formatCurrency(worstSlot.totalPnL)})` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400">Single Worst Day:</span>
              <span className="font-bold text-rose-400">
                {worstDay ? `${worstDay[0]} (${formatCurrency(worstDay[1])})` : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
