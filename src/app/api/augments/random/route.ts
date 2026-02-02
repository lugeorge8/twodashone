import { NextResponse } from 'next/server';
import { pickRandomAugments } from '@/lib/augments/generate';
import { getAugmentsFromConfiguredSource } from '@/lib/augments/source';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tier = (url.searchParams.get('tier') ?? 'silver') as 'silver' | 'gold' | 'prismatic';
  const count = Number(url.searchParams.get('count') ?? '6');

  const stageParam = url.searchParams.get('stage');
  const stageNum = stageParam ? Number(stageParam) : undefined;
  const stage = (stageNum === 2 || stageNum === 3 || stageNum === 4) ? stageNum : undefined;

  if (!['silver', 'gold', 'prismatic'].includes(tier)) {
    return NextResponse.json({ error: 'tier must be silver|gold|prismatic' }, { status: 400 });
  }

  if (!Number.isFinite(count) || count <= 0 || count > 12) {
    return NextResponse.json({ error: 'count must be a number between 1 and 12' }, { status: 400 });
  }

  const { augments, status } = await getAugmentsFromConfiguredSource();
  if (!status.ok) {
    return NextResponse.json({ error: status.error ?? 'Augments source not configured', status }, { status: 503 });
  }

  try {
    const picked = pickRandomAugments({ augments, tier, count, stage });
    return NextResponse.json({ tier, count, stage: stage ?? null, augments: picked });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e), tier, count, stage: stage ?? null },
      { status: 400 },
    );
  }
}
