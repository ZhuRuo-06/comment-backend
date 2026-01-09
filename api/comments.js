import fs from "fs";
import path from "path";

export const config = {
  runtime: "nodejs"
};

// File JSON untuk nyimpen comment
const DATA_FILE = path.join(process.cwd(), "comments.json");

// Fungsi bantu: baca JSON
function readComments() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {}; // kalau file belum ada atau corrupt
  }
}

// Fungsi bantu: tulis JSON
function writeComments(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

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
    const pathQuery = req.query.path || "/";
    const store = readComments();

    if (!store[pathQuery]) store[pathQuery] = [];

    // ===== GET =====
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        comments: store[pathQuery]
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

      store[pathQuery].push({
        name,
        message,
        time: Date.now()
      });

      writeComments(store);

      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ ok: false });
  }
}
