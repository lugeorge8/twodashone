import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-oauth-client.json');
  const tokenPath = path.join(os.homedir(), '.clawdbot', 'keys', 'google-token.json');

  const hasClient = fs.existsSync(clientPath);
  const hasToken = fs.existsSync(tokenPath);

  const sheetId = process.env.AUGMENTS_SHEET_ID;
  const range = process.env.AUGMENTS_SHEET_RANGE ?? 'Augments!A1:F271';

  return NextResponse.json({
    ok: true,
    augments: {
      hasSheetId: Boolean(sheetId),
      sheetRange: range,
    },
    google: {
      hasClientJson: hasClient,
      hasTokenJson: hasToken,
    },
  });
}
