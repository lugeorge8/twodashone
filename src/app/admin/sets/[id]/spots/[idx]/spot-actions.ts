'use server';

import { redirect } from 'next/navigation';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { put } from '@vercel/blob';
import { generateTrainingSetSpots, type TierMode } from '@/lib/training/generate';
import { computeSlamOptions, type ComponentId } from '@/lib/items/recipes';

async function assertSetOwnership(proId: string, setId: string) {
  const owner = await sql<{ id: string; tier_mode: TierMode; mode?: string }>`
    select id, tier_mode, mode from training_sets
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
  const gen = await generateTrainingSetSpots({ tierMode: owner.tier_mode, stage: 2, stageLabel: '2-1' });
  const options = gen.spots[0].options; // use first generated spot

  await sql`
    update training_spots
    set augment_options = ${JSON.stringify(options)}::jsonb
    where set_id = ${setId} and idx = ${idx}
  `;

  const nextIdx = idx < 20 ? idx + 1 : idx;
  redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${nextIdx}`);
}

export async function saveSpotAnswerAction(formData: FormData) {
  const session = await requireProSession();

  const setId = String(formData.get('setId') ?? '').trim();
  const idx = Number(formData.get('idx') ?? '0');
  const correctPickRaw = String(formData.get('correctPickRaw') ?? '').trim();
  const note = String(formData.get('correctAugmentNote') ?? '').trim();
  const proRollOrderRaw = String(formData.get('proRollOrder') ?? '[]').trim();

  if (!setId || !Number.isFinite(idx) || idx < 1 || idx > 20) {
    redirect('/admin');
  }

  const owner = await assertSetOwnership(session.proId!, setId);

  const [correctPickId] = correctPickRaw.split('::');

  const actionType = (() => {
    if (owner.mode === 'item_2_1') {
      if (correctPickId === 'no_slam') return 'no_slam';
      return correctPickId ? 'slam' : null;
    }
    return correctPickId?.endsWith('1') ? 'reroll_then_pick' : 'pick';
  })();

  const proRollOrder = (() => {
    try {
      const parsed = JSON.parse(proRollOrderRaw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x) => String(x))
        .filter((x) => x === 'a' || x === 'b' || x === 'c');
    } catch {
      return [];
    }
  })();

  const itemComponents: ComponentId[] = (() => {
    if (owner.mode !== 'item_2_1') return [];
    const raw = String(formData.get('itemComponents') ?? '[]');
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x) => String(x))
        .filter((x): x is ComponentId =>
          x === 'bf' || x === 'bow' || x === 'rod' || x === 'tear' || x === 'chain' || x === 'cloak' || x === 'belt' || x === 'glove'
        );
    } catch {
      return [];
    }
  })();

  const itemSlamOptions = owner.mode === 'item_2_1' ? computeSlamOptions(itemComponents, 4) : [];

  try {
    if (owner.mode === 'item_2_1') {
      await sql`
        update training_spots
        set correct_pick_id = ${correctPickId === 'no_slam' ? null : correctPickId || null},
            correct_action_type = ${actionType},
            correct_augment_note = ${note || null},
            item_components = ${JSON.stringify(itemComponents)}::jsonb,
            item_slam_options = ${JSON.stringify(itemSlamOptions)}::jsonb
        where set_id = ${setId} and idx = ${idx}
      `;
    } else {
      await sql`
        update training_spots
        set correct_pick_id = ${correctPickId || null},
            correct_action_type = ${correctPickId ? actionType : null},
            correct_augment_note = ${note || null},
            pro_roll_order = ${JSON.stringify(proRollOrder)}::jsonb
        where set_id = ${setId} and idx = ${idx}
      `;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();

    // Backwards compatible: if migrations haven't been applied yet.
    if (owner.mode === 'item_2_1' && (lower.includes('item_components') || lower.includes('item_slam_options')) && lower.includes('does not exist')) {
      await sql`
        update training_spots
        set correct_pick_id = ${correctPickId === 'no_slam' ? null : correctPickId || null},
            correct_action_type = ${actionType},
            correct_augment_note = ${note || null}
        where set_id = ${setId} and idx = ${idx}
      `;
    } else if (lower.includes('pro_roll_order') && lower.includes('does not exist')) {
      await sql`
        update training_spots
        set correct_pick_id = ${correctPickId || null},
            correct_action_type = ${correctPickId ? actionType : null},
            correct_augment_note = ${note || null}
        where set_id = ${setId} and idx = ${idx}
      `;
    } else {
      throw e;
    }
  }

  redirect(`/admin/sets/${encodeURIComponent(setId)}/spots/${idx}`);
}
