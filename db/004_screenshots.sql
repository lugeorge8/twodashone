-- Screenshot library (Stage 1-4 board states)
create table if not exists screenshots (
  id uuid primary key default gen_random_uuid(),
  patch text not null,
  stage text not null default '1-4',
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists screenshots_patch_stage_created on screenshots(patch, stage, created_at desc);
