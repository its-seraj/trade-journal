import {
  Trade,
  DashboardMetrics,
  StrategyStat,
  TimeSlotStat,
  DayOfWeekStat,
  BehavioralInsight,
} from '@/types';

export function calculateDashboardMetrics(trades: Trade[]): DashboardMetrics {
  if (!trades.length) {
    return {
      totalPnL: 0,
      todayPnL: 0,
      thisWeekPnL: 0,
      thisMonthPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      riskRewardRatio: 0,
      totalTrades: 0,
      avgDurationMins: 0,
      maxDrawdown: 0,
      currentStreak: { type: 'none', count: 0 },
      maxWinStreak: 0,
      maxLossStreak: 0,
      tradeQualityAvg: 0,
    };
  }

  const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalPnL = 0;
  let todayPnL = 0;
  let thisWeekPnL = 0;
  let thisMonthPnL = 0;

  const wins: number[] = [];
  const losses: number[] = [];
  let totalDurationMins = 0;
  let totalQuality = 0;
  let totalRRSum = 0;

  // Streak calculations
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  let currentStreakCount = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  // Drawdown tracking
  let peakEquity = 0;
  let runningEquity = 0;
  let maxDrawdown = 0;

  sorted.forEach((trade) => {
    const pnl = trade.net_pnl;
    totalPnL += pnl;
    runningEquity += pnl;

    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDrawdown = peakEquity - runningEquity;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    const tDate = new Date(trade.trade_date);
    if (trade.trade_date === todayStr) {
      todayPnL += pnl;
    }
    if (tDate >= startOfWeek) {
      thisWeekPnL += pnl;
    }
    if (tDate >= startOfMonth) {
      thisMonthPnL += pnl;
    }

    if (pnl > 0) {
      wins.push(pnl);
      tempWinStreak++;
      if (tempLossStreak > 0) tempLossStreak = 0;
      if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
    } else if (pnl < 0) {
      losses.push(Math.abs(pnl));
      tempLossStreak++;
      if (tempWinStreak > 0) tempWinStreak = 0;
      if (tempLossStreak > maxLossStreak) maxLossStreak = tempLossStreak;
    }

    totalDurationMins += trade.trade_duration_mins || 15;
    totalQuality += trade.trade_quality_score || 50;
    totalRRSum += trade.risk_reward_ratio || 1;
  });

  // Latest trade streak
  const lastTrade = sorted[sorted.length - 1];
  if (lastTrade) {
    currentStreakType = lastTrade.net_pnl >= 0 ? 'win' : 'loss';
    let count = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const type = sorted[i].net_pnl >= 0 ? 'win' : 'loss';
      if (type === currentStreakType) count++;
      else break;
    }
    currentStreakCount = count;
  }

  const winRate = (wins.length / trades.length) * 100;
  const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const totalWinsSum = wins.reduce((a, b) => a + b, 0);
  const totalLossesSum = losses.reduce((a, b) => a + b, 0);
  const profitFactor = totalLossesSum > 0 ? totalWinsSum / totalLossesSum : totalWinsSum > 0 ? 99.9 : 0;
  const riskRewardRatio = totalRRSum / trades.length;

  return {
    totalPnL,
    todayPnL,
    thisWeekPnL,
    thisMonthPnL,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    riskRewardRatio,
    totalTrades: trades.length,
    avgDurationMins: Math.round(totalDurationMins / trades.length),
    maxDrawdown,
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    maxWinStreak,
    maxLossStreak,
    tradeQualityAvg: Math.round(totalQuality / trades.length),
  };
}

export function generateEquityCurve(trades: Trade[], timeframe: string = 'All') {
  if (!trades.length) return [];

  let filtered = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

  const now = new Date();
  if (timeframe === '1W') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    filtered = filtered.filter((t) => new Date(t.trade_date) >= d);
  } else if (timeframe === '1M') {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    filtered = filtered.filter((t) => new Date(t.trade_date) >= d);
  } else if (timeframe === '3M') {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    filtered = filtered.filter((t) => new Date(t.trade_date) >= d);
  } else if (timeframe === '6M') {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    filtered = filtered.filter((t) => new Date(t.trade_date) >= d);
  }

  // Aggregate by trade_date
  const dateMap = new Map<string, number>();
  filtered.forEach((t) => {
    dateMap.set(t.trade_date, (dateMap.get(t.trade_date) || 0) + t.net_pnl);
  });

  let cumulative = 0;
  let peak = 0;
  
  return Array.from(dateMap.entries()).map(([date, dailyPnL]) => {
    cumulative += dailyPnL;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;

    return {
      date,
      dailyPnL,
      cumulativePnL: cumulative,
      drawdown: -drawdown, // negative for chart visual
      peakEquity: peak,
    };
  });
}

export function calculateStrategyStats(trades: Trade[]): StrategyStat[] {
  const map = new Map<string, Trade[]>();

  trades.forEach((t) => {
    const strat = t.strategy || 'Uncategorized';
    const list = map.get(strat) || [];
    list.push(t);
    map.set(strat, list);
  });

  return Array.from(map.entries()).map(([strategy, list]) => {
    const count = list.length;
    const wins = list.filter((t) => t.net_pnl > 0);
    const losses = list.filter((t) => t.net_pnl < 0);
    const winRate = (wins.length / count) * 100;
    const lossRate = (losses.length / count) * 100;
    const totalPnL = list.reduce((acc, t) => acc + t.net_pnl, 0);
    const avgPnL = totalPnL / count;

    const totalWinsSum = wins.reduce((acc, t) => acc + t.net_pnl, 0);
    const totalLossesSum = losses.reduce((acc, t) => acc + Math.abs(t.net_pnl), 0);
    const avgWin = wins.length ? totalWinsSum / wins.length : 0;
    const avgLoss = losses.length ? totalLossesSum / losses.length : 0;
    const profitFactor = totalLossesSum > 0 ? totalWinsSum / totalLossesSum : totalWinsSum > 0 ? 99.9 : 0;
    const avgRR = list.reduce((acc, t) => acc + (t.risk_reward_ratio || 1), 0) / count;

    // Expectancy calculation: Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
    const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;
    const avgPlannedRisk = list.reduce((acc, t) => acc + (t.planned_risk || 1000), 0) / count;
    const expectancyR = avgPlannedRisk > 0 ? expectancy / avgPlannedRisk : 0;

    return {
      strategy,
      tradeCount: count,
      winRate: Math.round(winRate),
      totalPnL,
      avgPnL,
      profitFactor: Number(profitFactor.toFixed(2)),
      avgRR: Number(avgRR.toFixed(2)),
      maxDrawdown: 0,
      expectancy: Math.round(expectancy),
      expectancyR: Number(expectancyR.toFixed(2)),
    };
  });
}

export function calculateTimeSlotStats(trades: Trade[]): TimeSlotStat[] {
  const slots = [
    { name: '9:15–10:00', start: '09:15', end: '10:00' },
    { name: '10:00–11:00', start: '10:00', end: '11:00' },
    { name: '11:00–12:00', start: '11:00', end: '12:00' },
    { name: '12:00–13:00', start: '12:00', end: '13:00' },
    { name: '13:00–14:00', start: '13:00', end: '14:00' },
    { name: '14:00–15:30', start: '14:00', end: '15:30' },
  ];

  return slots.map((slot) => {
    const slotTrades = trades.filter((t) => {
      const time = t.entry_time.slice(0, 5);
      return time >= slot.start && time < slot.end;
    });

    const count = slotTrades.length;
    if (!count) {
      return { slot: slot.name, tradeCount: 0, winRate: 0, totalPnL: 0, avgPnL: 0 };
    }

    const wins = slotTrades.filter((t) => t.net_pnl > 0).length;
    const totalPnL = slotTrades.reduce((a, b) => a + b.net_pnl, 0);

    return {
      slot: slot.name,
      tradeCount: count,
      winRate: Math.round((wins / count) * 100),
      totalPnL,
      avgPnL: Math.round(totalPnL / count),
    };
  });
}

export function calculateDayOfWeekStats(trades: Trade[]): DayOfWeekStat[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5]; // Date.getDay() => Sunday 0

  return days.map((dayName, idx) => {
    const dayTrades = trades.filter((t) => {
      const day = new Date(t.trade_date).getDay();
      // Monday is 1, Tuesday is 2...
      return day === idx + 1;
    });

    const count = dayTrades.length;
    if (!count) {
      return { day: dayName, tradeCount: 0, winRate: 0, totalPnL: 0 };
    }

    const wins = dayTrades.filter((t) => t.net_pnl > 0).length;
    const totalPnL = dayTrades.reduce((a, b) => a + b.net_pnl, 0);

    return {
      day: dayName,
      tradeCount: count,
      winRate: Math.round((wins / count) * 100),
      totalPnL,
    };
  });
}

export function generateBehavioralInsights(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];

  if (trades.length < 5) {
    insights.push({
      id: 'insufficient-data',
      title: 'Gathering Behavioral Baseline',
      description: `You have logged ${trades.length} trades. Log at least 5-10 trades to unlock deep psychological pattern recognition!`,
      type: 'info',
      confidence: 'Low',
      actionableTip: 'Continue recording emotions, plan adherence, and stop-loss decisions for every trade.',
    });
    return insights;
  }

  // 1. Followed Plan vs Violated Plan Win Rate
  const followedTrades = trades.filter((t) => t.psychology?.followed_plan === 'Yes');
  const violatedTrades = trades.filter((t) => t.psychology?.followed_plan === 'No');

  if (followedTrades.length >= 3 && violatedTrades.length >= 2) {
    const fWins = followedTrades.filter((t) => t.net_pnl > 0).length;
    const vWins = violatedTrades.filter((t) => t.net_pnl > 0).length;
    const fWinRate = Math.round((fWins / followedTrades.length) * 100);
    const vWinRate = Math.round((vWins / violatedTrades.length) * 100);

    if (fWinRate > vWinRate) {
      insights.push({
        id: 'plan-adherence',
        title: 'Plan Adherence Drives Profitability',
        description: `Trades where you followed your plan had a ${fWinRate}% win rate, compared to only ${vWinRate}% when you violated the plan!`,
        type: 'danger',
        metricDiff: `+${fWinRate - vWinRate}% Win Rate`,
        confidence: 'High',
        actionableTip: 'Do not enter the market without a written plan. If setups change mid-trade, do not alter your original criteria.',
      });
    }
  }

  // 2. Moved Stop Loss impact
  const movedSLTrades = trades.filter((t) => t.psychology?.moved_stop_loss);
  const respectedSLTrades = trades.filter((t) => t.psychology && !t.psychology.moved_stop_loss && t.net_pnl < 0);

  if (movedSLTrades.length >= 2) {
    const movedLosses = movedSLTrades.filter((t) => t.net_pnl < 0);
    const avgMovedLoss = movedLosses.length
      ? movedLosses.reduce((acc, t) => acc + Math.abs(t.net_pnl), 0) / movedLosses.length
      : 0;
    const avgRespectedLoss = respectedSLTrades.length
      ? respectedSLTrades.reduce((acc, t) => acc + Math.abs(t.net_pnl), 0) / respectedSLTrades.length
      : 1000;

    if (avgMovedLoss > avgRespectedLoss) {
      const ratio = (avgMovedLoss / avgRespectedLoss).toFixed(1);
      insights.push({
        id: 'stop-loss-moving',
        title: 'Moving Stop-Loss Increases Average Loss',
        description: `Your average loss is ${ratio}x higher (₹${Math.round(avgMovedLoss)}) when you move your stop-loss, compared to ₹${Math.round(avgRespectedLoss)} when respected!`,
        type: 'danger',
        metricDiff: `${ratio}x Larger Losses`,
        confidence: 'High',
        actionableTip: 'Set hard hard-coded system stop-losses upon entry and never widen them under pressure.',
      });
    }
  }

  // 3. FOMO Trades performance
  const fomoTrades = trades.filter((t) => t.psychology?.fomo_entry);
  if (fomoTrades.length >= 2) {
    const fomoPnL = fomoTrades.reduce((a, b) => a + b.net_pnl, 0);
    const fomoWins = fomoTrades.filter((t) => t.net_pnl > 0).length;
    const fomoWinRate = Math.round((fomoWins / fomoTrades.length) * 100);

    if (fomoPnL < 0 || fomoWinRate < 40) {
      insights.push({
        id: 'fomo-trades',
        title: 'FOMO Entries Cause Recurring Drawdowns',
        description: `You have logged ${fomoTrades.length} FOMO trades resulting in a net total P&L of ₹${Math.round(fomoPnL)} with a ${fomoWinRate}% win rate.`,
        type: 'warning',
        metricDiff: `Net P&L: ₹${Math.round(fomoPnL)}`,
        confidence: 'High',
        actionableTip: 'If price escapes your entry point, let it go. Wait for a pullback or next valid signal.',
      });
    }
  }

  // 4. Revenge Trading after losses
  const revengeTrades = trades.filter((t) => t.psychology?.revenge_trade);
  if (revengeTrades.length >= 2) {
    const revengePnL = revengeTrades.reduce((a, b) => a + b.net_pnl, 0);
    insights.push({
      id: 'revenge-trading',
      title: 'Revenge Trading Destroys Equity',
      description: `Revenge trades account for ₹${Math.round(Math.abs(revengePnL))} in losses across ${revengeTrades.length} trades.`,
      type: 'danger',
      metricDiff: `Loss: ₹${Math.round(revengePnL)}`,
      confidence: 'High',
      actionableTip: 'Take a mandatory 30-minute break away from charts after any losing trade.',
    });
  }

  // 5. Time slot vulnerability
  const timeSlots = calculateTimeSlotStats(trades);
  const worstSlot = [...timeSlots].sort((a, b) => a.totalPnL - b.totalPnL)[0];
  if (worstSlot && worstSlot.totalPnL < -2000 && worstSlot.tradeCount >= 3) {
    insights.push({
      id: 'time-slot-loss',
      title: `Vulnerable Trading Window: ${worstSlot.slot}`,
      description: `Your worst performing trading period is ${worstSlot.slot} with net P&L of ₹${worstSlot.totalPnL} (${worstSlot.winRate}% win rate).`,
      type: 'warning',
      metricDiff: `₹${worstSlot.totalPnL} in ${worstSlot.slot}`,
      confidence: 'Medium',
      actionableTip: `Consider taking a break or tightening entry criteria during ${worstSlot.slot}.`,
    });
  }

  return insights;
}
