'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatTrainingSetId } from '@/lib/training/ids';
import { generateTrainingSetSpots, type TierMode } from '@/lib/training/generate';

function slugifyPro(displayName: string) {
  // Keep it simple: remove spaces/punct.
  return displayName.replace(/[^a-zA-Z0-9]/g, '');
}

export async function createTrainingSetAction(formData: FormData) {
  const session = await requireProSession();

  const patch = String(formData.get('patch') ?? '').trim();
  const tierMode = String(formData.get('tierMode') ?? 'mixed').trim() as TierMode;

  if (!patch) {
    redirect('/admin/sets/new?error=patch');
  }

  if (!['mixed', 'silver', 'gold', 'prismatic'].includes(tierMode)) {
    redirect('/admin/sets/new?error=tier');
  }

  // Find next seq for this pro+patch
  const likePrefix = `${slugifyPro(session.displayName ?? 'Pro')}${patch}TS%`;
  const existing = await sql<{ id: string }>`
    select id from training_sets
    where pro_id = ${session.proId!} and patch = ${patch} and id like ${likePrefix}
    order by id desc
    limit 1
  `;

  let nextSeq = 1;
  if (existing.rows[0]?.id) {
    const m = existing.rows[0].id.match(/TS(\d{4})$/);
    if (m) nextSeq = Number(m[1]) + 1;
  }

  const id = formatTrainingSetId({ proSlug: slugifyPro(session.displayName ?? 'Pro'), patch, seq: nextSeq });

  const gen = await generateTrainingSetSpots({ tierMode, stage: 2 });

  // Pick 20 screenshots for this patch (repeats ok).
  const shots = await sql<{ image_url: string }>`
    select image_url from screenshots
    where patch = ${patch} and stage = '1-4'
    order by random()
    limit 50
  `;
  if (shots.rows.length === 0) {
    redirect('/admin/sets/new?error=no-screenshots');
  }
  const pickShot = (i: number) => shots.rows[i % shots.rows.length].image_url;

  // NOTE: On Vercel serverless, a pooled connection may not preserve a transaction
  // across multiple statements unless we hold a dedicated connection.
  // For MVP, we do best-effort inserts and cleanup on failure.
  try {
    await sql`
      insert into training_sets (id, patch, pro_id, tier_mode, status)
      values (${id}, ${patch}, ${session.proId!}, ${tierMode}, 'draft')
    `;

    for (const s of gen.spots) {
      await sql`
        insert into training_spots (set_id, idx, stage, augment_options, screenshot_url)
        values (${id}, ${s.idx}, ${s.stage}, ${JSON.stringify(s.options)}::jsonb, ${pickShot(s.idx - 1)})
      `;
    }
  } catch (e) {
    // Cleanup partial data
    await sql`delete from training_sets where id = ${id}`;
    throw e;
  }

  redirect(`/admin/sets/${encodeURIComponent(id)}`);
}
