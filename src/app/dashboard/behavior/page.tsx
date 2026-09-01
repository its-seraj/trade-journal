'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { Trade } from '@/types';
import { generateBehavioralInsights } from '@/lib/calculations/analytics';
import { BehavioralInsightCard } from '@/components/analytics/BehavioralInsightCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { BrainCircuit, AlertTriangle, ShieldAlert, Sparkles, Flame } from 'lucide-react';

export default function BehaviorPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(LocalJournalStore.getTrades());
  }, []);

  const insights = generateBehavioralInsights(trades);

  // Behavioral Stats Summary
  const followedPlanTrades = trades.filter((t) => t.psychology?.followed_plan === 'Yes');
  const violatedPlanTrades = trades.filter((t) => t.psychology?.followed_plan === 'No');

  const movedSLTrades = trades.filter((t) => t.psychology?.moved_stop_loss);
  const revengeTrades = trades.filter((t) => t.psychology?.revenge_trade);
  const fomoTrades = trades.filter((t) => t.psychology?.fomo_entry);

  const followedWinRate = followedPlanTrades.length
    ? Math.round((followedPlanTrades.filter((t) => t.net_pnl > 0).length / followedPlanTrades.length) * 100)
    : 0;
  const violatedWinRate = violatedPlanTrades.length
    ? Math.round((violatedPlanTrades.filter((t) => t.net_pnl > 0).length / violatedPlanTrades.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-rose-400" />
            Trading Psychology & Behavioral Audit
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Uncover emotional patterns, discipline leaks, and exact reasons behind losses.
          </p>
        </div>
      </div>

      {/* CORE COMPARISON GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <Card className="bg-slate-900/90 border-slate-800 space-y-2">
          <span className="text-slate-400 text-xs font-semibold block">PLAN FOLLOWED VS VIOLATED</span>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Followed Plan:</span>
              <span className="text-lg font-bold text-emerald-400">{followedWinRate}% Win Rate</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Violated Plan:</span>
              <span className="text-lg font-bold text-rose-400">{violatedWinRate}% Win Rate</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block border-t border-slate-800 pt-2">
            {followedPlanTrades.length} Plan Trades vs {violatedPlanTrades.length} Impulsive Trades
          </span>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 space-y-2">
          <span className="text-slate-400 text-xs font-semibold block">STOP-LOSS DISCIPLINE</span>
          <div className="pt-1">
            <span className="text-2xl font-bold text-rose-400">{movedSLTrades.length}</span>
            <span className="text-xs text-slate-400 ml-2">Trades where SL was moved</span>
          </div>
          <span className="text-[11px] text-slate-500 block border-t border-slate-800 pt-2">
            Total P&L Impact: {formatCurrency(movedSLTrades.reduce((a, b) => a + b.net_pnl, 0))}
          </span>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 space-y-2">
          <span className="text-slate-400 text-xs font-semibold block">FOMO & REVENGE TRADES</span>
          <div className="pt-1 flex justify-between">
            <div>
              <span className="text-xs text-slate-500 block">FOMO:</span>
              <span className="text-lg font-bold text-amber-400">{fomoTrades.length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Revenge:</span>
              <span className="text-lg font-bold text-rose-400">{revengeTrades.length}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block border-t border-slate-800 pt-2">
            Combined Loss: {formatCurrency(fomoTrades.concat(revengeTrades).reduce((a, b) => a + b.net_pnl, 0))}
          </span>
        </Card>
      </div>

      {/* DETECTED BEHAVIORAL INSIGHT CARDS LIST */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Automated Behavioral Insights ({insights.length})
        </h3>

        {!insights.length ? (
          <Card className="text-center py-12 text-slate-400 font-mono text-xs">
            Not enough trade data yet. Record at least 5-10 trades to identify behavioral patterns.
          </Card>
        ) : (
          <div className="space-y-4">
            {insights.map((ins) => (
              <BehavioralInsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
