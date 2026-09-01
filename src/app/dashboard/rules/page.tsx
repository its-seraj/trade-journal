'use client';

import React, { useState, useEffect } from 'react';
import { LocalJournalStore } from '@/lib/store/localStore';
import { TradingRule } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckSquare, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RulesPage() {
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  useEffect(() => {
    setRules(LocalJournalStore.getRules());
  }, []);

  const handleToggle = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
    LocalJournalStore.saveRules(updated);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: TradingRule = {
      id: `rule-${Date.now()}`,
      user_id: 'active-user',
      rule_name: newRuleName,
      description: newRuleDesc,
      enabled: true,
    };

    const updated = [...rules, newRule];
    setRules(updated);
    LocalJournalStore.saveRules(updated);
    setNewRuleName('');
    setNewRuleDesc('');
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    LocalJournalStore.saveRules(updated);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            My Non-Negotiable Trading Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define personal execution guidelines evaluated during trade entry logging.
          </p>
        </div>
      </div>

      {/* ADD RULE FORM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-indigo-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Custom Rule
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-xs">
          <input
            type="text"
            placeholder="Rule Name (e.g., No trading on Expiry Day after 2 PM)"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
          />
          <input
            type="text"
            placeholder="Rule Description / Actionable guideline"
            value={newRuleDesc}
            onChange={(e) => setNewRuleDesc(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded">
            Add Rule
          </button>
        </form>
      </Card>

      {/* RULES LIST */}
      <div className="space-y-3">
        {rules.map((r) => (
          <div
            key={r.id}
            className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
              r.enabled ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{r.rule_name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${r.enabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {r.enabled ? 'Active Rule' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{r.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(r.id)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
                title="Toggle Active"
              >
                {r.enabled ? (
                  <ToggleRight className="w-6 h-6 text-indigo-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-600" />
                )}
              </button>
              <button
                onClick={() => handleDeleteRule(r.id)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
