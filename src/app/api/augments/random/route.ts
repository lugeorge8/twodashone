import { NextResponse } from 'next/server';
import { readAugmentsFromSheet } from '@/lib/google/sheets';
import { pickRandomAugments } from '@/lib/augments/generate';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tier = (url.searchParams.get('tier') ?? 'silver') as 'silver' | 'gold' | 'prismatic';
  const count = Number(url.searchParams.get('count') ?? '6');
  const stageParam = url.searchParams.get('stage');
  const stage = stageParam ? Number(stageParam) : undefined;

  const spreadsheetId = process.env.AUGMENTS_SHEET_ID;
  const range = process.env.AUGMENTS_SHEET_RANGE ?? 'Augments!A:D';

  if (!spreadsheetId) {
    return NextResponse.json({ error: 'Missing AUGMENTS_SHEET_ID env var' }, { status: 500 });
  }

  if (!['silver', 'gold', 'prismatic'].includes(tier)) {
    return NextResponse.json({ error: 'tier must be silver|gold|prismatic' }, { status: 400 });
  }

  if (!Number.isFinite(count) || count <= 0 || count > 12) {
    return NextResponse.json({ error: 'count must be a number between 1 and 12' }, { status: 400 });
  }

  const augments = await readAugmentsFromSheet({ spreadsheetId, range });
  const picked = pickRandomAugments({ augments, tier, count, stage });

  return NextResponse.json({ tier, count, stage: stage ?? null, augments: picked });
}
