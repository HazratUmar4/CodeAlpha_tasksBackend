const express = require('express');
const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

const app = express();
const db = new Database('urls.db');
db.exec('CREATE TABLE IF NOT EXISTS urls (code TEXT PRIMARY KEY, original_url TEXT)');

app.use(express.json());
app.use(express.static('public'));

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;
  try { new URL(url); } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  const code = nanoid(7);
  db.prepare('INSERT INTO urls VALUES (?, ?)').run(code, url);
  res.json({ shortUrl: `http://localhost:3000/${code}` });
});

// Redirect
app.get('/:code', (req, res) => {
  const row = db.prepare('SELECT original_url FROM urls WHERE code = ?').get(req.params.code);
  if (!row) return res.status(404).send('Not found');
  res.redirect(row.original_url);
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));
