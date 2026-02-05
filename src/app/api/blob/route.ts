import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<NextResponse> {
  // Auth: any logged-in pro can upload.
  await requireProSession();

  const body = await req.json();

  const json = await handleUpload({
    request: req,
    body,
    onBeforeGenerateToken: async (pathname, clientPayload, _multipart) => {
      let payload: any = null;
      try {
        payload = clientPayload ? JSON.parse(String(clientPayload)) : null;
      } catch {
        payload = null;
      }

      const patch = String(payload?.patch ?? '').trim();
      const stage = String(payload?.stage ?? '1-4').trim() || '1-4';
      const mode = String(payload?.mode ?? 'augment_2_1').trim() || 'augment_2_1';

      if (!patch) {
        throw new Error('Missing patch');
      }

      // Only allow our screenshot library path.
      const safePrefix = `screenshots-library/${encodeURIComponent(patch)}/`;
      const safePath = String(pathname || '').startsWith(safePrefix)
        ? String(pathname)
        : `${safePrefix}${Date.now()}-${Math.random().toString(16).slice(2)}-${String(pathname || 'upload')}`;

      return {
        pathname: safePath,
        maximumSizeInBytes: 10 * 1024 * 1024,
        allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp'],
        tokenPayload: JSON.stringify({ patch, stage, mode }),
        addRandomSuffix: true,
        allowOverwrite: true,
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      let payload: any = null;
      try {
        payload = tokenPayload ? JSON.parse(String(tokenPayload)) : null;
      } catch {
        payload = null;
      }

      const patch = String(payload?.patch ?? '').trim();
      const stage = String(payload?.stage ?? '1-4').trim() || '1-4';
      const mode = String(payload?.mode ?? 'augment_2_1').trim() || 'augment_2_1';

      if (!patch) return;

      await sql`
        insert into screenshots (patch, stage, mode, image_url)
        values (${patch}, ${stage}, ${mode}, ${blob.url})
      `;
    },
  });

  return NextResponse.json(json);
}
