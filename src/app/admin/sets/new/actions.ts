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

  await sql`begin`;
  try {
    await sql`
      insert into training_sets (id, patch, pro_id, tier_mode, status)
      values (${id}, ${patch}, ${session.proId!}, ${tierMode}, 'draft')
    `;

    for (const s of gen.spots) {
      await sql`
        insert into training_spots (set_id, idx, stage, augment_options)
        values (${id}, ${s.idx}, ${s.stage}, ${JSON.stringify(s.options)}::jsonb)
      `;
    }

    await sql`commit`;
  } catch (e) {
    await sql`rollback`;
    throw e;
  }

  redirect(`/admin/sets/${encodeURIComponent(id)}`);
}
