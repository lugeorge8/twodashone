import type { Tier } from '@/lib/augments/generate';
import { pickRandomAugments } from '@/lib/augments/generate';
import { getAugmentsFromConfiguredSource } from '@/lib/augments/source';

export type TierMode = 'mixed' | 'silver' | 'gold' | 'prismatic';

export type TrainingSpotDraft = {
  idx: number; // 1..20
  stage: string; // e.g. '2-1' | '3-2' | '4-2'
  options: Array<{ id: 'a' | 'b' | 'c' | 'a1' | 'b1' | 'c1'; name: string; tier: Tier; description: string }>;
};

export async function generateTrainingSetSpots(params: {
  tierMode: TierMode;
  stage: 2 | 3 | 4; // which augment stage to filter against
  stageLabel: string; // e.g. '2-1'|'3-2'|'4-2'
}) {
  const { augments, status } = await getAugmentsFromConfiguredSource();
  if (!status.ok) throw new Error(status.error ?? 'Augments source not configured');

  const stage = params.stage;

  const tiers: Tier[] = params.tierMode === 'mixed'
    ? ['silver', 'gold', 'prismatic']
    : [params.tierMode];

  // 20 spots. If mixed: distribute as evenly as possible across tiers.
  const tierForIdx = (i: number): Tier => {
    if (tiers.length === 1) return tiers[0];
    return tiers[(i - 1) % tiers.length];
  };

  const spots: TrainingSpotDraft[] = [];
  for (let i = 1; i <= 20; i++) {
    const tier = tierForIdx(i);
    const picked6 = pickRandomAugments({ augments, tier, count: 6, stage });
    const ids = ['a', 'b', 'c', 'a1', 'b1', 'c1'] as const;
    const options = picked6.map((o, j) => ({
      id: ids[j],
      name: o.name,
      tier: o.tier,
      description: o.description,
    }));
    spots.push({ idx: i, stage: params.stageLabel as any, options });
  }

  return { spots, sourceStatus: status };
}
