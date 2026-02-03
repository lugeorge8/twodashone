-- Store the pro's "correct" decision as an action (TFT-style A/B/C with hidden A1/B1/C1)
alter table training_spots
  add column if not exists correct_pick_id text;

alter table training_spots
  add column if not exists correct_action_type text;

-- Optional: constrain values loosely (can't use enum easily in alter-if-not-exists)
-- correct_pick_id expected: a|b|c|a1|b1|c1
-- correct_action_type expected: pick|reroll_then_pick
