-- Record the order in which the pro rerolled augment slots (A/B/C)

alter table training_spots
  add column if not exists pro_roll_order jsonb not null default '[]'::jsonb;
