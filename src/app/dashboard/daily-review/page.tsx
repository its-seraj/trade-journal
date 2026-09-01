'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LocalJournalStore } from '@/lib/store/localStore';
import { DailyJournal, MISTAKE_OPTIONS, ROOT_CAUSE_OPTIONS, EmotionType, FollowedPlanOption } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BookOpenCheck,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Brain,
} from 'lucide-react';

export default function DailyReviewPage() {
  const router = useRouter();
  const todayStr = new Date().toISOString().split('T')[0];

  // State initialization
  const [journalDate, setJournalDate] = useState<string>(todayStr);
  const [yesterdayJournal, setYesterdayJournal] = useState<DailyJournal | null>(null);

  // Form Fields
  const [dailyPnL, setDailyPnL] = useState<number | string>(0);
  const [tradeCount, setTradeCount] = useState<number | string>(0);
  const [disciplineScore, setDisciplineScore] = useState<number>(7);
  const [followedPlan, setFollowedPlan] = useState<FollowedPlanOption>('Yes');

  // Yesterday's Rule
  const [followedYesterdayRule, setFollowedYesterdayRule] = useState<FollowedPlanOption>('Yes');
  const [yesterdayRuleNotes, setYesterdayRuleNotes] = useState<string>('');

  // Mistakes
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [whatHappenedToday, setWhatHappenedToday] = useState<string>('');
  const [biggestMistake, setBiggestMistake] = useState<string>('');
  const [whyMadeMistake, setWhyMadeMistake] = useState<string>('');

  // Root Cause
  const [rootCause, setRootCause] = useState<string>('Impatience');
  const [rootCauseExplanation, setRootCauseExplanation] = useState<string>('');

  // Emotional State
  const [preMarketEmotion, setPreMarketEmotion] = useState<EmotionType>('Calm');
  const [duringMarketEmotion, setDuringMarketEmotion] = useState<EmotionType>('Calm');
  const [postMarketEmotion, setPostMarketEmotion] = useState<EmotionType>('Neutral');
  const [emotionalControlScore, setEmotionalControlScore] = useState<number>(7);

  // Reflection
  const [whatDidWell, setWhatDidWell] = useState<string>('');
  const [whatWentWrong, setWhatWentWrong] = useState<string>('');
  const [whatLearned, setWhatLearned] = useState<string>('');
  const [doDifferentlyTomorrow, setDoDifferentlyTomorrow] = useState<string>('');

  // Tomorrow's Rule
  const [tomorrowRule, setTomorrowRule] = useState<string>('');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Load yesterday's journal for the feedback loop
    const yestJ = LocalJournalStore.getYesterdayJournal(journalDate);
    setYesterdayJournal(yestJ || null);

    // Load existing journal for today if already created
    const existing = LocalJournalStore.getJournalByDate(journalDate);
    if (existing) {
      setDailyPnL(existing.daily_pnl || 0);
      setTradeCount(existing.trade_count || 0);
      setDisciplineScore(existing.discipline_score || 7);
      setFollowedPlan(existing.followed_plan || 'Yes');

      setFollowedYesterdayRule(existing.followed_yesterday_rule || 'Yes');
      setYesterdayRuleNotes(existing.yesterday_rule_notes || '');

      setSelectedMistakes(existing.selected_mistakes || []);
      setWhatHappenedToday(existing.what_happened_today || '');
      setBiggestMistake(existing.biggest_mistake || '');
      setWhyMadeMistake(existing.why_made_mistake || '');

      setRootCause(existing.root_cause || 'Impatience');
      setRootCauseExplanation(existing.root_cause_explanation || '');

      setPreMarketEmotion(existing.pre_market_emotion || 'Calm');
      setDuringMarketEmotion(existing.during_market_emotion || 'Calm');
      setPostMarketEmotion(existing.post_market_emotion || 'Neutral');
      setEmotionalControlScore(existing.emotional_control_score || 7);

      setWhatDidWell(existing.what_did_well || '');
      setWhatWentWrong(existing.what_went_wrong || '');
      setWhatLearned(existing.what_learned || '');
      setDoDifferentlyTomorrow(existing.do_differently_tomorrow || '');
      setTomorrowRule(existing.tomorrow_rule || '');
    } else {
      // Auto-compute trades count & P&L from today's logged trades
      const trades = LocalJournalStore.getTrades().filter((t) => t.trade_date === journalDate);
      if (trades.length > 0) {
        setTradeCount(trades.length);
        setDailyPnL(trades.reduce((acc, t) => acc + t.net_pnl, 0));
      }
    }
  }, [journalDate]);

  const toggleMistake = (mistake: string) => {
    if (selectedMistakes.includes(mistake)) {
      const updated = selectedMistakes.filter((m) => m !== mistake);
      setSelectedMistakes(updated);
      if (biggestMistake === mistake) {
        setBiggestMistake(updated[0] || '');
      }
    } else {
      const updated = [...selectedMistakes, mistake];
      setSelectedMistakes(updated);
      if (!biggestMistake) {
        setBiggestMistake(mistake);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const journalRecord: DailyJournal = {
      id: `journal-${journalDate}`,
      user_id: 'demo-user',
      journal_date: journalDate,
      completed: true,

      daily_pnl: Number(dailyPnL),
      trade_count: Number(tradeCount),
      discipline_score: Number(disciplineScore),
      followed_plan: followedPlan,

      yesterday_rule: yesterdayJournal?.tomorrow_rule || '',
      followed_yesterday_rule: followedYesterdayRule,
      yesterday_rule_notes: yesterdayRuleNotes,

      selected_mistakes: selectedMistakes,
      what_happened_today: whatHappenedToday,
      biggest_mistake: biggestMistake,
      why_made_mistake: whyMadeMistake,

      root_cause: rootCause,
      root_cause_explanation: rootCauseExplanation,

      pre_market_emotion: preMarketEmotion,
      during_market_emotion: duringMarketEmotion,
      post_market_emotion: postMarketEmotion,
      emotional_control_score: Number(emotionalControlScore),

      what_did_well: whatDidWell,
      what_went_wrong: whatWentWrong,
      what_learned: whatLearned,
      do_differently_tomorrow: doDifferentlyTomorrow,

      tomorrow_rule: tomorrowRule,
      updated_at: new Date().toISOString(),
    };

    LocalJournalStore.saveJournal(journalRecord);
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const emotionsList: EmotionType[] = [
    'Calm',
    'Confident',
    'Nervous',
    'Fearful',
    'Excited',
    'Greedy',
    'FOMO',
    'Revenge',
    'Hesitant',
    'Angry',
    'Neutral',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>Target completion time: 3–5 minutes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Today's Trading Review & Accountability
          </h1>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#111827] p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 pl-2">Reviewing:</span>
          <input
            type="date"
            value={journalDate}
            onChange={(e) => setJournalDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-4 rounded-xl font-mono text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Journal review saved successfully! Redirecting to Dashboard...</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ================================================== */}
        {/* SECTION 1: YESTERDAY'S RULE FOLLOW-UP */}
        {/* ================================================== */}
        {yesterdayJournal?.tomorrow_rule && (
          <div className="bg-gradient-to-br from-indigo-950/50 via-[#111827] to-[#111827] border border-indigo-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Yesterday's Rule Follow-Up
            </div>

            <div className="bg-slate-900/80 border border-indigo-900/50 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                Rule set on {yesterdayJournal.journal_date}:
              </span>
              <p className="text-base font-bold text-indigo-200 font-mono">
                "{yesterdayJournal.tomorrow_rule}"
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-200 block">
                Did I follow yesterday's rule today? *
              </label>
              <div className="flex gap-3">
                {(['Yes', 'Partially', 'No'] as FollowedPlanOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFollowedYesterdayRule(opt)}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                      followedYesterdayRule === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : opt === 'Partially'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                          : 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {followedYesterdayRule !== 'Yes' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono text-amber-300 block font-medium">
                  What happened? (Why was the rule broken or partially followed?)
                </label>
                <input
                  type="text"
                  value={yesterdayRuleNotes}
                  onChange={(e) => setYesterdayRuleNotes(e.target.value)}
                  placeholder="e.g. Got emotional after 1st SL and widened target..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* SECTION 2: TRADING SUMMARY */}
        {/* ================================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-300">
              1. Trading Summary
            </CardTitle>
          </CardHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Today's Net P&L (₹)</label>
              <input
                type="number"
                value={dailyPnL}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (/^0\d+/.test(val)) val = val.replace(/^0+/, '');
                  if (/^-0\d+/.test(val)) val = val.replace(/^-0+/, '-');
                  setDailyPnL(val);
                }}
                placeholder="e.g. -1250 or 3500"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Number of Trades Taken</label>
              <input
                type="number"
                value={tradeCount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (/^0\d+/.test(val)) val = val.replace(/^0+/, '');
                  setTradeCount(val);
                }}
                placeholder="e.g. 3"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-400">Discipline Score Today (1–10)</label>
                <span className="text-sm font-bold font-mono text-indigo-400">{disciplineScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={disciplineScore}
                onChange={(e) => setDisciplineScore(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-mono text-slate-400 block">Did I follow my trading plan today?</label>
              <div className="flex gap-3">
                {(['Yes', 'Partially', 'No'] as FollowedPlanOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFollowedPlan(opt)}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                      followedPlan === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : opt === 'Partially'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                          : 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ================================================== */}
        {/* SECTION 3: WHAT MISTAKES DID I MAKE? */}
        {/* ================================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              2. What Mistakes Did I Make Today?
            </CardTitle>
            <span className="text-xs font-mono text-slate-400">
              Select all mistakes made today ({selectedMistakes.length} selected). No detailed input required for checkboxes.
            </span>
          </CardHeader>

          {/* 23 Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {MISTAKE_OPTIONS.map((mistake) => {
              const isSelected = selectedMistakes.includes(mistake);
              return (
                <button
                  key={mistake}
                  type="button"
                  onClick={() => toggleMistake(mistake)}
                  className={`text-left p-3 rounded-xl font-mono text-xs border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-rose-950/60 border-rose-800 text-rose-200 font-semibold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border ${
                      isSelected ? 'bg-rose-600 border-rose-500 text-white' : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span>{mistake}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/80 mt-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                What happened today? (Explain naturally in plain text)
              </label>
              <textarea
                rows={3}
                value={whatHappenedToday}
                onChange={(e) => setWhatHappenedToday(e.target.value)}
                placeholder="Explain what happened during your trading session..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {selectedMistakes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 block font-semibold">
                  What was today's BIGGEST mistake?
                </label>
                <select
                  value={biggestMistake}
                  onChange={(e) => setBiggestMistake(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Biggest Mistake --</option>
                  {selectedMistakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                Why did I make this mistake?
              </label>
              <textarea
                rows={2}
                value={whyMadeMistake}
                onChange={(e) => setWhyMadeMistake(e.target.value)}
                placeholder="e.g. Frustrated after 1st SL, wanted to break even before market close..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* ================================================== */}
        {/* SECTION 4: ROOT CAUSE */}
        {/* ================================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              3. Root Cause Analysis
            </CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                What was the main reason behind today's mistakes?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ROOT_CAUSE_OPTIONS.map((cause) => (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => setRootCause(cause)}
                    className={`py-2 px-3 rounded-xl font-mono text-xs border text-left transition-all ${
                      rootCause === cause
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-semibold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cause}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-slate-400 block">Short Root Cause Explanation</label>
              <input
                type="text"
                value={rootCauseExplanation}
                onChange={(e) => setRootCauseExplanation(e.target.value)}
                placeholder="Short note on root psychological trigger..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* ================================================== */}
        {/* SECTION 5: EMOTIONAL STATE */}
        {/* ================================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              4. Emotional State & Control
            </CardTitle>
          </CardHeader>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Before Trading</label>
              <select
                value={preMarketEmotion}
                onChange={(e) => setPreMarketEmotion(e.target.value as EmotionType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              >
                {emotionsList.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">During Trading</label>
              <select
                value={duringMarketEmotion}
                onChange={(e) => setDuringMarketEmotion(e.target.value as EmotionType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              >
                {emotionsList.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">After Trading</label>
              <select
                value={postMarketEmotion}
                onChange={(e) => setPostMarketEmotion(e.target.value as EmotionType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              >
                {emotionsList.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-400">How emotionally controlled was I today? (1–10)</label>
                <span className="text-sm font-bold font-mono text-emerald-400">{emotionalControlScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={emotionalControlScore}
                onChange={(e) => setEmotionalControlScore(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* ================================================== */}
        {/* SECTION 6: DAILY REFLECTION */}
        {/* ================================================== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-300">
              5. Daily Reflection
            </CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                1. What did I do well today?
              </label>
              <textarea
                rows={2}
                value={whatDidWell}
                onChange={(e) => setWhatDidWell(e.target.value)}
                placeholder="e.g. Waited for 5m candle close, kept risk fixed at 1 lot..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                2. What was my biggest mistake?
              </label>
              <textarea
                rows={2}
                value={whatWentWrong}
                onChange={(e) => setWhatWentWrong(e.target.value)}
                placeholder="e.g. Widened SL on second trade..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                3. What did I learn today?
              </label>
              <textarea
                rows={2}
                value={whatLearned}
                onChange={(e) => setWhatLearned(e.target.value)}
                placeholder="e.g. Taking 1 loss is fine. Chasing recovery destroys discipline..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block font-semibold">
                4. What will I do differently tomorrow?
              </label>
              <textarea
                rows={2}
                value={doDifferentlyTomorrow}
                onChange={(e) => setDoDifferentlyTomorrow(e.target.value)}
                placeholder="e.g. Take a 30-minute break immediately after any losing trade..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* ================================================== */}
        {/* SECTION 7: TOMORROW'S ACTIONABLE RULE */}
        {/* ================================================== */}
        <div className="bg-gradient-to-br from-indigo-950 via-[#111827] to-[#111827] border-2 border-indigo-600/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            6. Tomorrow's Actionable Rule (Crucial)
          </div>
          <p className="text-xs font-mono text-slate-400">
            Write a short, actionable, 1-sentence rule for tomorrow's trading session.
          </p>
          <input
            type="text"
            required
            value={tomorrowRule}
            onChange={(e) => setTomorrowRule(e.target.value)}
            placeholder="e.g. 'Never move my stop-loss' or 'Walk away for 30 min after one SL'"
            className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-3 text-sm font-bold font-mono text-indigo-200 focus:outline-none focus:border-indigo-400 shadow-inner"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="font-mono text-xs px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg">
            Save Today's Review & Commitment
          </Button>
        </div>
      </form>
    </div>
  );
}
