import { google } from 'googleapis';
import { getGoogleOAuthClient } from './auth';

export type AugmentRow = {
  name: string;
  tier: 'silver' | 'gold' | 'prismatic';
  description: string;
  stage?: number;
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

  // Expect header row: name | tier | description | stage(optional)
  const [header, ...rows] = values;
  const idx = (colName: string) => header.findIndex((h) => String(h).trim().toLowerCase() === colName);

  const iName = idx('name');
  const iTier = idx('tier');
  const iDesc = idx('description');
  const iStage = idx('stage');

  if (iName === -1 || iTier === -1 || iDesc === -1) {
    throw new Error('Sheet header must include: name, tier, description (stage optional)');
  }

  const out: AugmentRow[] = [];
  for (const r of rows) {
    const name = String(r[iName] ?? '').trim();
    if (!name) continue;

    const tierRaw = String(r[iTier] ?? '').trim().toLowerCase();
    const tier = (tierRaw === 'silver' || tierRaw === 'gold' || tierRaw === 'prismatic') ? tierRaw : null;
    if (!tier) continue;

    const description = String(r[iDesc] ?? '').trim();
    const stageRaw = iStage === -1 ? '' : String(r[iStage] ?? '').trim();
    const stage = stageRaw ? Number(stageRaw) : undefined;

    out.push({ name, tier, description, stage: Number.isFinite(stage) ? stage : undefined });
  }

  return out;
}
