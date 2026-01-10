// api/comments.js
import { createClient } from "redis";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// reuse client between invocations
if (!global.__redisClient) {
  global.__redisClient = null;
}

async function getRedis() {
  if (global.__redisClient) return global.__redisClient;
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("REDIS_URL not set");
    return null;
  }
  const client = createClient({ url });
  client.on("error", (e) => console.error("Redis client error:", e));
  await client.connect();
  global.__redisClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  try {
    const client = await getRedis();
    if (!client) {
      res.writeHead(500, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "REDIS_URL not set in environment" }));
      return;
    }

    // build full URL to read query params
    const fullUrl = `https://${req.headers.host}${req.url}`;
    const url = new URL(fullUrl);
    const path = (url.searchParams.get("path") || "/").replace(/\/$/, "");
    const key = `comments:${path}`;

    if (req.method === "GET") {
      const raw = await client.get(key);
      const comments = raw ? JSON.parse(raw) : [];
      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, comments }));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      await new Promise((resolve) => {
        req.on("data", (c) => (body += c));
        req.on("end", resolve);
      });
      const data = JSON.parse(body || "{}");
      const { name, message } = data;
      if (!name || !message) {
        res.writeHead(400, { ...CORS_HEADERS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "name and message required" }));
        return;
      }
      const raw = await client.get(key);
      const comments = raw ? JSON.parse(raw) : [];
      comments.push({ name, message, time: Date.now() });
      await client.set(key, JSON.stringify(comments));
      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(405, CORS_HEADERS);
    res.end("Method Not Allowed");
  } catch (err) {
    console.error("API ERROR:", err);
    res.writeHead(500, { ...CORS_HEADERS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}
