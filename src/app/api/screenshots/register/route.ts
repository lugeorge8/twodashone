import { NextResponse } from 'next/server';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  await requireProSession();

  const body = (await req.json().catch(() => null)) as null | {
    patch?: string;
    mode?: string;
    stage?: string;
    url?: string;
  };

  const patch = String(body?.patch ?? '').trim();
  const mode = String(body?.mode ?? '').trim() || 'augment_2_1';
  const stage = String(body?.stage ?? '').trim() || '1-4';
  const url = String(body?.url ?? '').trim();

  if (!patch || !url) {
    return NextResponse.json({ ok: false, error: 'Missing patch or url' }, { status: 400 });
  }

  await sql`
    insert into screenshots (patch, stage, mode, image_url)
    values (${patch}, ${stage}, ${mode}, ${url})
  `;

  return NextResponse.json({ ok: true });
}
