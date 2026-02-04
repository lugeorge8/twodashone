'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

async function assertSetOwnership(proId: string, setId: string) {
  const res = await sql<{ id: string }>`
    select id from training_sets
    where id = ${setId} and pro_id = ${proId}
    limit 1
  `;
  if (!res.rows[0]) {
    redirect('/admin?error=not-allowed');
  }
}

export async function publishSetAction(formData: FormData) {
  const session = await requireProSession();
  const setId = String(formData.get('setId') ?? '').trim();
  if (!setId) redirect('/admin');

  await assertSetOwnership(session.proId!, setId);

  await sql`
    update training_sets
    set status = 'published', published_at = now()
    where id = ${setId}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}`);
}

export async function unpublishSetAction(formData: FormData) {
  const session = await requireProSession();
  const setId = String(formData.get('setId') ?? '').trim();
  if (!setId) redirect('/admin');

  await assertSetOwnership(session.proId!, setId);

  await sql`
    update training_sets
    set status = 'draft', published_at = null
    where id = ${setId}
  `;

  redirect(`/admin/sets/${encodeURIComponent(setId)}`);
}
