'use client';

import React, { useState } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings, Database, RefreshCw, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all trades and daily journal entries to start fresh?')) {
      LocalJournalStore.clearAllData();
      setStatusMessage('All data cleared! Your journal is now completely fresh.');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    }
  };

  const handleLoadSampleData = () => {
    if (confirm('Load sample trades & daily reviews for testing?')) {
      LocalJournalStore.initializeData(true);
      setStatusMessage('Sample demo data loaded successfully!');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Journal Settings & Data Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal trading journal data and storage options.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATA MANAGEMENT */}
        <Card className="border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center gap-2">
              <Database className="w-4 h-4" /> Personal Journal Data
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs mt-3">
            <p className="text-slate-300 leading-relaxed">
              Clear your journal to start fresh with a clean slate, or optionally load sample data for testing.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleClearData}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-4 h-4" /> Clear All Data & Start Fresh
              </button>

              <button
                onClick={handleLoadSampleData}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" /> Load Sample Demo Data (Optional)
              </button>
            </div>
          </div>
        </Card>

        {/* CLOUD CONNECTION STATUS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cloud Database Connection
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs mt-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 block text-[10px]">SUPABASE DATABASE URL</span>
              <span className="text-slate-200 font-bold break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured via .env.local'}
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 block text-[10px]">SUPABASE SCHEMA</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready in supabase/schema.sql
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
