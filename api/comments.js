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
