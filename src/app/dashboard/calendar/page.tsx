'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { DailyJournal } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 7, 1)); // Aug 2026
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(null);

  useEffect(() => {
    const list = LocalJournalStore.getJournals();
    setJournals(list);
  }, []);

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Map journals by date
  const journalMap: Record<string, DailyJournal> = {};
  journals.forEach((j) => {
    journalMap[j.journal_date] = j;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            Trading Review Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any trading day to view or inspect that day's complete journal review
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-[#111827] p-2 rounded-2xl border border-slate-800">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 min-w-28 text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 shadow-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 text-center text-xs text-slate-500 font-bold border-b border-slate-800/80 pb-3 mb-2">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-slate-950/20 rounded-xl opacity-30" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const journal = journalMap[dateStr];

            const pnl = journal?.daily_pnl || 0;
            const discipline = journal?.discipline_score || 0;
            const mistakesCount = journal?.selected_mistakes?.length || (journal?.biggest_mistake && journal.biggest_mistake !== 'None' ? 1 : 0);

            return (
              <div
                key={dateStr}
                onClick={() => journal && setSelectedJournal(journal)}
                className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-all ${
                  journal
                    ? 'cursor-pointer hover:scale-[1.02] shadow-md ' +
                      (pnl >= 0
                        ? 'bg-emerald-950/20 border-emerald-800/60 hover:border-emerald-500'
                        : 'bg-rose-950/20 border-rose-800/60 hover:border-rose-500')
                    : 'bg-slate-900/30 border-slate-800/40 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className={journal ? 'text-slate-200' : 'text-slate-600'}>{dayNum}</span>
                  {journal && (
                    <span className="text-[10px] text-indigo-400 font-normal">
                      Disc: {discipline}/10
                    </span>
                  )}
                </div>

                {journal ? (
                  <div className="space-y-0.5">
                    <div className={`text-xs font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(pnl)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {mistakesCount} {mistakesCount === 1 ? 'mistake' : 'mistakes'}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-700 italic">No journal</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspection Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Daily Review: {selectedJournal.journal_date}</h2>
              <button onClick={() => setSelectedJournal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-900 p-3 rounded-xl">
              <div>
                <span className="text-slate-500 block">P&L</span>
                <span className={`font-bold ${ (selectedJournal.daily_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(selectedJournal.daily_pnl || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Discipline</span>
                <span className="font-bold text-indigo-400">{selectedJournal.discipline_score}/10</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trades</span>
                <span className="font-bold text-slate-200">{selectedJournal.trade_count || 0}</span>
              </div>
            </div>

            {selectedJournal.biggest_mistake && (
              <div className="bg-rose-950/40 border border-rose-900/40 p-3 rounded-xl text-xs space-y-1">
                <span className="text-rose-400 font-bold">Biggest Mistake:</span>
                <p className="text-rose-200">"{selectedJournal.biggest_mistake}"</p>
              </div>
            )}

            {selectedJournal.tomorrow_rule && (
              <div className="bg-indigo-950/40 border border-indigo-900/40 p-3 rounded-xl text-xs space-y-1">
                <span className="text-indigo-400 font-bold">Tomorrow's Rule:</span>
                <p className="text-indigo-200">"{selectedJournal.tomorrow_rule}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
