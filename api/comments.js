import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  const pathKey = (new URL(`https://${req.headers.host}${req.url}`)).searchParams.get("path")?.replace(/\/$/, "") || "/";
  const key = `comments:${pathKey}`;

  if (req.method === "GET") {
    const raw = await redis.get(key);
    const comments = raw ? JSON.parse(raw) : [];
    res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, comments }));
    return;
  }

  if (req.method === "POST") {
    let body = "";
    await new Promise(r => req.on("data", c => body += c).on("end", r));
    const { name, message } = JSON.parse(body || "{}");
    if (!name || !message) return res.writeHead(400, CORS_HEADERS).end(JSON.stringify({ ok: false }));

    const raw = await redis.get(key);
    const comments = raw ? JSON.parse(raw) : [];
    comments.push({ name, message, time: Date.now() });
    await redis.set(key, JSON.stringify(comments));

    res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(405, CORS_HEADERS);
  res.end("Method Not Allowed");
}
