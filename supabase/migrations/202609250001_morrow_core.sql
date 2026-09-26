create extension if not exists pgcrypto;

create table if not exists public.currencies (
  code text primary key check (char_length(code) = 3),
  name text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.countries (
  id text primary key check (char_length(id) = 2),
  slug text unique not null,
  name text not null,
  currency_codes text[] not null default '{}',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id text primary key,
  slug text unique not null,
  name text not null,
  logo_url text,
  website_url text,
  affiliate_url text,
  affiliate_tracking_id text,
  profile jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.corridors (
  id uuid primary key default gen_random_uuid(),
  from_country_id text not null references public.countries(id),
  to_country_id text not null references public.countries(id),
  from_currency text not null references public.currencies(code),
  to_currency text not null references public.currencies(code),
  enabled boolean not null default false,
  featured boolean not null default false,
  unique (from_country_id, to_country_id, from_currency, to_currency)
);

create table if not exists public.manual_quotes (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id),
  corridor_id uuid not null references public.corridors(id),
  fee_amount numeric(20, 8) not null check (fee_amount >= 0),
  fee_type text not null check (fee_type in ('fixed', 'percentage', 'variable')),
  payment_method_fees jsonb not null default '{}'::jsonb,
  other_disclosed_charges jsonb not null default '[]'::jsonb,
  provider_exchange_rate numeric(24, 12) not null check (provider_exchange_rate > 0),
  mid_market_rate numeric(24, 12),
  minimum_transfer numeric(20, 8),
  maximum_transfer numeric(20, 8),
  delivery_min_minutes integer,
  delivery_max_minutes integer,
  payment_methods text[] not null default '{}',
  receiving_methods text[] not null default '{}',
  promotion jsonb,
  source text not null default 'manual' check (source = 'manual'),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create index if not exists manual_quotes_route_idx on public.manual_quotes (corridor_id, provider_id, valid_until);

create table if not exists public.saved_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_country_id text not null references public.countries(id),
  to_country_id text not null references public.countries(id),
  send_amount numeric(20, 8),
  send_currency text not null references public.currencies(code),
  receive_currency text not null references public.currencies(code),
  favorite_provider_id text references public.providers(id),
  created_at timestamptz not null default now()
);

create table if not exists public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_currency text not null references public.currencies(code),
  to_currency text not null references public.currencies(code),
  target_rate numeric(24, 12) not null check (target_rate > 0),
  channel text not null default 'email' check (channel in ('email', 'push')),
  enabled boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('impression', 'click')),
  provider_id text references public.providers(id),
  from_country_id text references public.countries(id),
  to_country_id text references public.countries(id),
  send_amount numeric(20, 8),
  currency text,
  ranking_position integer,
  created_at timestamptz not null default now()
);

alter table public.currencies enable row level security;
alter table public.countries enable row level security;
alter table public.providers enable row level security;
alter table public.corridors enable row level security;
alter table public.manual_quotes enable row level security;
alter table public.saved_transfers enable row level security;
alter table public.rate_alerts enable row level security;
alter table public.affiliate_events enable row level security;

create policy "Enabled currencies are public" on public.currencies for select using (enabled);
create policy "Enabled countries are public" on public.countries for select using (enabled);
create policy "Enabled providers are public" on public.providers for select using (enabled);
create policy "Enabled corridors are public" on public.corridors for select using (enabled);
create policy "Users manage their saved transfers" on public.saved_transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their rate alerts" on public.rate_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Manual quotes and analytics are server-only; no client policy is granted.