import { Trade, DailyJournal, TradingRule, UserRiskSettings, RuleViolation } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  getSampleTrades,
  getSampleDailyJournals,
  getSampleTradingRules,
  getSampleRiskSettings,
  getSampleRuleViolations,
} from '../seed/sampleDataGenerator';

const STORAGE_KEYS = {
  TRADES: 'trading_journal_trades_v1',
  JOURNALS: 'trading_journal_daily_v1',
  RULES: 'trading_journal_rules_v1',
  RISK: 'trading_journal_risk_v1',
  VIOLATIONS: 'trading_journal_violations_v1',
  INITIALIZED: 'trading_journal_init_v1',
};

export class LocalJournalStore {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public static initializeData(forceSample: boolean = false): void {
    if (!this.isBrowser()) return;

    if (forceSample) {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(getSampleTrades()));
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(getSampleDailyJournals()));
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(getSampleTradingRules()));
      localStorage.setItem(STORAGE_KEYS.RISK, JSON.stringify(getSampleRiskSettings()));
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(getSampleRuleViolations()));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(getSampleTradingRules()));
      localStorage.setItem(STORAGE_KEYS.RISK, JSON.stringify(getSampleRiskSettings()));
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  public static clearAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify([]));
  }

  // Trades
  public static getTrades(): Trade[] {
    if (!this.isBrowser()) return [];
    this.initializeData();
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    return data ? JSON.parse(data) : [];
  }

  public static async fetchTradesAsync(): Promise<Trade[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('trade_date', { ascending: false });

        if (!error && data) {
          if (this.isBrowser()) {
            localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(data));
          }
          return data as Trade[];
        }
      } catch (e) {
        console.error('Failed to fetch trades from Supabase:', e);
      }
    }
    return this.getTrades();
  }

  public static saveTrade(trade: Trade): void {
    if (!this.isBrowser()) return;
    const trades = this.getTrades();
    const existingIdx = trades.findIndex((t) => t.id === trade.id);
    
    if (existingIdx >= 0) {
      trades[existingIdx] = trade;
    } else {
      trades.unshift(trade);
    }

    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));

    // Supabase Cloud Sync
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        supabase
          .from('trades')
          .upsert(
            {
              user_id: '00000000-0000-0000-0000-000000000000',
              trade_date: trade.trade_date,
              entry_time: trade.entry_time,
              exit_time: trade.exit_time || null,
              instrument: trade.instrument,
              symbol: trade.symbol,
              expiry: trade.expiry || null,
              option_type: trade.option_type || null,
              position_type: trade.position_type,
              quantity: Number(trade.quantity),
              lots: Number(trade.lots),
              entry_price: Number(trade.entry_price),
              exit_price: Number(trade.exit_price),
              stop_loss: Number(trade.stop_loss),
              target: Number(trade.target),
              net_pnl: Number(trade.net_pnl),
              points_gained: Number(trade.points_gained),
              percentage_return: Number(trade.percentage_return),
              risk_reward_ratio: Number(trade.risk_reward_ratio),
              brokerage: Number(trade.brokerage),
              taxes_charges: Number(trade.taxes_charges),
              status: 'Closed',
              trade_duration_mins: Number(trade.trade_duration_mins),
              trade_quality_score: Number(trade.trade_quality_score),
              market_trend: trade.market_trend,
              entry_timeframe: trade.entry_timeframe,
              market_condition: trade.market_condition,
              strategy: trade.strategy,
              technical_confirmations: trade.technical_confirmations || [],
              entry_reason: trade.entry_reason || null,
              notes: trade.notes || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
          .then(({ error }) => {
            if (error) console.error('Supabase Trade Sync Error:', error);
            else console.log('Successfully synced trade to Supabase!');
          });
      } catch (err) {
        console.error('Supabase Sync Failed:', err);
      }
    }
  }

  public static deleteTrade(tradeId: string): void {
    if (!this.isBrowser()) return;
    const trades = this.getTrades().filter((t) => t.id !== tradeId);
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  }

  // Daily Journals
  public static getJournals(): DailyJournal[] {
    if (!this.isBrowser()) return [];
    this.initializeData();
    const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    const journals: DailyJournal[] = data ? JSON.parse(data) : [];
    return journals.sort((a, b) => new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime());
  }

  public static async fetchJournalsAsync(): Promise<DailyJournal[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('daily_journals')
          .select('*')
          .order('journal_date', { ascending: false });

        if (!error && data) {
          if (this.isBrowser()) {
            localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(data));
          }
          return data as DailyJournal[];
        }
      } catch (e) {
        console.error('Failed to fetch journals from Supabase:', e);
      }
    }
    return this.getJournals();
  }

  public static getJournalByDate(dateStr: string): DailyJournal | undefined {
    const journals = this.getJournals();
    return journals.find((j) => j.journal_date === dateStr);
  }

  public static getYesterdayJournal(currentDateStr?: string): DailyJournal | undefined {
    const journals = this.getJournals();
    const today = currentDateStr || new Date().toISOString().split('T')[0];
    const pastJournals = journals.filter((j) => j.journal_date < today);
    return pastJournals[0];
  }

  public static saveJournal(journal: DailyJournal): void {
    if (!this.isBrowser()) return;

    // Save locally
    const journals = this.getJournals();
    const idx = journals.findIndex((j) => j.journal_date === journal.journal_date);
    if (idx >= 0) {
      journals[idx] = journal;
    } else {
      journals.unshift(journal);
    }
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));

    // Supabase Cloud Sync
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const payload = {
          user_id: '00000000-0000-0000-0000-000000000000',
          journal_date: journal.journal_date,
          completed: journal.completed,
          daily_pnl: Number(journal.daily_pnl),
          trade_count: Number(journal.trade_count),
          discipline_score: Number(journal.discipline_score),
          followed_plan: journal.followed_plan,
          yesterday_rule: journal.yesterday_rule || null,
          followed_yesterday_rule: journal.followed_yesterday_rule || null,
          yesterday_rule_notes: journal.yesterday_rule_notes || null,
          selected_mistakes: journal.selected_mistakes || [],
          what_happened_today: journal.what_happened_today || null,
          biggest_mistake: journal.biggest_mistake || null,
          why_made_mistake: journal.why_made_mistake || null,
          root_cause: journal.root_cause || null,
          root_cause_explanation: journal.root_cause_explanation || null,
          pre_market_emotion: journal.pre_market_emotion || null,
          during_market_emotion: journal.during_market_emotion || null,
          post_market_emotion: journal.post_market_emotion || null,
          emotional_control_score: Number(journal.emotional_control_score || 7),
          what_did_well: journal.what_did_well || null,
          what_went_wrong: journal.what_went_wrong || null,
          what_learned: journal.what_learned || null,
          do_differently_tomorrow: journal.do_differently_tomorrow || null,
          tomorrow_rule: journal.tomorrow_rule || null,
          updated_at: new Date().toISOString(),
        };

        // Check if journal entry already exists for this date in Supabase
        supabase
          .from('daily_journals')
          .select('id')
          .eq('journal_date', journal.journal_date)
          .maybeSingle()
          .then(({ data: existingRecord }) => {
            if (existingRecord?.id) {
              // Update existing entry by ID
              supabase
                .from('daily_journals')
                .update(payload)
                .eq('id', existingRecord.id)
                .then(({ error: updateErr }) => {
                  if (updateErr) console.error('Supabase Daily Journal Update Error:', updateErr.message);
                  else console.log('Successfully updated daily journal in Supabase!');
                });
            } else {
              // Insert new entry
              supabase
                .from('daily_journals')
                .insert(payload)
                .then(({ error: insertErr }) => {
                  if (insertErr) console.error('Supabase Daily Journal Insert Error:', insertErr.message);
                  else console.log('Successfully inserted daily journal to Supabase!');
                });
            }
          });
      } catch (err) {
        console.error('Supabase Sync Failed:', err);
      }
    }
  }

  // Mistake Statistics & Frequency
  public static getMistakeFrequencies(): { mistake: string; count: number }[] {
    const journals = this.getJournals();
    const counts: Record<string, number> = {};

    journals.forEach((j) => {
      const mistakes = j.selected_mistakes || [];
      mistakes.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });

      if (j.biggest_mistake && j.biggest_mistake !== 'None' && j.biggest_mistake !== 'None today.' && !counts[j.biggest_mistake]) {
        counts[j.biggest_mistake] = (counts[j.biggest_mistake] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([mistake, count]) => ({ mistake, count }))
      .sort((a, b) => b.count - a.count);
  }

  public static getRepeatedMistakesAlerts(): string[] {
    const journals = this.getJournals();
    const last10 = journals.slice(0, 10);
    const counts: Record<string, number> = {};

    last10.forEach((j) => {
      const mistakes = j.selected_mistakes || [];
      if (j.biggest_mistake && j.biggest_mistake !== 'None' && j.biggest_mistake !== 'None today.') {
        mistakes.push(j.biggest_mistake);
      }
      const uniqueInDay = Array.from(new Set(mistakes));
      uniqueInDay.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });

    const alerts: string[] = [];
    Object.entries(counts).forEach(([mistake, count]) => {
      if (count >= 2) {
        alerts.push(`"${mistake}" occurred ${count} times in your last 10 trading sessions.`);
      }
    });

    return alerts;
  }

  // Rules
  public static getRules(): TradingRule[] {
    if (!this.isBrowser()) return getSampleTradingRules();
    this.initializeData();
    const data = localStorage.getItem(STORAGE_KEYS.RULES);
    return data ? JSON.parse(data) : getSampleTradingRules();
  }

  public static saveRules(rules: TradingRule[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }

  // Risk Settings
  public static getRiskSettings(): UserRiskSettings {
    if (!this.isBrowser()) return getSampleRiskSettings();
    this.initializeData();
    const data = localStorage.getItem(STORAGE_KEYS.RISK);
    return data ? JSON.parse(data) : getSampleRiskSettings();
  }

  public static saveRiskSettings(settings: UserRiskSettings): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.RISK, JSON.stringify(settings));
  }

  // Rule Violations
  public static getViolations(): RuleViolation[] {
    if (!this.isBrowser()) return [];
    this.initializeData();
    const data = localStorage.getItem(STORAGE_KEYS.VIOLATIONS);
    return data ? JSON.parse(data) : [];
  }
}
