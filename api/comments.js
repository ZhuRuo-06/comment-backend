import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // cukup ini, jangan await top-level

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  // ===== CORS (HARUS PALING ATAS) =====
  res.setHeader("Access-Control-Allow-Origin", "https://zhuruo.my.id");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ===================================

  try {
    const path = req.query.path || "/";

    // ===== GET =====
    if (req.method === "GET") {
      const data = await redis.get(path);
      const comments = data ? JSON.parse(data) : [];
      return res.status(200).json({ ok: true, comments });
    }

    // ===== POST =====
    if (req.method === "POST") {
      const body = req.body || {};
      const name = body.name?.trim();
      const message = body.message?.trim();

      if (!name || !message) {
        return res.status(400).json({ ok: false, error: "Name & message required" });
      }

      const data = await redis.get(path);
      const comments = data ? JSON.parse(data) : [];

      comments.push({
        name,
        message,
        time: Date.now()
      });

      await redis.set(path, JSON.stringify(comments));

      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ ok: false });
  }
}
