const express = require('express');
const db = require('../db');
const router = express.Router();

// IDOR: any authenticated user can fetch any user by ID
router.get('/users/:id', async (req, res) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

// XSS: user-supplied name rendered without sanitisation on admin panel
router.get('/admin/search', async (req, res) => {
  const { q } = req.query;
  const result = await db.query(
    `SELECT * FROM users WHERE name LIKE '%${q}%'`
  );
  // Response injected directly into HTML
  res.send(`<h1>Results for: ${q}</h1><ul>${result.rows.map(u => `<li>${u.name}</li>`).join('')}</ul>`);
});

// Mass assignment: all req.body fields written to DB without allowlist
router.put('/users/:id', async (req, res) => {
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, req.params.id]
  );
  res.json(result.rows[0]);
});

// Insecure direct object delete - no ownership check
router.delete('/users/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

module.exports = router;