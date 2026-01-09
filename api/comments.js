import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const path = (new URL(req.url)).searchParams.get('path') || '/';

  if (req.method === 'GET') {
    const comments = (await kv.get(`comments:${path}`)) || [];
    return new Response(JSON.stringify({ ok: true, comments }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    const { name, message } = await req.json();

    if (!name || !message) return new Response(JSON.stringify({ ok: false }), { status: 400 });

    const comments = (await kv.get(`comments:${path}`)) || [];
    comments.push({ name, message, time: Date.now() });
    await kv.set(`comments:${path}`, comments);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
