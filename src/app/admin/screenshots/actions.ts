'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';

export async function uploadScreenshotsAction(formData: FormData) {
  // For now: any logged-in pro can add screenshots. If you want super-admin later, we can gate.
  await requireProSession();

  const patch = String(formData.get('patch') ?? '').trim();
  const stage = String(formData.get('stage') ?? '1-4').trim() || '1-4';
  const mode = String(formData.get('mode') ?? 'augment_2_1').trim();
  const files = formData.getAll('files');

  if (!patch) {
    redirect('/admin/screenshots?error=patch');
  }

  const picked = files.filter((f) => f instanceof File) as File[];
  if (picked.length === 0) {
    redirect('/admin/screenshots?error=file');
  }

  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const maxBytes = 10 * 1024 * 1024;

  for (const file of picked) {
    if (file.size === 0) continue;
    if (file.size > maxBytes) {
      redirect('/admin/screenshots?error=file-too-large');
    }
    if (!allowed.has(file.type)) {
      redirect('/admin/screenshots?error=bad-file-type');
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const pathname = `screenshots-library/${encodeURIComponent(patch)}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true });

    await sql`
      insert into screenshots (patch, stage, mode, image_url)
      values (${patch}, ${stage}, ${mode}, ${blob.url})
    `;
  }

  redirect('/admin/screenshots?ok=1');
}
