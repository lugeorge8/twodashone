import type { Tier } from '@/lib/augments/generate';
import { pickRandomAugments } from '@/lib/augments/generate';
import { getAugmentsFromConfiguredSource } from '@/lib/augments/source';

export type TierMode = 'mixed' | 'silver' | 'gold' | 'prismatic';

export type TrainingSpotDraft = {
  idx: number; // 1..20
  stage: '1-4';
  options: Array<{ name: string; tier: Tier; description: string }>;
};

export async function generateTrainingSetSpots(params: {
  tierMode: TierMode;
  stage?: 2 | 3 | 4; // which augment stage to filter against; default 2
}) {
  const { augments, status } = await getAugmentsFromConfiguredSource();
  if (!status.ok) throw new Error(status.error ?? 'Augments source not configured');

  const stage = params.stage ?? 2;

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
    const options = pickRandomAugments({ augments, tier, count: 6, stage });
    spots.push({ idx: i, stage: '1-4', options: options.map(({ name, tier, description }) => ({ name, tier, description })) });
  }

  return { spots, sourceStatus: status };
}
