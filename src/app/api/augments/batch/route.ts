import { NextResponse } from 'next/server';
import { getAugmentsFromConfiguredSource } from '@/lib/augments/source';
import { pickRandomAugments } from '@/lib/augments/generate';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stageNum = Number(url.searchParams.get('stage') ?? '2');
  const stage = (stageNum === 2 || stageNum === 3 || stageNum === 4) ? stageNum : 2;

  const perTier = Number(url.searchParams.get('perTier') ?? '3');
  const countPerSelection = Number(url.searchParams.get('count') ?? '6');

  const { augments, status } = await getAugmentsFromConfiguredSource();
  if (!status.ok) {
    return NextResponse.json({ error: status.error ?? 'Augments source not configured', status }, { status: 503 });
  }

  const tiers = ['silver', 'gold', 'prismatic'] as const;

  const selections = [] as Array<{ tier: (typeof tiers)[number]; stage: number; options: unknown[] }>;
  for (const tier of tiers) {
    for (let i = 0; i < perTier; i++) {
      selections.push({
        tier,
        stage,
        options: pickRandomAugments({ augments, tier, count: countPerSelection, stage }),
      });
    }
  }

  return NextResponse.json({ stage, perTier, countPerSelection, selections });
}
