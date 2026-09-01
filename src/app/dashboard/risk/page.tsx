'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { UserRiskSettings } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Shield, Calculator, AlertTriangle, Save, CheckCircle } from 'lucide-react';

export default function RiskPage() {
  const [settings, setSettings] = useState<UserRiskSettings>(LocalJournalStore.getRiskSettings());

  // Interactive Position Sizing Calculator
  const [calcEntry, setCalcEntry] = useState<number>(140);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(120);
  const [calcLots, setCalcLots] = useState<number>(3);
  const lotSize = 50; // NIFTY lot size standard

  const calcQty = calcLots * lotSize;
  const expectedLoss = Math.abs(calcEntry - calcStopLoss) * calcQty;
  const isOverRisk = expectedLoss > settings.max_risk_per_trade;

  const handleSave = () => {
    LocalJournalStore.saveRiskSettings(settings);
    alert('Risk management settings updated!');
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Risk Management Configuration & Calculator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure capital protection thresholds and calculate live position risk before order entry.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Risk Parameters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RISK SETTINGS FORM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Shield className="w-4 h-4" /> Risk Protection Limits
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs mt-3">
            <div>
              <label className="text-slate-400 block mb-1">Trading Capital (₹)</label>
              <input
                type="number"
                value={settings.capital}
                onChange={(e) => setSettings({ ...settings, capital: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Max Risk / Trade (₹)</label>
                <input
                  type="number"
                  value={settings.max_risk_per_trade}
                  onChange={(e) => setSettings({ ...settings, max_risk_per_trade: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-rose-400 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Daily Loss (₹)</label>
                <input
                  type="number"
                  value={settings.max_daily_loss}
                  onChange={(e) => setSettings({ ...settings, max_daily_loss: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-rose-400 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Max Trades Per Day</label>
                <input
                  type="number"
                  value={settings.max_trades_per_day}
                  onChange={(e) => setSettings({ ...settings, max_trades_per_day: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Consecutive Losses</label>
                <input
                  type="number"
                  value={settings.max_consecutive_losses}
                  onChange={(e) => setSettings({ ...settings, max_consecutive_losses: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* LIVE POSITION SIZE & RISK CALCULATOR */}
        <Card className="border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Calculator className="w-4 h-4" /> Live Trade Risk Estimator
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs mt-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Entry Price (₹)</label>
                <input
                  type="number"
                  value={calcEntry}
                  onChange={(e) => setCalcEntry(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stop Loss (₹)</label>
                <input
                  type="number"
                  value={calcStopLoss}
                  onChange={(e) => setCalcStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-rose-400 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Lots (50 Qty/Lot)</label>
                <input
                  type="number"
                  value={calcLots}
                  onChange={(e) => setCalcLots(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Expected Loss if Stop Hit:</span>
                <span className={`font-bold font-mono ${isOverRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{expectedLoss}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Position Quantity: {calcQty} Qty</span>
                <span>Configured Risk Limit: ₹{settings.max_risk_per_trade}</span>
              </div>
            </div>

            {isOverRisk && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>⚠️ This trade risks ₹{expectedLoss}, which exceeds your configured maximum risk limit of ₹{settings.max_risk_per_trade}!</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
