'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function saveSpotAnswerAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const correctAugmentName = String(formData.get('correctAugmentName') ?? '').trim();
  const note = String(formData.get('correctAugmentNote') ?? '').trim();

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect(`/admin/sets/${encodeURIComponent(setId)}?error=bad-spot`);
  }

  // ownership check
  const owner = await sql<{ id: string }>`
    select id from training_sets
    where id = ${setId} and pro_id = ${session.proId!}
    limit 1
  `;

  if (!owner.rows[0]) {
    redirect('/admin?error=not-allowed');
  }

  await sql`
    update training_spots
    set correct_augment_name = ${correctAugmentName || null},
        correct_augment_note = ${note || null}
    where set_id = ${setId} and idx = ${idx}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}#spot-${idx}`);
}
