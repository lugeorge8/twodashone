import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { OAuth2Client } from 'google-auth-library';

export type GoogleAuthConfig = {
  clientPath?: string;
  tokenPath?: string;
};

const DEFAULT_CLIENT_PATH = path.join(os.homedir(), '.clawdbot', 'keys', 'google-oauth-client.json');
const DEFAULT_TOKEN_PATH = path.join(os.homedir(), '.clawdbot', 'keys', 'google-token.json');

function parseClientSecrets(raw: string) {
  const parsed = JSON.parse(raw);
  const installed = parsed.installed || parsed.web;
  if (!installed?.client_id || !installed?.client_secret) {
    throw new Error('Invalid OAuth client JSON: missing installed.client_id/client_secret');
  }
  const redirectUri = (installed.redirect_uris && installed.redirect_uris[0]) || 'http://localhost';
  return {
    clientId: installed.client_id as string,
    clientSecret: installed.client_secret as string,
    redirectUri: redirectUri as string,
  };
}

export async function getGoogleOAuthClient(cfg: GoogleAuthConfig = {}) {
  const clientPath = cfg.clientPath ?? DEFAULT_CLIENT_PATH;
  const tokenPath = cfg.tokenPath ?? DEFAULT_TOKEN_PATH;

  const [clientRaw, tokenRaw] = await Promise.all([
    fs.readFile(clientPath, 'utf8'),
    fs.readFile(tokenPath, 'utf8'),
  ]);

  const { clientId, clientSecret, redirectUri } = parseClientSecrets(clientRaw);
  const tokens = JSON.parse(tokenRaw);

  const client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });

  client.setCredentials(tokens);
  return client;
}
