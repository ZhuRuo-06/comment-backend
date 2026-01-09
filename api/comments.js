


export const config = {
  runtime: "nodejs"
};


let store = {};

export default async function handler(req, res) {

  // ===== CORS (HARUS PALING ATAS) =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ===================================

  try {
    const path = req.query.path || "/";

    if (!store[path]) store[path] = [];

    // ===== GET =====
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        comments: store[path]
      });
    }

    // ===== POST =====
    if (req.method === "POST") {
      const body = req.body || {};

      const name = body.name;
      const message = body.message;

      if (!name || !message) {
        return res.status(400).json({ ok: false });
      }

      store[path].push({
        name,
        message,
        time: Date.now()
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ ok: false });
  }
}
