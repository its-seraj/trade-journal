'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trade, EmotionType, Instrument, PositionType, OptionType, MarketTrend, MarketCondition } from '@/types';
import { LocalJournalStore } from '@/lib/store/localStore';
import { calculateTradeQualityScore, getQualityScoreBadge } from '@/lib/calculations/qualityScore';
import { formatCurrency } from '@/lib/utils';
import {
  Save,
  AlertTriangle,
  Brain,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  FileText,
  CheckSquare,
} from 'lucide-react';

const tradeSchema = z.object({
  trade_date: z.string().min(1, 'Date is required'),
  entry_time: z.string().min(1, 'Entry time is required'),
  exit_time: z.string().optional(),
  instrument: z.string(),
  symbol: z.string().min(1, 'Symbol is required'),
  expiry: z.string().optional(),
  option_type: z.string(),
  strike_price: z.number().optional(),
  position_type: z.string(),
  quantity: z.number().min(1, 'Quantity must be > 0'),
  lots: z.number().min(1),
  entry_price: z.number().min(0.05, 'Entry price required'),
  exit_price: z.number().min(0.05, 'Exit price required'),
  stop_loss: z.number().min(0.05, 'Stop loss required'),
  target: z.number().min(0.05, 'Target required'),
  brokerage: z.number().default(40),
  taxes_charges: z.number().default(20),
  market_trend: z.string(),
  entry_timeframe: z.string(),
  market_condition: z.string(),
  strategy: z.string(),
  custom_strategy_name: z.string().optional(),
  entry_reason: z.string().optional(),
  stop_loss_reason: z.string().optional(),
  target_reason: z.string().optional(),
  expected_scenario: z.string().optional(),
  invalidating_condition: z.string().optional(),
  notes: z.string().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

export function TradeForm() {
  const router = useRouter();
  const riskSettings = LocalJournalStore.getRiskSettings();

  const [activeTab, setActiveTab] = useState<'basic' | 'setup' | 'plan' | 'psychology'>('basic');
  const [confirmations, setConfirmations] = useState<string[]>([
    '9 EMA confirmation',
    'VWAP',
  ]);

  // Psychology state
  const [emotionBefore, setEmotionBefore] = useState<EmotionType>('Calm');
  const [emotionDuring, setEmotionDuring] = useState<EmotionType>('Calm');
  const [emotionAfter, setEmotionAfter] = useState<EmotionType>('Calm');
  const [disciplineScore, setDisciplineScore] = useState<number>(8);
  const [confidenceBefore, setConfidenceBefore] = useState<number>(8);
  const [followedPlan, setFollowedPlan] = useState<'Yes' | 'Partially' | 'No'>('Yes');
  const [movedSL, setMovedSL] = useState<boolean>(false);
  const [exitedEarly, setExitedEarly] = useState<boolean>(false);
  const [heldLossHoping, setHeldLossHoping] = useState<boolean>(false);
  const [revengeTrade, setRevengeTrade] = useState<boolean>(false);
  const [overtraded, setOvertraded] = useState<boolean>(false);
  const [fomoEntry, setFomoEntry] = useState<boolean>(false);
  const [increasedRisk, setIncreasedRisk] = useState<boolean>(false);
  const [emotionalNotes, setEmotionalNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      trade_date: todayStr,
      entry_time: nowTime,
      exit_time: nowTime,
      instrument: 'NIFTY',
      symbol: 'NIFTY24SEP25000CE',
      option_type: 'CE',
      strike_price: 25000,
      position_type: 'Long',
      quantity: 150,
      lots: 3,
      entry_price: 140,
      exit_price: 175,
      stop_loss: 120,
      target: 180,
      brokerage: 40,
      taxes_charges: 25,
      market_trend: 'Bullish',
      entry_timeframe: '5m',
      market_condition: 'Trending',
      strategy: 'EMA',
    },
  });

  const watchEntryPrice = watch('entry_price') || 0;
  const watchExitPrice = watch('exit_price') || 0;
  const watchStopLoss = watch('stop_loss') || 0;
  const watchTarget = watch('target') || 0;
  const watchQuantity = watch('quantity') || 1;
  const watchPosition = watch('position_type');
  const watchBrokerage = watch('brokerage') || 40;
  const watchTaxes = watch('taxes_charges') || 25;

  // Live Auto Calculations
  const grossPnL =
    watchPosition === 'Long'
      ? (watchExitPrice - watchEntryPrice) * watchQuantity
      : (watchEntryPrice - watchExitPrice) * watchQuantity;

  const totalCharges = watchBrokerage + watchTaxes;
  const netPnL = grossPnL - totalCharges;

  const plannedRisk = Math.abs(watchEntryPrice - watchStopLoss) * watchQuantity;
  const plannedReward = Math.abs(watchTarget - watchEntryPrice) * watchQuantity;
  const plannedRR = plannedRisk > 0 ? Number((plannedReward / plannedRisk).toFixed(2)) : 0;
  const actualRR = plannedRisk > 0 ? Number((netPnL / plannedRisk).toFixed(2)) : 0;
  const pointsGained = watchPosition === 'Long' ? watchExitPrice - watchEntryPrice : watchEntryPrice - watchExitPrice;
  const percentageReturn = watchEntryPrice > 0 ? Number(((pointsGained / watchEntryPrice) * 100).toFixed(1)) : 0;

  // Live Quality Score
  const currentQualityScore = calculateTradeQualityScore({
    psychology: {
      emotion_before: emotionBefore,
      emotion_during: emotionDuring,
      emotion_after: emotionAfter,
      discipline_score: disciplineScore,
      confidence_before: confidenceBefore,
      followed_plan: followedPlan,
      moved_stop_loss: movedSL,
      exited_early: exitedEarly,
      held_loss_hoping: heldLossHoping,
      revenge_trade: revengeTrade,
      overtraded: overtraded,
      fomo_entry: fomoEntry,
      increased_risk_after_loss: increasedRisk,
    },
    confirmationsCount: confirmations.length,
    plannedRisk,
    maxRiskPerTrade: riskSettings.max_risk_per_trade,
  });

  const qualityBadge = getQualityScoreBadge(currentQualityScore);
  const exceedsRisk = plannedRisk > riskSettings.max_risk_per_trade;

  const toggleConfirmation = (conf: string) => {
    if (confirmations.includes(conf)) {
      setConfirmations(confirmations.filter((c) => c !== conf));
    } else {
      setConfirmations([...confirmations, conf]);
    }
  };

  const onSubmit = (data: TradeFormValues) => {
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      user_id: 'active-user',
      trade_date: data.trade_date,
      entry_time: data.entry_time,
      exit_time: data.exit_time || data.entry_time,
      instrument: data.instrument as Instrument,
      symbol: data.symbol,
      expiry: data.expiry,
      option_type: data.option_type as OptionType,
      strike_price: data.strike_price,
      position_type: data.position_type as PositionType,
      quantity: data.quantity,
      lots: data.lots,
      entry_price: data.entry_price,
      exit_price: data.exit_price,
      stop_loss: data.stop_loss,
      target: data.target,
      planned_risk: plannedRisk,
      planned_reward: plannedReward,
      brokerage: data.brokerage,
      taxes_charges: data.taxes_charges,
      gross_pnl: grossPnL,
      net_pnl: netPnL,
      risk_reward_ratio: actualRR,
      percentage_return: percentageReturn,
      points_gained: pointsGained,
      trade_duration_mins: 25,
      trade_quality_score: currentQualityScore,
      market_trend: data.market_trend as MarketTrend,
      entry_timeframe: data.entry_timeframe,
      market_condition: data.market_condition as MarketCondition,
      strategy: data.custom_strategy_name || data.strategy,
      custom_strategy_name: data.custom_strategy_name,
      technical_confirmations: confirmations,
      entry_reason: data.entry_reason,
      stop_loss_reason: data.stop_loss_reason,
      target_reason: data.target_reason,
      expected_scenario: data.expected_scenario,
      invalidating_condition: data.invalidating_condition,
      notes: data.notes,
      psychology: {
        emotion_before: emotionBefore,
        emotion_during: emotionDuring,
        emotion_after: emotionAfter,
        discipline_score: disciplineScore,
        confidence_before: confidenceBefore,
        followed_plan: followedPlan,
        moved_stop_loss: movedSL,
        exited_early: exitedEarly,
        held_loss_hoping: heldLossHoping,
        revenge_trade: revengeTrade,
        overtraded: overtraded,
        fomo_entry: fomoEntry,
        increased_risk_after_loss: increasedRisk,
        emotional_notes: emotionalNotes,
      },
    };

    LocalJournalStore.saveTrade(newTrade);
    router.push('/dashboard/trades');
  };

  const confirmationList = [
    '9 EMA confirmation',
    '15 EMA confirmation',
    'Support/resistance',
    'Market structure',
    'Break of structure',
    'Liquidity sweep',
    'Volume confirmation',
    'VWAP',
    'Higher timeframe confirmation',
  ];

  const emotionList: EmotionType[] = [
    'Calm',
    'Confident',
    'Fearful',
    'Greedy',
    'FOMO',
    'Revenge',
    'Hesitant',
    'Excited',
    'Angry',
    'Neutral',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Live Calculated Stats Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 font-mono text-base flex items-center gap-2">
              Trade Entry Calculations
              <span className={`px-2.5 py-0.5 rounded text-xs border ${qualityBadge.colorClass}`}>
                Quality Score: {currentQualityScore}/100 ({qualityBadge.label})
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live Net P&L: <span className={netPnL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{formatCurrency(netPnL)}</span> | Planned R:R: <span className="text-indigo-400 font-bold">{plannedRR}R</span> | Risk: ₹{plannedRisk}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs font-mono rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save Journal Entry
        </button>
      </div>

      {/* Risk Warning Alert Banner */}
      {exceedsRisk && (
        <div className="bg-rose-500/15 border border-rose-500/30 p-4 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wide block">⚠️ Risk Alert Limit Exceeded</span>
            <span>This trade risks ₹{plannedRisk}, which exceeds your configured maximum risk limit of ₹{riskSettings.max_risk_per_trade}. Adjust lot size or tighten stop loss!</span>
          </div>
        </div>
      )}

      {/* Form Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-mono">
        {[
          { id: 'basic', label: '1. Basic & Prices', icon: Sliders },
          { id: 'setup', label: '2. Setup & Confirmations', icon: Layers },
          { id: 'plan', label: '3. Trade Plan Rationale', icon: FileText },
          { id: 'psychology', label: '4. Psychology & Discipline', icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC & PRICES */}
      {activeTab === 'basic' && (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Instrument & Position</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Date</label>
              <input type="date" {...register('trade_date')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Entry Time</label>
              <input type="time" {...register('entry_time')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Exit Time</label>
              <input type="time" {...register('exit_time')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Instrument</label>
              <select {...register('instrument')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
                <option value="SENSEX">SENSEX</option>
                <option value="STOCKS">Stocks</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Symbol</label>
              <input type="text" {...register('symbol')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Position Side</label>
              <select {...register('position_type')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Option Type</label>
              <select {...register('option_type')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="CE">CE</option>
                <option value="PE">PE</option>
                <option value="FUT">FUT</option>
                <option value="EQUITY">EQUITY</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Quantity</label>
              <input type="number" onFocus={(e) => e.target.select()} {...register('quantity', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Lots</label>
              <input type="number" onFocus={(e) => e.target.select()} {...register('lots', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
          </div>

          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider pt-4 border-t border-slate-800">Price Information & Targets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Entry Price (₹)</label>
              <input type="number" step="0.05" onFocus={(e) => e.target.select()} {...register('entry_price', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Exit Price (₹)</label>
              <input type="number" step="0.05" onFocus={(e) => e.target.select()} {...register('exit_price', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Stop Loss (₹)</label>
              <input type="number" step="0.05" onFocus={(e) => e.target.select()} {...register('stop_loss', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-rose-400 font-bold" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Target (₹)</label>
              <input type="number" step="0.05" onFocus={(e) => e.target.select()} {...register('target', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETUP & CONFIRMATIONS */}
      {activeTab === 'setup' && (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Market Context & Strategy</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Market Trend</label>
              <select {...register('market_trend')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
                <option value="Sideways">Sideways</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Entry Timeframe</label>
              <select {...register('entry_timeframe')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="1m">1m</option>
                <option value="3m">3m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Market Condition</label>
              <select {...register('market_condition')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="Trending">Trending</option>
                <option value="Range">Range</option>
                <option value="Breakout">Breakout</option>
                <option value="Reversal">Reversal</option>
                <option value="High volatility">High Volatility</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Strategy</label>
              <select {...register('strategy')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="EMA">EMA Cross/Pullback</option>
                <option value="Support/Resistance">Support / Resistance</option>
                <option value="SMC">Smart Money Concepts (SMC)</option>
                <option value="Breakout">Breakout</option>
                <option value="Pullback">Pullback</option>
                <option value="Reversal">Reversal</option>
                <option value="Momentum">Momentum Drive</option>
                <option value="Custom">Custom Strategy</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Custom Strategy Name (Optional)</label>
              <input type="text" placeholder="e.g. 9:20 AM ORB Strategy" {...register('custom_strategy_name')} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
          </div>

          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider pt-4 border-t border-slate-800">Technical Confirmations Checkboxes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            {confirmationList.map((item) => (
              <label key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={confirmations.includes(item)}
                  onChange={() => toggleConfirmation(item)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRADE PLAN */}
      {activeTab === 'plan' && (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs font-mono">
          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Plan vs Reality Rationale</h4>
          <div>
            <label className="text-slate-400 block mb-1">Why did I enter?</label>
            <textarea rows={3} {...register('entry_reason')} placeholder="Describe the market setup, liquidity pools, and trigger candle..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Stop-Loss Reason</label>
              <textarea rows={2} {...register('stop_loss_reason')} placeholder="Placed below swing low / order block..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Target Reason</label>
              <textarea rows={2} {...register('target_reason')} placeholder="Targeting previous day high or 1.5R projection..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">What was expected to happen?</label>
              <textarea rows={2} {...register('expected_scenario')} placeholder="Expected fast drive upwards post 9:30 AM..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Invalidating Condition</label>
              <textarea rows={2} {...register('invalidating_condition')} placeholder="5m candle close inside FVG..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PSYCHOLOGY & DISCIPLINE */}
      {activeTab === 'psychology' && (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs font-mono">
          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Emotional State Audit</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Emotion Before Entry</label>
              <select value={emotionBefore} onChange={(e) => setEmotionBefore(e.target.value as EmotionType)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                {emotionList.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Emotion During Trade</label>
              <select value={emotionDuring} onChange={(e) => setEmotionDuring(e.target.value as EmotionType)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                {emotionList.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Emotion After Exit</label>
              <select value={emotionAfter} onChange={(e) => setEmotionAfter(e.target.value as EmotionType)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200">
                {emotionList.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Discipline Score: <span className="text-indigo-400 font-bold">{disciplineScore}/10</span></label>
              <input type="range" min="1" max="10" value={disciplineScore} onChange={(e) => setDisciplineScore(parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Confidence Before Trade: <span className="text-indigo-400 font-bold">{confidenceBefore}/10</span></label>
              <input type="range" min="1" max="10" value={confidenceBefore} onChange={(e) => setConfidenceBefore(parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider pt-4 border-t border-slate-800">Behavioral Rule Checkboxes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 block">Did I follow my plan?</span>
              <div className="flex gap-2">
                {['Yes', 'Partially', 'No'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setFollowedPlan(opt as any)} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${followedPlan === opt ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={movedSL} onChange={(e) => setMovedSL(e.target.checked)} className="rounded text-rose-500" />
                <span>Moved Stop Loss</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={revengeTrade} onChange={(e) => setRevengeTrade(e.target.checked)} className="rounded text-rose-500" />
                <span>Revenge Trade</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={fomoEntry} onChange={(e) => setFomoEntry(e.target.checked)} className="rounded text-rose-500" />
                <span>FOMO Entry</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={heldLossHoping} onChange={(e) => setHeldLossHoping(e.target.checked)} className="rounded text-rose-500" />
                <span>Held Loss Hoping</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
