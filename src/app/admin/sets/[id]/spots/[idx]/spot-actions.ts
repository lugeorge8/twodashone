'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';
import { generateTrainingSetSpots, type TierMode } from '@/lib/training/generate';

async function assertSetOwnership(proId: string, setId: string) {
  const owner = await sql<{ id: string; tier_mode: TierMode }>`
    select id, tier_mode from training_sets
    where id = ${setId} and pro_id = ${proId}
    limit 1
  `;
  if (!owner.rows[0]) redirect('/admin?error=not-allowed');
  return owner.rows[0];
}

export async function uploadSpotScreenshotAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const file = formData.get('screenshotFile');

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}`);
  }

  await assertSetOwnership(session.proId!, setId);

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}`);
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}?error=file-too-large`);
  }

  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  if (!allowed.has(file.type)) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}?error=bad-file-type`);
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const pathname = `screenshots/${encodeURIComponent(setId)}/spot-${idx}.${ext}`;

  const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true });

  await sql`
    update training_spots
    set screenshot_url = ${blob.url}
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}`);
}

export async function generateSpotAugmentsAction(formData: FormData) {
  const session = await requireProSession();
  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect('/admin');
  }

  const owner = await assertSetOwnership(session.proId!, setId);

  const spot = await sql<{ screenshot_url: string | null }>`
    select screenshot_url from training_spots where set_id = ${setId} and idx = ${idx} limit 1
  `;

  if (!spot.rows[0]?.screenshot_url) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}?error=no-screenshot`);
  }

  // Generate a single spot worth of options using the same logic (tier_mode + stage2)
  const gen = await generateTrainingSetSpots({ tierMode: owner.tier_mode, stage: 2 });
  const options = gen.spots[0].options; // use first generated spot

  await sql`
    update training_spots
    set augment_options = ${JSON.stringify(options)}::jsonb
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}`);
}

export async function saveSpotAnswerAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const correctPickRaw = String(formData.get('correctPickRaw') ?? '').trim();
  const note = String(formData.get('correctAugmentNote') ?? '').trim();

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect('/admin');
  }

  await assertSetOwnership(session.proId!, setId);

  const [correctPickId] = correctPickRaw.split('::');
  const actionType = correctPickId?.endsWith('1') ? 'reroll_then_pick' : 'pick';

  await sql`
    update training_spots
    set correct_pick_id = ${correctPickId || null},
        correct_action_type = ${correctPickId ? actionType : null},
        correct_augment_note = ${note || null}
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}`);
}
