-- Trading Journal Supabase Database Schema
-- Daily Mistake Review & Accountability Model (Single-User & Auth Compatible)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
drop policy if exists "Allow public all access profiles" on public.profiles;
create policy "Allow public all access profiles" on public.profiles for all using (true) with check (true);

-- 2. USER RISK SETTINGS TABLE
create table if not exists public.user_risk_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  account_capital numeric(14, 2) default 100000.00,
  max_risk_per_trade numeric(12, 2) default 2000.00,
  max_daily_loss numeric(12, 2) default 5000.00,
  max_trades_per_day integer default 4,
  max_position_size integer default 100,
  risk_per_trade_percentage numeric(5, 2) default 2.0,
  daily_loss_percentage numeric(5, 2) default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_risk_settings alter column user_id drop not null;
alter table public.user_risk_settings drop constraint if exists user_risk_settings_user_id_fkey;
alter table public.user_risk_settings enable row level security;
drop policy if exists "Allow public all access risk" on public.user_risk_settings;
create policy "Allow public all access risk" on public.user_risk_settings for all using (true) with check (true);

-- 3. TRADING RULES TABLE
create table if not exists public.trading_rules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  rule_title text not null,
  rule_description text,
  category text not null default 'risk',
  is_active boolean default true,
  strictness_level text default 'hard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trading_rules alter column user_id drop not null;
alter table public.trading_rules drop constraint if exists trading_rules_user_id_fkey;
alter table public.trading_rules enable row level security;
drop policy if exists "Allow public all access rules" on public.trading_rules;
create policy "Allow public all access rules" on public.trading_rules for all using (true) with check (true);

-- 4. TRADES TABLE
create table if not exists public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  trade_date date not null default CURRENT_DATE,
  entry_time time not null,
  exit_time time,
  instrument text not null default 'NIFTY',
  symbol text not null,
  expiry text,
  option_type text default 'CE',
  strike_price numeric(10, 2),
  position_type text not null default 'Long',
  quantity integer not null default 25,
  lots integer not null default 1,
  
  entry_price numeric(12, 2) not null,
  exit_price numeric(12, 2),
  stop_loss numeric(12, 2) not null,
  target numeric(12, 2) not null,
  gross_pnl numeric(14, 2) default 0,
  net_pnl numeric(14, 2) default 0,
  points_gained numeric(10, 2) default 0,
  percentage_return numeric(8, 2) default 0,
  risk_reward_ratio numeric(6, 2) default 0,
  brokerage numeric(10, 2) default 40,
  taxes_charges numeric(10, 2) default 20,
  
  status text not null default 'Closed',
  trade_duration_mins integer,
  trade_quality_score integer default 75,
  
  market_trend text,
  htf_trend text,
  entry_timeframe text,
  market_condition text,
  strategy text not null default 'Price Action',
  custom_strategy_name text,
  technical_confirmations text[] default '{}',
  
  entry_reason text,
  stop_loss_reason text,
  target_reason text,
  expected_scenario text,
  invalidating_condition text,
  notes text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trades alter column user_id drop not null;
alter table public.trades drop constraint if exists trades_user_id_fkey;
alter table public.trades enable row level security;
drop policy if exists "Allow public all access trades" on public.trades;
create policy "Allow public all access trades" on public.trades for all using (true) with check (true);

-- 5. TRADE PSYCHOLOGY TABLE
create table if not exists public.trade_psychology (
  id uuid default uuid_generate_v4() primary key,
  trade_id uuid references public.trades on delete cascade,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  
  emotion_before text not null,
  emotion_during text not null,
  emotion_after text not null,
  discipline_score integer default 7,
  confidence_before integer default 7,
  followed_plan text default 'Yes',
  moved_stop_loss boolean default false,
  exited_early boolean default false,
  held_loss_hoping boolean default false,
  revenge_trade boolean default false,
  overtraded boolean default false,
  fomo_entry boolean default false,
  increased_risk_after_loss boolean default false,
  emotional_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trade_psychology alter column user_id drop not null;
alter table public.trade_psychology drop constraint if exists trade_psychology_user_id_fkey;
alter table public.trade_psychology enable row level security;
drop policy if exists "Allow public all access psychology" on public.trade_psychology;
create policy "Allow public all access psychology" on public.trade_psychology for all using (true) with check (true);

-- 6. DAILY JOURNALS TABLE (REDESIGNED FOR DAILY MISTAKE REVIEW & ACCOUNTABILITY)
create table if not exists public.daily_journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  journal_date date not null default CURRENT_DATE,
  completed boolean default false,
  
  -- Trading Summary
  daily_pnl numeric(14, 2) default 0,
  trade_count integer default 0,
  discipline_score integer default 7,
  followed_plan text default 'Yes',
  
  -- Yesterday's Rule Follow-Up
  yesterday_rule text,
  followed_yesterday_rule text,
  yesterday_rule_notes text,
  
  -- Mistakes Checklist & Details
  selected_mistakes text[] default '{}',
  what_happened_today text,
  biggest_mistake text,
  why_made_mistake text,
  
  -- Root Cause
  root_cause text,
  root_cause_explanation text,
  
  -- Emotional State
  pre_market_emotion text,
  during_market_emotion text,
  post_market_emotion text,
  emotional_control_score integer default 7,
  
  -- Daily Reflection
  what_did_well text,
  what_went_wrong text,
  what_learned text,
  do_differently_tomorrow text,
  
  -- Tomorrow's Actionable Rule
  tomorrow_rule text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drop NOT NULL constraint on user_id for single-user mode
alter table public.daily_journals alter column user_id drop not null;

-- Drop foreign key to auth.users so single-user mode can insert without login
alter table public.daily_journals drop constraint if exists daily_journals_user_id_fkey;

-- Ensure explicit unique constraint on journal_date for ON CONFLICT Specification in PostgreSQL
alter table public.daily_journals drop constraint if exists daily_journals_journal_date_key;
alter table public.daily_journals add constraint daily_journals_journal_date_key unique (journal_date);

alter table public.daily_journals enable row level security;
drop policy if exists "Allow public all access journals" on public.daily_journals;
create policy "Allow public all access journals" on public.daily_journals for all using (true) with check (true);

-- 7. RULE VIOLATIONS TABLE
create table if not exists public.rule_violations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
  trade_id uuid references public.trades on delete cascade,
  rule_id uuid references public.trading_rules on delete cascade,
  violation_name text not null,
  pnl_impact numeric(14, 2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rule_violations alter column user_id drop not null;
alter table public.rule_violations drop constraint if exists rule_violations_user_id_fkey;
alter table public.rule_violations enable row level security;
drop policy if exists "Allow public all access violations" on public.rule_violations;
create policy "Allow public all access violations" on public.rule_violations for all using (true) with check (true);
