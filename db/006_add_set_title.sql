-- Add human-friendly title for training sets

alter table training_sets
  add column if not exists title text not null default '';

create index if not exists training_sets_status_published_at on training_sets(status, published_at desc);
