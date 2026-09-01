'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { RuleViolation, Trade } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { ShieldAlert, AlertOctagon, TrendingDown, CheckCircle } from 'lucide-react';

export default function ViolationsPage() {
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setViolations(LocalJournalStore.getViolations());
    setTrades(LocalJournalStore.getTrades());
  }, []);

  const totalPnlImpact = violations.reduce((a, b) => a + b.pnl_impact, 0);

  // Group violations by violation_name
  const violationCounts = new Map<string, { count: number; pnl: number }>();
  violations.forEach((v) => {
    const existing = violationCounts.get(v.violation_name) || { count: 0, pnl: 0 };
    violationCounts.set(v.violation_name, {
      count: existing.count + 1,
      pnl: existing.pnl + v.pnl_impact,
    });
  });

  const sortedViolations = Array.from(violationCounts.entries()).sort((a, b) => b[1].count - a[1].count);
  const mostCommon = sortedViolations.length ? sortedViolations[0][0] : 'None';

  // Bad trade following plan vs breaking plan
  const badTradesFollowingPlan = trades.filter((t) => t.net_pnl < 0 && t.psychology?.followed_plan === 'Yes');
  const badTradesBreakingPlan = trades.filter((t) => t.net_pnl < 0 && t.psychology?.followed_plan === 'No');

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Rule Violation Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quantifying the exact cost of discipline failure vs acceptable setup losses.
          </p>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-rose-950/20 border-rose-800/40">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Total Cost of Violations</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalPnlImpact)}</p>
          <span className="text-[11px] text-slate-500 block mt-1">{violations.length} Recorded Infractions</span>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Most Common Violation</span>
          <p className="text-base font-bold text-amber-400 mt-2 truncate">{mostCommon}</p>
          <span className="text-[11px] text-slate-500 block mt-1">Primary Discipline Leak</span>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Distinction Audit</span>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Bad Trade (Followed Plan):</span>
              <span className="font-bold text-emerald-400">{badTradesFollowingPlan.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bad Trade (Broke Plan):</span>
              <span className="font-bold text-rose-400">{badTradesBreakingPlan.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* CRITICAL DISTINCTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/30 bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Acceptable Losses (Followed Plan)
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-slate-300 leading-relaxed">
            These are losing trades where you executed your setup, defined stop-loss, and managed risk correctly. Losing money here is a standard cost of doing business.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-bold text-emerald-400">
            <span>Acceptable Losses Count: {badTradesFollowingPlan.length}</span>
            <span>Total: {formatCurrency(badTradesFollowingPlan.reduce((a, b) => a + b.net_pnl, 0))}</span>
          </div>
        </Card>

        <Card className="border-rose-500/30 bg-rose-950/10">
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Unacceptable Losses (Rule Violations)
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-slate-300 leading-relaxed">
            These losses occurred because of FOMO, moving stop-loss, revenge trading, or over-leveraging. Eliminating these alone instantly turns your account profitable!
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-bold text-rose-400">
            <span>Violated Losses Count: {badTradesBreakingPlan.length}</span>
            <span>Total: {formatCurrency(badTradesBreakingPlan.reduce((a, b) => a + b.net_pnl, 0))}</span>
          </div>
        </Card>
      </div>

      {/* VIOLATIONS BREAKDOWN LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded Rule Violations History</CardTitle>
        </CardHeader>
        <div className="space-y-3 mt-3">
          {violations.map((v) => (
            <div key={v.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-xs">{v.violation_name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{v.notes}</span>
              </div>
              <span className="font-bold text-rose-400 text-xs">
                {formatCurrency(v.pnl_impact)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
