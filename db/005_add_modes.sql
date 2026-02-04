-- Add mode to training sets and screenshot library
-- Modes (for now): augment_2_1 | augment_3_2 | augment_4_2

alter table training_sets
  add column if not exists mode text not null default 'augment_2_1';

alter table screenshots
  add column if not exists mode text not null default 'augment_2_1';

create index if not exists screenshots_patch_mode_stage_created on screenshots(patch, mode, stage, created_at desc);
