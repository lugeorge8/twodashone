import { google } from 'googleapis';
import { getGoogleOAuthClient } from './auth';

export type AugmentRow = {
  name: string;
  tier: 'silver' | 'gold' | 'prismatic';
  description: string;
  stages: {
    2?: boolean;
    3?: boolean;
    4?: boolean;
  };
};

export async function readAugmentsFromSheet(params: {
  spreadsheetId: string;
  range: string; // e.g. "Augments!A:D"
}): Promise<AugmentRow[]> {
  const auth = await getGoogleOAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: params.spreadsheetId,
    range: params.range,
  });

  const values = resp.data.values ?? [];
  if (values.length === 0) return [];

  // Expect header row: Name | description | tier | stage2 | stage3 | stage4
  // We match headers case-insensitively.
  const [header, ...rows] = values;
  const idx = (colName: string) => header.findIndex((h) => String(h).trim().toLowerCase() === colName);

  const iName = idx('name');
  const iTier = idx('tier');
  const iDesc = idx('description');
  const iStage2 = idx('stage2');
  const iStage3 = idx('stage3');
  const iStage4 = idx('stage4');

  if (iName === -1 || iTier === -1 || iDesc === -1) {
    throw new Error('Sheet header must include: name, tier, description, stage2, stage3, stage4');
  }

  const out: AugmentRow[] = [];
  for (const r of rows) {
    const name = String(r[iName] ?? '').trim();
    if (!name) continue;

    const tierRaw = String(r[iTier] ?? '').trim().toLowerCase();
    const tier = (tierRaw === 'silver' || tierRaw === 'gold' || tierRaw === 'prismatic') ? tierRaw : null;
    if (!tier) continue;

    const description = String(r[iDesc] ?? '').trim();

    // Stage columns in your sheet are maintained manually.
    // Treat any non-empty value as "available" unless it is an explicit falsey marker.
    const isTruthy = (v: unknown) => {
      const s = String(v ?? '').trim().toLowerCase();
      if (!s) return false;
      return !(s === '0' || s === 'false' || s === 'no' || s === 'n');
    };

    const stages = {
      2: iStage2 === -1 ? undefined : isTruthy(r[iStage2]),
      3: iStage3 === -1 ? undefined : isTruthy(r[iStage3]),
      4: iStage4 === -1 ? undefined : isTruthy(r[iStage4]),
    };

    out.push({ name, tier, description, stages });
  }

  return out;
}
