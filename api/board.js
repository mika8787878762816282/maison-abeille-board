import { createSign } from 'crypto';

const PROJECT = 'sfria-8d107';
const DOC_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/boards/mikamomo-main`;

async function getAccessToken() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${payload}.${signature}`,
    }),
  });
  return (await r.json()).access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const token = await getAccessToken();
    const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    if (req.method === 'GET') {
      const r = await fetch(DOC_URL, { headers: h });
      if (r.status === 404) return res.json(null);
      const doc = await r.json();
      const raw = doc.fields?.board?.stringValue;
      return res.json(raw ? JSON.parse(raw) : null);
    }

    if (req.method === 'POST') {
      await fetch(DOC_URL, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({
          fields: {
            board:     { stringValue: JSON.stringify(req.body) },
            updatedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
