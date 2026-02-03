'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';

export async function uploadScreenshotAction(formData: FormData) {
  // For now: any logged-in pro can add screenshots. If you want super-admin later, we can gate.
  await requireProSession();

  const patch = String(formData.get('patch') ?? '').trim();
  const stage = String(formData.get('stage') ?? '1-4').trim() || '1-4';
  const file = formData.get('file');

  if (!patch) {
    redirect('/admin/screenshots?error=patch');
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect('/admin/screenshots?error=file');
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    redirect('/admin/screenshots?error=file-too-large');
  }

  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  if (!allowed.has(file.type)) {
    redirect('/admin/screenshots?error=bad-file-type');
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const pathname = `screenshots-library/${encodeURIComponent(patch)}/${Date.now()}.${ext}`;

  const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true });

  await sql`
    insert into screenshots (patch, stage, image_url)
    values (${patch}, ${stage}, ${blob.url})
  `;

  redirect('/admin/screenshots?ok=1');
}
