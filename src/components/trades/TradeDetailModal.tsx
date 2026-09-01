'use client';

import React from 'react';
import { Trade } from '@/types';
import { formatCurrency, formatDuration, getPnLColorClass } from '@/lib/utils';
import { getQualityScoreBadge } from '@/lib/calculations/qualityScore';
import {
  X,
  Clock,
  Target,
  ShieldAlert,
  Brain,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Flame,
  FileText,
} from 'lucide-react';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
}

export function TradeDetailModal({ trade, onClose }: TradeDetailModalProps) {
  if (!trade) return null;

  const psych = trade.psychology;
  const qualityBadge = getQualityScoreBadge(trade.trade_quality_score);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-[#0d1322] border-l border-slate-800 h-full overflow-y-auto p-6 text-slate-200 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 font-mono">{trade.symbol}</span>
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${trade.position_type === 'Long' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {trade.position_type} {trade.option_type !== 'EQUITY' ? trade.option_type : ''}
                </span>
                <span className={`px-2 py-0.5 text-xs font-mono rounded border ${qualityBadge.colorClass}`}>
                  Score: {trade.trade_quality_score}/100 ({qualityBadge.label})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {trade.trade_date} | Entry: {trade.entry_time} | Exit: {trade.exit_time || 'N/A'} ({formatDuration(trade.trade_duration_mins)})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* P&L & Key Financial Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Net P&L</span>
              <p className={`text-base font-bold font-mono ${getPnLColorClass(trade.net_pnl)}`}>
                {formatCurrency(trade.net_pnl)}
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Realized R:R</span>
              <p className="text-base font-bold font-mono text-indigo-400">
                {trade.risk_reward_ratio}R
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Return %</span>
              <p className={`text-base font-bold font-mono ${trade.percentage_return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trade.percentage_return}%
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Quantity</span>
              <p className="text-base font-bold font-mono text-slate-200">
                {trade.quantity} ({trade.lots} lots)
              </p>
            </div>
          </div>

          {/* Execution Prices Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">Execution Price Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Entry Price:</span>
                <span className="font-bold text-slate-200">₹{trade.entry_price}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Exit Price:</span>
                <span className="font-bold text-slate-200">₹{trade.exit_price}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Stop Loss:</span>
                <span className="font-bold text-rose-400">₹{trade.stop_loss}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Price:</span>
                <span className="font-bold text-emerald-400">₹{trade.target}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between text-xs font-mono text-slate-400">
              <span>Planned Risk: ₹{trade.planned_risk}</span>
              <span>Planned Reward: ₹{trade.planned_reward}</span>
              <span>Charges: ₹{trade.brokerage + trade.taxes_charges}</span>
            </div>
          </div>

          {/* Technical Setup & Context */}
          <div className="space-y-4 mb-6">
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Setup & Market Context</h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                Strategy: {trade.strategy}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Trend: {trade.market_trend}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Timeframe: {trade.entry_timeframe}
              </span>
            </div>

            {/* Confirmations */}
            {trade.technical_confirmations?.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 font-mono block mb-1.5">Confirmations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {trade.technical_confirmations.map((conf) => (
                    <span key={conf} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {conf}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trade Plan vs Reality */}
          {trade.entry_reason && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Original Trade Plan
              </h4>
              <div className="text-xs text-slate-300 space-y-2">
                <div>
                  <span className="text-slate-500 font-mono block">Why Enter?</span>
                  <p className="bg-slate-950/60 p-2 rounded border border-slate-800 mt-0.5">{trade.entry_reason}</p>
                </div>
                {trade.stop_loss_reason && (
                  <div>
                    <span className="text-slate-500 font-mono block">Stop Loss Rationale:</span>
                    <p className="bg-slate-950/60 p-2 rounded border border-slate-800 mt-0.5">{trade.stop_loss_reason}</p>
                  </div>
                )}
                {trade.target_reason && (
                  <div>
                    <span className="text-slate-500 font-mono block">Target Rationale:</span>
                    <p className="bg-slate-950/60 p-2 rounded border border-slate-800 mt-0.5">{trade.target_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Psychology & Discipline Flags */}
          {psych && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-rose-400" />
                Psychology & Behavioral Audit
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono mb-3">
                <div>
                  <span className="text-slate-500 block">Emotion Before:</span>
                  <span className="font-semibold text-slate-200">{psych.emotion_before}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emotion During:</span>
                  <span className="font-semibold text-slate-200">{psych.emotion_during}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Discipline Score:</span>
                  <span className="font-semibold text-indigo-400">{psych.discipline_score}/10</span>
                </div>
              </div>

              {/* Behavior Flags Badges */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className={`px-2.5 py-1 rounded border ${psych.followed_plan === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                  Plan Followed: {psych.followed_plan}
                </span>
                {psych.moved_stop_loss && (
                  <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                    ⚠️ Moved Stop Loss
                  </span>
                )}
                {psych.revenge_trade && (
                  <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                    🚨 Revenge Trade
                  </span>
                )}
                {psych.fomo_entry && (
                  <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                    ⚡ FOMO Entry
                  </span>
                )}
                {psych.overtraded && (
                  <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Overtraded
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {trade.screenshots && trade.screenshots.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Chart Screenshots
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trade.screenshots.map((sc) => (
                  <a
                    key={sc.id}
                    href={sc.screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all"
                  >
                    <img src={sc.screenshot_url} alt="Trade Screenshot" className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-slate-200 backdrop-blur-sm">
                      {sc.screenshot_type.toUpperCase()} CHART
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
}
