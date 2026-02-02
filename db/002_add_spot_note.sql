-- Add optional pro explanation for the correct augment choice
alter table training_spots
  add column if not exists correct_augment_note text;
