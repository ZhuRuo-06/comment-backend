let store = {}; // RAM sementara (uji coba)

export default async function handler(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ===============

  const path = req.query.path || "/";

  // init storage per halaman
  if (!store[path]) {
    store[path] = [];
  }

  // ===== GET =====
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      comments: store[path]
    });
  }

  // ===== POST =====
  if (req.method === "POST") {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ ok: false });
    }

    store[path].push({
      name,
      mess
