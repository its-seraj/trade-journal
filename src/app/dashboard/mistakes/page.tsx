'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, ShieldAlert, Flame, CheckCircle2, TrendingDown } from 'lucide-react';

export default function MistakesPage() {
  const [frequencies, setFrequencies] = useState<{ mistake: string; count: number }[]>([]);
  const [repeatedAlerts, setRepeatedAlerts] = useState<string[]>([]);

  useEffect(() => {
    const freq = LocalJournalStore.getMistakeFrequencies();
    setFrequencies(freq);

    const alerts = LocalJournalStore.getRepeatedMistakesAlerts();
    setRepeatedAlerts(alerts);
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          Mistake History & Pattern Audit
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Making recurring bad trading behavior impossible to ignore
        </p>
      </div>

      {/* Repeated Mistakes Alert Banner Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Repeated Mistakes Alerts (Last 10 Trading Sessions)
        </h2>

        {repeatedAlerts.length > 0 ? (
          <div className="grid gap-3">
            {repeatedAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border border-rose-800/80 p-5 rounded-2xl shadow-xl flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                    ⚠️ Repeated Behavior Warning
                  </span>
                  <p className="text-sm font-bold font-mono text-rose-100 mt-0.5">
                    {alert}
                  </p>
                  <p className="text-xs font-mono text-rose-300/80 mt-1">
                    This mistake has recurred across multiple sessions. Commit to eliminating this specific mistake in tomorrow's journal.
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-6 rounded-2xl font-mono text-xs text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>No repeated mistakes detected in your recent 10 trading sessions. Excellent discipline!</span>
          </div>
        )}
      </div>

      {/* Most Common Mistakes Frequency Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-200">
            Most Common Trading Mistakes (All-Time Frequency)
          </CardTitle>
        </CardHeader>

        {frequencies.length === 0 ? (
          <div className="p-8 text-center font-mono text-slate-500 text-xs">
            No mistakes recorded yet. Keep logging daily journals!
          </div>
        ) : (
          <div className="space-y-3">
            {frequencies.map((item, idx) => {
              const maxCount = frequencies[0].count || 1;
              const pct = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.mistake} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-slate-200">{item.mistake}</span>
                    <span className="font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
                      {item.count} occurrences
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
