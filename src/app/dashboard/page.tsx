'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalJournalStore } from '@/lib/store/localStore';
import { DailyJournal, Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpenCheck,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Flame,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [todayJournal, setTodayJournal] = useState<DailyJournal | null>(null);
  const [yesterdayJournal, setYesterdayJournal] = useState<DailyJournal | null>(null);
  const [todayTrades, setTodayTrades] = useState<Trade[]>([]);
  const [repeatedAlerts, setRepeatedAlerts] = useState<string[]>([]);
  const [topMistake, setTopMistake] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    async function loadData() {
      const journals = await LocalJournalStore.fetchJournalsAsync();
      const todayJ = LocalJournalStore.getJournalByDate(todayStr) || journals[0];
      setTodayJournal(todayJ || null);

      const yestJ = LocalJournalStore.getYesterdayJournal(todayStr);
      setYesterdayJournal(yestJ || null);

      const trades = await LocalJournalStore.fetchTradesAsync();
      const tTrades = trades.filter((t) => t.trade_date === (todayJ ? todayJ.journal_date : todayStr));
      setTodayTrades(tTrades);

      const alerts = LocalJournalStore.getRepeatedMistakesAlerts();
      setRepeatedAlerts(alerts);

      const freq = LocalJournalStore.getMistakeFrequencies();
      if (freq.length > 0) {
        setTopMistake(freq[0].mistake);
      }
    }
    loadData();
  }, [todayStr]);

  const isCompleted = todayJournal ? todayJournal.completed : false;
  const todayPnL = todayJournal?.daily_pnl ?? todayTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const tradeCount = todayJournal?.trade_count ?? todayTrades.length;
  const disciplineScore = todayJournal?.discipline_score ?? 7;
  const mistakeCount = todayJournal?.selected_mistakes?.length ?? (todayJournal?.biggest_mistake && todayJournal.biggest_mistake !== 'None' ? 1 : 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Date Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formattedTodayDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-3">
            Today's Trading Review
          </h1>
        </div>

        {/* Status Badge & Action */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border ${
              isCompleted
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Journal Completed</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Journal Pending</span>
              </>
            )}
          </div>

          <Link
            href="/dashboard/daily-review"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>{isCompleted ? "Edit Today's Journal" : "Complete Today's Journal"}</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Net P&L */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Today's Net P&L
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                todayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(todayPnL)}
            </span>
          </div>
        </div>

        {/* Total Trades */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Trades
          </span>
          <span className="text-2xl font-bold font-mono text-slate-100">{tradeCount}</span>
        </div>

        {/* Discipline Score */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Discipline Score
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                disciplineScore >= 8
                  ? 'text-emerald-400'
                  : disciplineScore >= 6
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {disciplineScore}/10
            </span>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  disciplineScore >= 8 ? 'bg-emerald-400' : disciplineScore >= 6 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${disciplineScore * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mistakes Count */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Mistakes Identified
          </span>
          <span
            className={`text-2xl font-bold font-mono ${
              mistakeCount === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {mistakeCount}
          </span>
        </div>
      </div>

      {/* Prominent Accountability Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Biggest Mistake */}
        <div className="bg-gradient-to-br from-rose-950/40 via-[#111827] to-[#111827] border border-rose-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-semibold mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span className="uppercase tracking-wider">Today's Biggest Mistake</span>
          </div>
          {todayJournal?.biggest_mistake && todayJournal.biggest_mistake !== 'None' ? (
            <div className="space-y-3">
              <p className="text-lg font-bold text-rose-200 font-mono leading-relaxed">
                "{todayJournal.biggest_mistake}"
              </p>
              {todayJournal.why_made_mistake && (
                <div className="bg-rose-950/30 border border-rose-900/30 p-3 rounded-xl">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold block mb-0.5">
                    Why it happened:
                  </span>
                  <p className="text-xs text-rose-300 font-mono">{todayJournal.why_made_mistake}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm font-mono text-slate-400 italic">
                {isCompleted
                  ? "No major mistakes recorded for today. Great discipline!"
                  : "Complete today's journal to record today's biggest mistake."}
              </p>
            </div>
          )}
        </div>

        {/* Tomorrow's Actionable Rule */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-[#111827] to-[#111827] border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider">Tomorrow's Rule</span>
          </div>
          {todayJournal?.tomorrow_rule ? (
            <div className="space-y-3">
              <p className="text-lg font-bold text-indigo-200 font-mono leading-relaxed">
                "{todayJournal.tomorrow_rule}"
              </p>
              <div className="bg-indigo-950/30 border border-indigo-900/30 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-indigo-300">
                <span>Rule Commitment</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm font-mono text-slate-400 italic">
                {isCompleted
                  ? "No rule set for tomorrow yet."
                  : "Complete today's journal to set a short, actionable rule for tomorrow."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yesterday's Rule Follow-Up Card */}
      {yesterdayJournal && yesterdayJournal.tomorrow_rule && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold block">
                Yesterday's Rule Feedback Loop
              </span>
              <p className="text-base font-bold text-slate-200 font-mono mt-1">
                "{yesterdayJournal.tomorrow_rule}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Did you follow it today?</span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                  todayJournal?.followed_yesterday_rule === 'Yes'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : todayJournal?.followed_yesterday_rule === 'No'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {todayJournal?.followed_yesterday_rule || 'Pending Answer'}
              </span>
            </div>
          </div>
          {todayJournal?.yesterday_rule_notes && (
            <p className="text-xs font-mono text-slate-400 italic">
              Notes: "{todayJournal.yesterday_rule_notes}"
            </p>
          )}
        </div>
      )}

      {/* Simple Actionable Insights Section */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Pattern Observations & Insights
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {repeatedAlerts.length > 0 ? (
            repeatedAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Repeated Pattern</span>
                <p className="text-xs font-mono text-amber-200 leading-relaxed">{alert}</p>
              </div>
            ))
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl col-span-full">
              <p className="text-xs font-mono text-slate-400">
                {topMistake
                  ? `Your most recorded mistake overall is "${topMistake}". Keep focusing on eliminating it.`
                  : "Not enough journal history to identify a reliable mistake pattern yet. Keep logging daily!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
