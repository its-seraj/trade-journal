'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Trade } from '@/types';
import { LocalJournalStore } from '@/lib/store/localStore';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { calculateTradeQualityScore } from '@/lib/calculations/qualityScore';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function CSVImportModal({ isOpen, onClose, onImportComplete }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string }>({
    trade_date: '',
    symbol: '',
    position_type: '',
    quantity: '',
    entry_price: '',
    exit_price: '',
    net_pnl: '',
    strategy: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const firstRow = results.data[0] as Record<string, string>;
          const cols = Object.keys(firstRow);
          setHeaders(cols);
          setParsedData(results.data as Record<string, string>[]);

          // Auto-guess mapping
          const autoMap: { [key: string]: string } = {};
          cols.forEach((col) => {
            const lower = col.toLowerCase();
            if (lower.includes('date')) autoMap.trade_date = col;
            if (lower.includes('symbol') || lower.includes('instrument')) autoMap.symbol = col;
            if (lower.includes('position') || lower.includes('type') || lower.includes('side')) autoMap.position_type = col;
            if (lower.includes('qty') || lower.includes('quantity')) autoMap.quantity = col;
            if (lower.includes('entry')) autoMap.entry_price = col;
            if (lower.includes('exit')) autoMap.exit_price = col;
            if (lower.includes('pnl') || lower.includes('profit') || lower.includes('net')) autoMap.net_pnl = col;
            if (lower.includes('strategy')) autoMap.strategy = col;
          });
          setMappings((prev) => ({ ...prev, ...autoMap }));
        } else {
          setError('CSV file appears empty or unparseable.');
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleImport = () => {
    if (!parsedData.length) return;

    try {
      const importedTrades: Trade[] = parsedData.map((row, idx) => {
        const entryPrice = parseFloat(row[mappings.entry_price] || '100');
        const exitPrice = parseFloat(row[mappings.exit_price] || '110');
        const qty = parseInt(row[mappings.quantity] || '50', 10);
        const pnl = row[mappings.net_pnl] ? parseFloat(row[mappings.net_pnl]) : (exitPrice - entryPrice) * qty;

        const dateVal = row[mappings.trade_date] || new Date().toISOString().split('T')[0];

        const tradeObj: Trade = {
          id: `csv-${Date.now()}-${idx}`,
          user_id: 'imported-user',
          trade_date: dateVal,
          entry_time: '10:00',
          exit_time: '10:30',
          instrument: 'NIFTY',
          symbol: row[mappings.symbol] || 'NIFTY_OPT',
          option_type: 'CE',
          position_type: (row[mappings.position_type]?.toLowerCase().includes('short') ? 'Short' : 'Long') as any,
          quantity: qty,
          lots: Math.max(1, Math.floor(qty / 50)),
          entry_price: entryPrice,
          exit_price: exitPrice,
          stop_loss: entryPrice * 0.9,
          target: entryPrice * 1.2,
          planned_risk: Math.round(entryPrice * 0.1 * qty),
          planned_reward: Math.round(entryPrice * 0.2 * qty),
          brokerage: 40,
          taxes_charges: 20,
          gross_pnl: pnl + 60,
          net_pnl: pnl,
          risk_reward_ratio: 2.0,
          percentage_return: Number((((exitPrice - entryPrice) / entryPrice) * 100).toFixed(1)),
          points_gained: exitPrice - entryPrice,
          trade_duration_mins: 30,
          trade_quality_score: 75,
          strategy: row[mappings.strategy] || 'CSV Import',
          technical_confirmations: ['Imported'],
          psychology: {
            emotion_before: 'Calm',
            emotion_during: 'Calm',
            emotion_after: 'Calm',
            discipline_score: 8,
            confidence_before: 8,
            followed_plan: 'Yes',
            moved_stop_loss: false,
            exited_early: false,
            held_loss_hoping: false,
            revenge_trade: false,
            overtraded: false,
            fomo_entry: false,
            increased_risk_after_loss: false,
          },
        };

        return tradeObj;
      });

      importedTrades.forEach((t) => LocalJournalStore.saveTrade(t));

      onImportComplete();
      onClose();
    } catch (err: any) {
      setError(`Import error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c121e] border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm font-mono">Import Trades CSV</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3 bg-slate-900/40 hover:border-indigo-500/40 transition-colors">
            <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
            <div>
              <p className="text-xs font-semibold text-slate-200 font-mono">Select CSV File</p>
              <p className="text-[11px] text-slate-500 font-mono">Supports Sensibull, Zerodha, Groww, Kotak, or custom CSV trade logs</p>
            </div>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-input" />
            <label htmlFor="csv-input" className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
              Browse CSV File
            </label>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-300 truncate">{file.name}</span>
              <span className="text-indigo-400 font-bold">{parsedData.length} Rows Detected</span>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block font-semibold">Map Columns (CSV Header → Journal Field):</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.keys(mappings).map((field) => (
                  <div key={field} className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">{field.replace('_', ' ')}:</span>
                    <select
                      value={mappings[field]}
                      onChange={(e) => setMappings({ ...mappings, [field]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-indigo-500"
                    >
                      <option value="">-- Select Column --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg">
            Cancel
          </button>
          {file && (
            <button onClick={handleImport} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Import {parsedData.length} Trades
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
