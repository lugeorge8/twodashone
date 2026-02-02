import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { AugmentRow } from '../google/sheets';
import { readAugmentsFromLocalFile } from './local';
import { readAugmentsFromSheet } from '../google/sheets';

export type AugmentsSourceStatus = {
  ok: boolean;
  source: 'local-file' | 'google-sheet';
  details: {
    localFilePath: string;
    localFileExists: boolean;

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
  const localFilePath = path.join(process.cwd(), 'src', 'data', 'augments.json');
  const localFileExists = fs.existsSync(localFilePath);

  const spreadsheetId = process.env.AUGMENTS_SHEET_ID;
  const range = process.env.AUGMENTS_SHEET_RANGE ?? 'Augments!A1:F271';

  const clientPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-oauth-client.json');
  const tokenPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-token.json');

  const hasGoogleClientJson = fs.existsSync(clientPath);
  const hasGoogleTokenJson = fs.existsSync(tokenPath);

  const statusBase: AugmentsSourceStatus = {
    ok: false,
    source: localFileExists ? 'local-file' : 'google-sheet',
    details: {
      localFilePath,
      localFileExists,

      hasSheetId: Boolean(spreadsheetId),
      sheetRange: range,
      hasGoogleClientJson,
      hasGoogleTokenJson,
    },
  };

  // Prefer local file (works on Vercel, no Google auth required).
  if (localFileExists) {
    try {
      const augments = await readAugmentsFromLocalFile({ filePath: localFilePath });
      return {
        augments,
        status: {
          ...statusBase,
          ok: true,
          source: 'local-file',
        },
      };
    } catch (e) {
      return {
        augments: [],
        status: {
          ...statusBase,
          source: 'local-file',
          error: e instanceof Error ? e.message : String(e),
        },
      };
    }
  }

  // Fallback to Google Sheets (requires server-side OAuth files)
  if (!spreadsheetId) {
    return {
      augments: [],
      status: {
        ...statusBase,
        source: 'google-sheet',
        error: 'Missing AUGMENTS_SHEET_ID env var',
      },
    };
  }

  if (!hasGoogleClientJson || !hasGoogleTokenJson) {
    return {
      augments: [],
      status: {
        ...statusBase,
        source: 'google-sheet',
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
        source: 'google-sheet',
      },
    };
  } catch (e) {
    return {
      augments: [],
      status: {
        ...statusBase,
        source: 'google-sheet',
        error: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
