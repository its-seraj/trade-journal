'use client';

import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Trade } from '@/types';
import { formatCurrency, formatDuration, getPnLColorClass } from '@/lib/utils';
import { getQualityScoreBadge } from '@/lib/calculations/qualityScore';
import { TradeDetailModal } from './TradeDetailModal';
import { CSVImportModal } from './CSVImportModal';
import {
  Search,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Trash2,
  Eye,
} from 'lucide-react';
import { LocalJournalStore } from '@/lib/store/localStore';

interface TradeTableProps {
  trades: Trade[];
  onTradesUpdated?: () => void;
}

export function TradeTable({ trades, onTradesUpdated }: TradeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('All');
  const [winLossFilter, setWinLossFilter] = useState('All');
  const [strategyFilter, setStrategyFilter] = useState('All');
  const [emotionFilter, setEmotionFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'rr' | 'quality'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Extract unique strategies for filter dropdown
  const strategies = useMemo(() => {
    const set = new Set(trades.map((t) => t.strategy).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [trades]);

  // Filtering & Sorting logic
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Search
      const matchSearch =
        t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.entry_reason && t.entry_reason.toLowerCase().includes(searchTerm.toLowerCase()));

      // Instrument
      const matchInst = instrumentFilter === 'All' || t.instrument === instrumentFilter;

      // Win/Loss
      let matchWinLoss = true;
      if (winLossFilter === 'Win') matchWinLoss = t.net_pnl > 0;
      if (winLossFilter === 'Loss') matchWinLoss = t.net_pnl < 0;

      // Strategy
      const matchStrat = strategyFilter === 'All' || t.strategy === strategyFilter;

      // Emotion
      const matchEmotion =
        emotionFilter === 'All' ||
        t.psychology?.emotion_before === emotionFilter ||
        t.psychology?.emotion_during === emotionFilter;

      return matchSearch && matchInst && matchWinLoss && matchStrat && matchEmotion;
    }).sort((a, b) => {
      let compA: number = 0;
      let compB: number = 0;

      if (sortBy === 'date') {
        compA = new Date(a.trade_date + 'T' + a.entry_time).getTime();
        compB = new Date(b.trade_date + 'T' + b.entry_time).getTime();
      } else if (sortBy === 'pnl') {
        compA = a.net_pnl;
        compB = b.net_pnl;
      } else if (sortBy === 'rr') {
        compA = a.risk_reward_ratio || 0;
        compB = b.risk_reward_ratio || 0;
      } else if (sortBy === 'quality') {
        compA = a.trade_quality_score || 0;
        compB = b.trade_quality_score || 0;
      }

      return sortOrder === 'desc' ? compB - compA : compA - compB;
    });
  }, [trades, searchTerm, instrumentFilter, winLossFilter, strategyFilter, emotionFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / pageSize) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, currentPage]);

  const handleExportCSV = () => {
    if (!filteredTrades.length) return;
    const csvData = filteredTrades.map((t) => ({
      Date: t.trade_date,
      Time: t.entry_time,
      Instrument: t.instrument,
      Symbol: t.symbol,
      Position: t.position_type,
      OptionType: t.option_type,
      Strike: t.strike_price || '',
      Quantity: t.quantity,
      EntryPrice: t.entry_price,
      ExitPrice: t.exit_price,
      StopLoss: t.stop_loss,
      Target: t.target,
      GrossPnL: t.gross_pnl,
      Charges: t.brokerage + t.taxes_charges,
      NetPnL: t.net_pnl,
      RR: t.risk_reward_ratio,
      Strategy: t.strategy,
      QualityScore: t.trade_quality_score,
      FollowedPlan: t.psychology?.followed_plan || 'N/A',
      EmotionBefore: t.psychology?.emotion_before || 'N/A',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trade-journal-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTrade = (e: React.MouseEvent, tradeId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this trade entry?')) {
      LocalJournalStore.deleteTrade(tradeId);
      if (onTradesUpdated) onTradesUpdated();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-[#111827]/90 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol, strategy, rationale..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Actions: Export / Import */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Instrument:</span>
            <select
              value={instrumentFilter}
              onChange={(e) => {
                setInstrumentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:border-indigo-500"
            >
              <option value="All">All Instruments</option>
              <option value="NIFTY">NIFTY</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
              <option value="STOCKS">Stocks</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Result:</span>
            <select
              value={winLossFilter}
              onChange={(e) => {
                setWinLossFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:border-indigo-500"
            >
              <option value="All">All Trades</option>
              <option value="Win">Winners Only</option>
              <option value="Loss">Losses Only</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Strategy:</span>
            <select
              value={strategyFilter}
              onChange={(e) => {
                setStrategyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:border-indigo-500"
            >
              {strategies.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Sort By:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:border-indigo-500"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="pnl-desc">P&L (High to Low)</option>
              <option value="pnl-asc">P&L (Low to High)</option>
              <option value="quality-desc">Quality Score (High to Low)</option>
              <option value="rr-desc">Risk:Reward (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dense Data Table */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-3">Symbol & Type</th>
              <th className="py-3 px-3">Entry / Exit</th>
              <th className="py-3 px-3">Qty</th>
              <th className="py-3 px-3 text-right">Net P&L</th>
              <th className="py-3 px-3 text-center">R:R</th>
              <th className="py-3 px-3">Strategy</th>
              <th className="py-3 px-3 text-center">Quality</th>
              <th className="py-3 px-3">Psychology</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {!paginatedTrades.length ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No trade records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedTrades.map((t) => {
                const qualityBadge = getQualityScoreBadge(t.trade_quality_score);
                const psych = t.psychology;

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrade(t)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Date / Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{t.trade_date}</div>
                      <div className="text-[10px] text-slate-500">{t.entry_time} ({formatDuration(t.trade_duration_mins)})</div>
                    </td>

                    {/* Symbol & Position */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        {t.symbol}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${t.position_type === 'Long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {t.position_type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{t.instrument}</div>
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-300">₹{t.entry_price} → ₹{t.exit_price}</div>
                      <div className="text-[10px] text-slate-500">SL: ₹{t.stop_loss} | Tgt: ₹{t.target}</div>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-3 whitespace-nowrap font-semibold text-slate-300">
                      {t.quantity} <span className="text-[10px] text-slate-500">({t.lots}L)</span>
                    </td>

                    {/* Net P&L */}
                    <td className={`py-3 px-3 whitespace-nowrap text-right font-bold font-mono ${getPnLColorClass(t.net_pnl)}`}>
                      {formatCurrency(t.net_pnl)}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {t.percentage_return > 0 ? `+${t.percentage_return}%` : `${t.percentage_return}%`}
                      </div>
                    </td>

                    {/* R:R */}
                    <td className="py-3 px-3 whitespace-nowrap text-center font-bold text-indigo-400">
                      {t.risk_reward_ratio}R
                    </td>

                    {/* Strategy */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px]">
                        {t.strategy}
                      </span>
                    </td>

                    {/* Quality Score */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${qualityBadge.colorClass}`}>
                        {t.trade_quality_score}
                      </span>
                    </td>

                    {/* Psychology */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {psych ? (
                        <div className="space-y-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${psych.followed_plan === 'Yes' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            Plan: {psych.followed_plan}
                          </span>
                          <div className="text-[10px] text-slate-500">{psych.emotion_before}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrade(t);
                          }}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTrade(e, t.id)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing {filteredTrades.length ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredTrades.length)} of {filteredTrades.length} Trades
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trade Details Slideover Modal */}
      <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          if (onTradesUpdated) onTradesUpdated();
        }}
      />
    </div>
  );
}
