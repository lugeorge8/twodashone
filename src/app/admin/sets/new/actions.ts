'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatTrainingSetId } from '@/lib/training/ids';
import { generateTrainingSetSpots, type TierMode } from '@/lib/training/generate';
import type { TrainingMode } from '@/lib/training/modes';
import { modeToAugmentStage, modeToStageLabel } from '@/lib/training/modes';

function slugifyPro(displayName: string) {
  // Keep it simple: remove spaces/punct.
  return displayName.replace(/[^a-zA-Z0-9]/g, '');
}

export async function createTrainingSetAction(formData: FormData) {
  const session = await requireProSession();

  const patch = String(formData.get('patch') ?? '').trim();
  const tierMode = String(formData.get('tierMode') ?? 'mixed').trim() as TierMode;
  const mode = String(formData.get('mode') ?? 'augment_2_1').trim() as TrainingMode;
  const titleSuffix = String(formData.get('titleSuffix') ?? '').trim();

  if (!patch) {
    redirect('/admin/sets/new?error=patch');
  }

  if (!titleSuffix) {
    redirect('/admin/sets/new?error=title');
  }

  if (!['mixed', 'silver', 'gold', 'prismatic'].includes(tierMode)) {
    redirect('/admin/sets/new?error=tier');
  }

  if (!['augment_2_1', 'augment_3_2', 'augment_4_2'].includes(mode)) {
    redirect('/admin/sets/new?error=mode');
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

  const proName = session.displayName ?? 'Pro';
  const proSlug = slugifyPro(proName);
  const id = formatTrainingSetId({ proSlug, patch, seq: nextSeq });

  const title = `${proSlug}.patch${patch}.${titleSuffix}`;

  const augStage = modeToAugmentStage(mode);
  const stageLabel = modeToStageLabel(mode);

  const gen = await generateTrainingSetSpots({ tierMode, stage: augStage, stageLabel });

  // Pick 20 screenshots for this patch (repeats ok).
  const shots = await sql<{ image_url: string }>`
    select image_url from screenshots
    where patch = ${patch} and mode = ${mode}
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
      insert into training_sets (id, title, patch, pro_id, tier_mode, status, mode)
      values (${id}, ${title}, ${patch}, ${session.proId!}, ${tierMode}, 'draft', ${mode})
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

  redirect(`/admin/sets/${encodeURIComponent(id)}/spots/1`);
}
