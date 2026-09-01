import React from 'react';
import { BehavioralInsight } from '@/types';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle, Info } from 'lucide-react';

interface BehavioralInsightCardProps {
  insight: BehavioralInsight;
}

export function BehavioralInsightCard({ insight }: BehavioralInsightCardProps) {
  let icon = <Sparkles className="w-5 h-5 text-indigo-400" />;
  let cardBorder = 'border-slate-800';
  let badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

  if (insight.type === 'danger') {
    icon = <ShieldAlert className="w-5 h-5 text-rose-400" />;
    cardBorder = 'border-rose-500/30 bg-rose-950/10';
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (insight.type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
    cardBorder = 'border-amber-500/30 bg-amber-950/10';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else if (insight.type === 'success') {
    icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
    cardBorder = 'border-emerald-500/30 bg-emerald-950/10';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }

  return (
    <Card className={`relative overflow-hidden ${cardBorder}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm font-mono flex items-center gap-2">
              {insight.title}
            </h4>
            {insight.metricDiff && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border mt-1 inline-block ${badgeColor}`}>
                {insight.metricDiff}
              </span>
            )}
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          Confidence: {insight.confidence}
        </span>
      </div>

      <p className="text-xs text-slate-300 font-mono mt-3 leading-relaxed">
        {insight.description}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/50 -mx-5 -mb-5 p-4 flex items-center gap-2 text-xs font-mono text-indigo-300">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span><strong className="text-slate-200">Rule Recommendation:</strong> {insight.actionableTip}</span>
      </div>
    </Card>
  );
}
