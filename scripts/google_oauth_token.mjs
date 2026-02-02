import http from 'node:http';
import {URL} from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';

// Paths
const CLIENT_PATH = path.join(os.homedir(), '.clawdbot', 'keys', 'google-oauth-client.json');
const TOKEN_PATH = path.join(os.homedir(), '.clawdbot', 'keys', 'google-token.json');

// Scopes: minimal for our use
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
];

function loadClientSecrets(rawJson) {
  const parsed = JSON.parse(rawJson);
  const installed = parsed.installed || parsed.web;
  if (!installed?.client_id || !installed?.client_secret) {
    throw new Error('Invalid OAuth client JSON: missing installed.client_id/client_secret');
  }
  // For Desktop apps, redirect_uris often contains "http://localhost".
  const redirectUri = (installed.redirect_uris && installed.redirect_uris[0]) || 'http://localhost';
  return { clientId: installed.client_id, clientSecret: installed.client_secret, redirectUri };
}

async function main() {
  const raw = await fs.readFile(CLIENT_PATH, 'utf8');
  const { clientId, clientSecret, redirectUri } = loadClientSecrets(raw);

  // Pick an ephemeral port on localhost.
  const server = http.createServer();

  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const effectiveRedirect = new URL(redirectUri);
  // If redirectUri is "http://localhost" (no port), we can add our chosen port.
  effectiveRedirect.hostname = '127.0.0.1';
  effectiveRedirect.port = String(port);
  effectiveRedirect.pathname = '/oauth2callback';

  const oAuth2Client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: effectiveRedirect.toString(),
  });

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log('\nOpen this URL in your browser to authorize Google access:\n');
  console.log(authUrl);
  console.log('\nIf you are SSHed into the server, use port forwarding in another terminal:');
  console.log(`  ssh -L ${port}:127.0.0.1:${port} ubuntu@<EC2_PUBLIC_IP>`);
  console.log(`Then open: http://127.0.0.1:${port}/oauth2callback (the redirect will hit the server)`);

  server.on('request', async (req, res) => {
    try {
      const reqUrl = new URL(req.url, `http://127.0.0.1:${port}`);
      if (reqUrl.pathname !== '/oauth2callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`Authorization error: ${error}`);
        return;
      }
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing code');
        return;
      }

      const { tokens } = await oAuth2Client.getToken({
        code,
        codeVerifier,
      });

      if (!tokens.refresh_token) {
        // If user already authorized previously, Google may not return refresh_token unless prompt=consent.
        // We already set prompt=consent; still, guard here.
        console.error('No refresh_token returned. You may need to revoke app access and retry.');
      }

      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Google OAuth complete. You can close this tab and return to the terminal.');

      console.log(`\nSaved token to: ${TOKEN_PATH}`);
      server.close();
    } catch (e) {
      console.error(e);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal error; check terminal logs.');
      server.close();
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
