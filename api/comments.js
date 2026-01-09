let comments = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(comments);
  }

  if (req.method === 'POST') {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Nama & pesan wajib' });
    }

    comments.push({
      name,
      message,
      date: new Date().toISOString()
    });

    return res.status(200).json({ success: true, comments });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
