'use client';

import React from 'react';
import { TradeForm } from '@/components/trades/TradeForm';
import { PlusCircle } from 'lucide-react';

export default function NewTradePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Record Detailed Trade
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Fill in execution metrics, rationale, and psychological state for automated Trade Quality Scoring.
          </p>
        </div>
      </div>

      <TradeForm />
    </div>
  );
}
