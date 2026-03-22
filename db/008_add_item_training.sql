-- Add item slam training support

-- New training mode (stored as text, so no schema change needed for mode column values)

alter table training_spots
  add column if not exists item_components jsonb not null default '[]'::jsonb;

alter table training_spots
  add column if not exists item_slam_options jsonb not null default '[]'::jsonb;

-- For item mode:
-- - item_components: array of component ids, e.g. ["bow","rod","chain"]
-- - item_slam_options: array of { id, name, recipe: [c1,c2] }
-- - correct_action_type: 'slam' | 'no_slam'
-- - correct_pick_id: when slam, set to item id (e.g. 'guinsoos_rageblade')
