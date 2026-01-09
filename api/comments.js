import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const redis = await createClient().connect();

export const POST = async () => {
  // Fetch data from Redis
  const result = await redis.get("item");
  
  // Return the result in the response
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};
export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const path = (req.query.path || "/").replace(/\/$/, "");
  const key = `comments:${path}`;

  try {
    if (req.method === "GET") {
      const raw = await redis.lrange(key, 0, -1); // ambil semua komentar
      const comments = raw.map(JSON.parse);
      return res.json(comments);
    }

    if (req.method === "POST") {
      const { name, message } = req.body || {};
      if (!name || !message) return res.status(400).json({ ok: false });

      const comment = { name, message, time: Date.now() };
      await redis.rpush(key, JSON.stringify(comment)); // simpan komentar
      return res.json({ ok: true });
    }

    res.status(405).end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}
