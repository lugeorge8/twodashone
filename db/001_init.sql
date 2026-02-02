-- twodashone: curated training sets (Vercel Postgres)

-- Pros (answer-key creators)
create table if not exists pros (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Training sets
create table if not exists training_sets (
  id text primary key, -- e.g. Dishsoap16.03bTS0001
  patch text not null,
  pro_id uuid not null references pros(id) on delete cascade,
  tier_mode text not null check (tier_mode in ('mixed','silver','gold','prismatic')),
  status text not null check (status in ('draft','review','published')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Training spots (20 per set)
create table if not exists training_spots (
  id uuid primary key default gen_random_uuid(),
  set_id text not null references training_sets(id) on delete cascade,
  idx int not null check (idx >= 1 and idx <= 20),
  stage text not null default '1-4',
  screenshot_url text,
  augment_options jsonb not null, -- array of 6 {name, tier, description}
  correct_augment_name text,
  created_at timestamptz not null default now(),
  unique (set_id, idx)
);

create index if not exists training_spots_set_idx on training_spots(set_id, idx);
