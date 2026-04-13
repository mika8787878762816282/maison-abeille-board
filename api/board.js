const BOARD_ID = 'mikamomo-main';
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const r = await fetch(
      `${URL}/rest/v1/boards?id=eq.${BOARD_ID}&select=data`,
      { headers }
    );
    const rows = await r.json();
    return res.json(rows[0]?.data ?? null);
  }

  if (req.method === 'POST') {
    const data = req.body;
    await fetch(`${URL}/rest/v1/boards`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: BOARD_ID, data, updated_at: new Date().toISOString() }),
    });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
