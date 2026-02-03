'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function deleteTrainingSetAction(formData: FormData) {
  const session = await requireProSession();
  const setId = String(formData.get('setId') ?? '').trim();

  if (!setId) {
    redirect('/admin');
  }

  // Ownership check + delete cascades to spots.
  await sql`
    delete from training_sets
    where id = ${setId} and pro_id = ${session.proId!}
  `;

  redirect('/admin');
}
