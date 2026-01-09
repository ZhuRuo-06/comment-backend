const BACKEND = 'https://YOUR-VERCEL-APP.vercel.app/api/comments';

async function loadComments() {
  const res = await fetch(BACKEND);
  const data = await res.json();
  // tampilkan komentar…
}

async function addComment(name, message) {
  await fetch(BACKEND, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name, message })
  });
  loadComments();
}
