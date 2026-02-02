import type { AugmentRow } from '../google/sheets';

export type Tier = 'silver' | 'gold' | 'prismatic';

export function pickRandomAugments(params: {
  augments: AugmentRow[];
  tier: Tier;
  count: number; // e.g. 6
  stage?: number; // optional filter: augment.stage == stage OR augment.stage undefined
}): AugmentRow[] {
  const pool = params.augments.filter((a) => {
    if (a.tier !== params.tier) return false;
    if (params.stage == null) return true;
    return a.stage == null || a.stage === params.stage;
  });

  if (pool.length < params.count) {
    throw new Error(`Not enough augments in pool for tier=${params.tier} (have ${pool.length}, need ${params.count})`);
  }

  // Fisher–Yates shuffle first N
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, params.count);
}
