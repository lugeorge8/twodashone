'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';

async function assertSetOwnership(proId: string, setId: string) {
  const owner = await sql<{ id: string }>`
    select id from training_sets
    where id = ${setId} and pro_id = ${proId}
    limit 1
  `;
  if (!owner.rows[0]) {
    redirect('/admin?error=not-allowed');
  }
}

// (deprecated) kept for backward compatibility while switching to per-spot pages
export async function uploadSpotScreenshotAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const file = formData.get('screenshotFile');

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}?error=bad-spot`);
  }

  await assertSetOwnership(session.proId!, setId);

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}#spot-${idx}`);
  }

  // Basic validations
  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}?error=file-too-large#spot-${idx}`);
  }

  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  if (!allowed.has(file.type)) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}?error=bad-file-type#spot-${idx}`);
  }

  // NOTE: Vercel Blob objects are public URLs today; we make them hard-to-guess.
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const pathname = `screenshots/${encodeURIComponent(setId)}/spot-${idx}.${ext}`;

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  await sql`
    update training_spots
    set screenshot_url = ${blob.url}
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}#spot-${idx}`);
}

// (deprecated) kept for backward compatibility while switching to per-spot pages
export async function saveSpotAnswerAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const correctPickRaw = String(formData.get('correctPickRaw') ?? '').trim();
  const [correctPickId, correctAugmentName] = correctPickRaw.split('::');
  const note = String(formData.get('correctAugmentNote') ?? '').trim();
  const screenshotUrl = String(formData.get('screenshotUrl') ?? '').trim();

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}?error=bad-spot`);
  }

  await assertSetOwnership(session.proId!, setId);

  const actionType = correctPickId?.endsWith('1') ? 'reroll_then_pick' : 'pick';

  await sql`
    update training_spots
    set correct_pick_id = ${correctPickId || null},
        correct_action_type = ${correctPickId ? actionType : null},
        correct_augment_name = ${correctAugmentName || null},
        correct_augment_note = ${note || null},
        screenshot_url = ${screenshotUrl || null}
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}#spot-${idx}`);
}
