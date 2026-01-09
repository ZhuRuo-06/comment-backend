import { kv } from "@vercel/kv";

export const config = { runtime: "edge" };

export default async function handler(req) {
  // ===== CORS =====
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 200 });
  }
  // =================

  try {
    const url = new URL(req.url);
    const path = (url.searchParams.get("path") || "/").replace(/\/$/, "");
    const key = `comments:${path}`;

    if (req.method === "GET") {
      const comments = (await kv.get(key)) || [];
      return new Response(JSON.stringify({ ok: true, comments }), {
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, message } = body;

      if (!name || !message) return new Response(JSON.stringify({ ok: false }), {
        headers,
        status: 400
      });

      const comments = (await kv.get(key)) || [];
      comments.push({ name, message, time: Date.now() });
      await kv.set(key, comments);

      return new Response(JSON.stringify({ ok: true }), {
        headers,
        status: 200
      });
    }

    return new Response("Method Not Allowed", { headers, status: 405 });
  } catch (err) {
    console.error("KV ERROR:", err);
    return new Response(JSON.stringify({ ok: false }), {
      headers,
      status: 500
    });
  }
}
