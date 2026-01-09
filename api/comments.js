export default async function handler(req, res) {

  // ===== CORS FIX =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request (WAJIB)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ====================

  const path = req.query.path || "/";

  if (req.method === "GET") {
    // contoh dummy dulu
    return res.status(200).json([
      { name: "Tester", message: "Komentar berhasil dimuat." }
    ]);
  }

  if (req.method === "POST") {
    const { name, message } = req.body;

    return res.status(200).json({
      success: true,
      name,
      message,
      path
    });
  }

  res.status(405).end();
}


let store = {}; // sementara (ingat: ini RAM)

export default async function handler(req, res) {
  const path = req.query.path || "/";

  store[path] = store[path] || [];

  if (req.method === "POST") {
    store[path].push({
      name: req.body.name,
      message: req.body.message
    });

    return res.json({ ok: true });
  }

  if (req.method === "GET") {
    return res.json({
      ok: true,
      comments: store[path]
    });
  }
}
