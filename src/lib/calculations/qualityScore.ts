import { TradePsychology } from '@/types';

interface QualityScoreInput {
  psychology?: TradePsychology;
  confirmationsCount: number;
  plannedRisk: number;
  maxRiskPerTrade?: number;
}

export function calculateTradeQualityScore(input: QualityScoreInput): number {
  let score = 30; // base floor
  const psych = input.psychology;

  if (psych) {
    // 1. Followed Plan (up to 25 pts)
    if (psych.followed_plan === 'Yes') {
      score += 25;
    } else if (psych.followed_plan === 'Partially') {
      score += 12;
    }

    // 2. Stop Loss Discipline (up to 15 pts)
    if (!psych.moved_stop_loss) {
      score += 15;
    }

    // 3. Emotional State (up to 15 pts)
    const positiveEmotions = ['Calm', 'Confident', 'Neutral'];
    if (positiveEmotions.includes(psych.emotion_before)) {
      score += 8;
    }
    if (positiveEmotions.includes(psych.emotion_during)) {
      score += 7;
    }

    // 4. Discipline score boost (up to 10 pts)
    if (psych.discipline_score >= 8) {
      score += 10;
    } else if (psych.discipline_score >= 5) {
      score += 5;
    }

    // Penalties for major emotional violations
    if (psych.revenge_trade) score -= 15;
    if (psych.fomo_entry) score -= 15;
    if (psych.overtraded) score -= 10;
    if (psych.held_loss_hoping) score -= 15;
    if (psych.increased_risk_after_loss) score -= 15;
  }

  // 5. Entry confirmations (up to 15 pts)
  if (input.confirmationsCount >= 3) {
    score += 15;
  } else if (input.confirmationsCount >= 1) {
    score += 8;
  }

  // 6. Risk management adherence (up to 10 pts)
  const maxRisk = input.maxRiskPerTrade ?? 2000;
  if (input.plannedRisk <= maxRisk) {
    score += 10;
  } else {
    score -= 10;
  }

  // Clamp score between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getQualityScoreBadge(score: number): { label: string; colorClass: string } {
  if (score >= 85) return { label: 'A+ Elite', colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (score >= 70) return { label: 'Disciplined', colorClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
  if (score >= 55) return { label: 'Average', colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: 'High Risk / Impulsive', colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
}
