require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function getDb() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}

// Show guestbook page
app.get('/', async (req, res) => {
  const db = await getDb();
  const [rows] = await db.query('SELECT * FROM guests ORDER BY id DESC');
  await db.end();

  let html = `<h1>Guestbook</h1>
    <form method="POST" action="/">
      Name: <input name="name" required /><br/>
      Message: <input name="message" required /><br/>
      <button type="submit">Submit</button>
    </form><hr/>`;

  rows.forEach(row => {
    html += `<p><strong>${row.name}</strong>: ${row.message} <small>${row.created_at}</small></p>`;
  });

  res.send(html);
});

// Handle form submission
app.post('/', async (req, res) => {
  const { name, message } = req.body;
  const db = await getDb();
  await db.query('INSERT INTO guests (name, message) VALUES (?, ?)', [name, message]);
  await db.end();
  res.redirect('/');
});

// API route - JSON response
app.get('/guests', async (req, res) => {
  const db = await getDb();
  const [rows] = await db.query('SELECT * FROM guests ORDER BY id DESC');
  await db.end();
  res.json(rows);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
