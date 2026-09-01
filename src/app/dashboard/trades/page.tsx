'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalJournalStore } from '@/lib/store/localStore';
import { TradeTable } from '@/components/trades/TradeTable';
import { Trade } from '@/types';
import { Plus, TableProperties } from 'lucide-react';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  const loadTrades = () => {
    setTrades(LocalJournalStore.getTrades());
  };

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-indigo-400" />
            Trade Journal Ledger
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Search, filter, analyze, and export your entire executed trade history.
          </p>
        </div>

        <Link href="/dashboard/trades/new">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono rounded-xl shadow-lg flex items-center gap-2 transition-all">
            <Plus className="w-4 h-4" />
            Add Trade Entry
          </button>
        </Link>
      </div>

      <TradeTable trades={trades} onTradesUpdated={loadTrades} />
    </div>
  );
}
