create extension if not exists pgcrypto;

create table public.ledgers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_key_hash text not null unique,
  created_at timestamptz not null default now()
);

create table public.ledger_members (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  member_key text not null check (member_key in ('me', 'partner')),
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (ledger_id, member_key)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid references public.ledgers(id) on delete cascade,
  key text not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (ledger_id, key)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  category_id uuid not null references public.categories(id),
  spent_on date not null,
  note text not null default '',
  created_by_member_id uuid not null references public.ledger_members(id),
  paid_by_member_id uuid not null references public.ledger_members(id),
  split_mode text not null check (split_mode in ('equal', 'single', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.ledger_members(id),
  share_cents integer not null check (share_cents >= 0),
  unique (expense_id, member_id)
);

alter table public.ledgers enable row level security;
alter table public.ledger_members enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

create index expenses_ledger_spent_on_idx on public.expenses (ledger_id, spent_on desc);
create index expense_splits_expense_id_idx on public.expense_splits (expense_id);
