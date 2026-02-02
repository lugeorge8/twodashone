import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { AugmentRow } from '../google/sheets';
import { readAugmentsFromSheet } from '../google/sheets';

export type AugmentsSourceStatus = {
  ok: boolean;
  source: 'google-sheet';
  details: {
    hasSheetId: boolean;
    sheetRange: string;
    hasGoogleClientJson: boolean;
    hasGoogleTokenJson: boolean;
  };
  error?: string;
};

export async function getAugmentsFromConfiguredSource(): Promise<{
  augments: AugmentRow[];
  status: AugmentsSourceStatus;
}> {
  const spreadsheetId = process.env.AUGMENTS_SHEET_ID;
  const range = process.env.AUGMENTS_SHEET_RANGE ?? 'Augments!A1:F271';

  const clientPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-oauth-client.json');
  const tokenPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-token.json');

  const hasGoogleClientJson = fs.existsSync(clientPath);
  const hasGoogleTokenJson = fs.existsSync(tokenPath);

  const statusBase: AugmentsSourceStatus = {
    ok: false,
    source: 'google-sheet',
    details: {
      hasSheetId: Boolean(spreadsheetId),
      sheetRange: range,
      hasGoogleClientJson,
      hasGoogleTokenJson,
    },
  };

  if (!spreadsheetId) {
    return {
      augments: [],
      status: {
        ...statusBase,
        error: 'Missing AUGMENTS_SHEET_ID env var',
      },
    };
  }

  if (!hasGoogleClientJson || !hasGoogleTokenJson) {
    return {
      augments: [],
      status: {
        ...statusBase,
        error: 'Missing Google OAuth client/token files on server',
      },
    };
  }

  try {
    const augments = await readAugmentsFromSheet({ spreadsheetId, range });
    return {
      augments,
      status: {
        ...statusBase,
        ok: true,
      },
    };
  } catch (e) {
    return {
      augments: [],
      status: {
        ...statusBase,
        error: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
