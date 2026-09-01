export type Instrument = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX' | 'STOCKS' | 'OTHER';
export type PositionType = 'Long' | 'Short';
export type OptionType = 'CE' | 'PE' | 'FUT' | 'EQUITY';
export type MarketTrend = 'Bullish' | 'Bearish' | 'Sideways';
export type MarketCondition = 'Trending' | 'Range' | 'Breakout' | 'Reversal' | 'High volatility' | 'Low volatility';
export type FollowedPlanOption = 'Yes' | 'Partially' | 'No';

export type EmotionType =
  | 'Calm'
  | 'Confident'
  | 'Nervous'
  | 'Fearful'
  | 'Excited'
  | 'Greedy'
  | 'FOMO'
  | 'Revenge'
  | 'Hesitant'
  | 'Angry'
  | 'Neutral';

export const MISTAKE_OPTIONS = [
  'Entered without confirmation',
  'FOMO entry',
  'Revenge trading',
  'Overtrading',
  'Moved stop-loss',
  "Didn't use stop-loss",
  'Held losing trade hoping for reversal',
  'Averaged a losing position',
  'Exited too early',
  "Didn't book profit according to plan",
  'Entered late',
  'Chased the move',
  'Took a trade outside my setup',
  'Took a low-quality setup',
  'Increased position size emotionally',
  'Traded after consecutive losses',
  'Traded because I wanted to recover previous loss',
  'Broke daily loss limit',
  'Broke maximum trade limit',
  'Ignored market conditions',
  'Ignored higher timeframe',
  'Entered because of boredom',
  'Other',
] as const;

export type MistakeType = (typeof MISTAKE_OPTIONS)[number];

export const ROOT_CAUSE_OPTIONS = [
  'Fear of loss',
  'Fear of missing the move',
  'Greed',
  'Revenge',
  'Impatience',
  'Lack of preparation',
  'Lack of confidence',
  'Overconfidence',
  'Boredom',
  "Didn't follow my rules",
  'Market uncertainty',
  'Other',
] as const;

export type RootCauseType = (typeof ROOT_CAUSE_OPTIONS)[number];

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRiskSettings {
  id: string;
  user_id: string;
  capital: number;
  max_risk_per_trade: number;
  max_daily_loss: number;
  max_trades_per_day: number;
  max_consecutive_losses: number;
  max_position_size: number;
  created_at?: string;
}

export interface TradingRule {
  id: string;
  user_id: string;
  rule_name: string;
  description: string;
  enabled: boolean;
  created_at?: string;
}

export interface TradePsychology {
  id?: string;
  trade_id?: string;
  user_id?: string;
  emotion_before: EmotionType;
  emotion_during: EmotionType;
  emotion_after: EmotionType;
  discipline_score: number; // 1 - 10
  confidence_before: number; // 1 - 10
  followed_plan: FollowedPlanOption;
  moved_stop_loss: boolean;
  exited_early: boolean;
  held_loss_hoping: boolean;
  revenge_trade: boolean;
  overtraded: boolean;
  fomo_entry: boolean;
  increased_risk_after_loss: boolean;
  emotional_notes?: string;
}

export interface TradeScreenshot {
  id: string;
  trade_id: string;
  screenshot_url: string;
  screenshot_type: 'entry' | 'exit' | 'setup';
  created_at?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string; // YYYY-MM-DD
  entry_time: string; // HH:MM
  exit_time?: string;
  instrument: Instrument;
  symbol: string;
  expiry?: string;
  option_type: OptionType;
  strike_price?: number;
  position_type: PositionType;
  quantity: number;
  lots: number;
  
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  target: number;
  planned_risk: number;
  planned_reward: number;
  brokerage: number;
  taxes_charges: number;
  
  gross_pnl: number;
  net_pnl: number;
  risk_reward_ratio: number;
  percentage_return: number;
  points_gained: number;
  trade_duration_mins: number;
  trade_quality_score: number; // 0 - 100
  
  market_trend?: MarketTrend;
  htf_trend?: MarketTrend;
  entry_timeframe?: string;
  market_condition?: MarketCondition;
  strategy: string;
  custom_strategy_name?: string;
  technical_confirmations: string[];
  
  entry_reason?: string;
  stop_loss_reason?: string;
  target_reason?: string;
  expected_scenario?: string;
  invalidating_condition?: string;
  notes?: string;
  mistakes?: string[];
  
  psychology?: TradePsychology;
  screenshots?: TradeScreenshot[];
  created_at?: string;
}

export interface DailyJournal {
  id: string;
  user_id: string;
  journal_date: string; // YYYY-MM-DD
  completed: boolean;
  
  // Summary & Plan Adherence
  daily_pnl?: number;
  trade_count?: number;
  discipline_score: number; // 1 - 10
  followed_plan: FollowedPlanOption;
  
  // Yesterday's Rule Follow-Up
  yesterday_rule?: string;
  followed_yesterday_rule?: FollowedPlanOption;
  yesterday_rule_notes?: string;
  
  // Mistakes Checklist & Details
  selected_mistakes: string[];
  what_happened_today?: string;
  biggest_mistake?: string;
  why_made_mistake?: string;
  
  // Root Cause
  root_cause?: string;
  root_cause_explanation?: string;
  
  // Emotional State & Control
  pre_market_emotion?: EmotionType;
  during_market_emotion?: EmotionType;
  post_market_emotion?: EmotionType;
  emotional_control_score?: number; // 1 - 10
  
  // Reflection Questions
  what_did_well?: string;
  what_went_wrong?: string;
  what_learned?: string;
  do_differently_tomorrow?: string;
  
  // Tomorrow's Actionable Rule
  tomorrow_rule?: string;
  
  // Legacy optional fields preserved
  market_bias?: string;
  expected_scenarios?: string;
  key_levels?: string;
  max_daily_loss?: number;
  max_trades?: number;
  today_focus?: string;
  tomorrow_improvement?: string;
  violations_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RuleViolation {
  id: string;
  user_id: string;
  trade_id?: string;
  rule_id?: string;
  violation_name: string;
  pnl_impact: number;
  notes?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  totalPnL: number;
  todayPnL: number;
  thisWeekPnL: number;
  thisMonthPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  riskRewardRatio: number;
  totalTrades: number;
  avgDurationMins: number;
  maxDrawdown: number;
  currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
  maxWinStreak: number;
  maxLossStreak: number;
  tradeQualityAvg: number;
}

export interface StrategyStat {
  strategy: string;
  tradeCount: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  profitFactor: number;
  avgRR: number;
  expectancy: number;
  expectancyR: number;
}

export interface BehavioralInsight {
  id: string;
  title: string;
  description: string;
  severity?: 'high' | 'medium' | 'low';
  category?: string;
  type?: string;
  statLabel?: string;
  statValue?: string;
  metricDiff?: string;
  confidence?: number | string;
  actionableTip?: string;
}

export interface TimeSlotStat {
  slot: string;
  tradeCount: number;
  totalPnL: number;
  winRate: number;
}

export interface DayOfWeekStat {
  day: string;
  tradeCount: number;
  totalPnL: number;
  winRate: number;
}
