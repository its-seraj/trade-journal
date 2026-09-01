'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { DailyJournal } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import {
  History,
  Calendar,
  Filter,
  X,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export default function HistoryPage() {
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(null);

  // Filters
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterPnL, setFilterPnL] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    LocalJournalStore.fetchJournalsAsync().then((list) => {
      setJournals(list);
    });
  }, []);

  const filteredJournals = journals.filter((j) => {
    // Filter PnL
    if (filterPnL === 'profit' && (j.daily_pnl || 0) < 0) return false;
    if (filterPnL === 'loss' && (j.daily_pnl || 0) >= 0) return false;

    // Filter Discipline
    if (filterDiscipline === 'high' && (j.discipline_score || 0) < 8) return false;
    if (filterDiscipline === 'low' && (j.discipline_score || 0) >= 6) return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDate = j.journal_date.toLowerCase().includes(q);
      const matchMistake = (j.biggest_mistake || '').toLowerCase().includes(q);
      const matchText = (j.what_happened_today || '').toLowerCase().includes(q);
      if (!matchDate && !matchMistake && !matchText) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Journal History
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Chronological list of your daily trading reviews and accountability reflections
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#111827] px-3 py-1.5 rounded-xl border border-slate-800">
          Total Journals: <span className="text-white font-bold">{journals.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search dates, mistakes, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* PnL Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterPnL('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterPnL === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All P&L
            </button>
            <button
              onClick={() => setFilterPnL('profit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterPnL === 'profit' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Green
            </button>
            <button
              onClick={() => setFilterPnL('loss')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterPnL === 'loss' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Red
            </button>
          </div>

          {/* Discipline Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterDiscipline('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterDiscipline === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Scores
            </button>
            <button
              onClick={() => setFilterDiscipline('high')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterDiscipline === 'high' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Discipline 8+
            </button>
            <button
              onClick={() => setFilterDiscipline('low')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterDiscipline === 'low' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Discipline &lt; 6
            </button>
          </div>
        </div>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.length === 0 ? (
          <div className="bg-[#111827] border border-dashed border-slate-800 p-12 rounded-2xl text-center font-mono text-slate-400 text-xs">
            No daily journals found matching selected filters.
          </div>
        ) : (
          filteredJournals.map((j) => {
            const pnl = j.daily_pnl || 0;
            const mistakes = j.selected_mistakes || [];
            return (
              <div
                key={j.id}
                onClick={() => setSelectedJournal(j)}
                className="bg-[#111827] border border-slate-800/80 hover:border-indigo-600/60 rounded-2xl p-6 transition-all cursor-pointer shadow-sm hover:shadow-xl group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-indigo-400">
                      {j.journal_date.slice(8, 10)}
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {new Date(j.journal_date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-0.5">
                        <span>Trades: {j.trade_count || 0}</span>
                        <span>•</span>
                        <span>Plan Followed: {j.followed_plan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase">Net P&L</span>
                      <span className={`text-base font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(pnl)}
                      </span>
                    </div>

                    <div className="text-right font-mono border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-500 block uppercase">Discipline</span>
                      <span
                        className={`text-base font-bold ${
                          j.discipline_score >= 8
                            ? 'text-emerald-400'
                            : j.discipline_score >= 6
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {j.discipline_score}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Biggest Mistake */}
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider block">
                      Biggest Mistake:
                    </span>
                    <p className="text-xs font-mono text-rose-200 font-medium">
                      {j.biggest_mistake || (mistakes[0] ? mistakes[0] : 'None recorded')}
                    </p>
                  </div>

                  {/* Tomorrow's Rule / Lesson */}
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono font-semibold text-indigo-400 uppercase tracking-wider block">
                      Actionable Rule / Lesson:
                    </span>
                    <p className="text-xs font-mono text-indigo-200 font-medium">
                      {j.tomorrow_rule || j.what_learned || 'No rule specified'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Journal View Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase">Daily Journal Inspection</span>
                <h2 className="text-lg font-bold text-white">
                  {selectedJournal.journal_date}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Daily P&L</span>
                <span className={`font-bold text-sm ${ (selectedJournal.daily_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(selectedJournal.daily_pnl || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Discipline</span>
                <span className="font-bold text-sm text-indigo-400">{selectedJournal.discipline_score}/10</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trades Taken</span>
                <span className="font-bold text-sm text-slate-200">{selectedJournal.trade_count || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Plan Followed</span>
                <span className="font-bold text-sm text-slate-200">{selectedJournal.followed_plan}</span>
              </div>
            </div>

            {/* Yesterday's Rule Check */}
            {selectedJournal.yesterday_rule && (
              <div className="bg-indigo-950/30 border border-indigo-800/40 p-4 rounded-xl space-y-1.5 text-xs">
                <span className="text-indigo-400 font-semibold uppercase text-[10px]">Yesterday's Rule Followed?</span>
                <p className="text-indigo-200 font-bold">"{selectedJournal.yesterday_rule}"</p>
                <p className="text-slate-300">Answer: <span className="font-bold">{selectedJournal.followed_yesterday_rule}</span></p>
              </div>
            )}

            {/* Mistakes Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-rose-400 uppercase">Mistakes Selected:</span>
              {selectedJournal.selected_mistakes?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedJournal.selected_mistakes.map((m) => (
                    <span key={m} className="bg-rose-950/80 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-lg text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No mistakes selected.</p>
              )}
            </div>

            {/* Explanations */}
            {selectedJournal.what_happened_today && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">What Happened Today:</span>
                <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedJournal.what_happened_today}
                </p>
              </div>
            )}

            {selectedJournal.root_cause && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-indigo-400 uppercase">Root Cause:</span>
                <p className="text-xs text-indigo-200 font-bold">{selectedJournal.root_cause}</p>
              </div>
            )}

            {/* Reflection */}
            <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
              {selectedJournal.what_did_well && (
                <div>
                  <span className="text-slate-400 font-semibold">What done well:</span>
                  <p className="text-slate-200">{selectedJournal.what_did_well}</p>
                </div>
              )}
              {selectedJournal.what_learned && (
                <div>
                  <span className="text-slate-400 font-semibold">What learned:</span>
                  <p className="text-slate-200">{selectedJournal.what_learned}</p>
                </div>
              )}
            </div>

            {/* Tomorrow's Rule */}
            {selectedJournal.tomorrow_rule && (
              <div className="bg-indigo-950/60 border border-indigo-700 p-4 rounded-xl space-y-1">
                <span className="text-xs text-indigo-400 uppercase font-bold">Tomorrow's Actionable Rule:</span>
                <p className="text-sm font-bold text-white">"{selectedJournal.tomorrow_rule}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
