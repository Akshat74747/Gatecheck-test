const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const BASE_DIR = path.join(__dirname, '..', 'uploads');

// Path traversal: filename not sanitised - attacker can read any file
router.get('/files/:filename', (req, res) => {
  const filePath = path.join(BASE_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(filePath);
});

// Insecure file upload - no type or size validation
router.post('/upload', (req, res) => {
  const { filename, data } = req.body;
  const dest = path.join(BASE_DIR, filename);
  fs.writeFileSync(dest, Buffer.from(data, 'base64'));
  res.json({ path: dest });
});

// Command injection via exec with user input
const { exec } = require('child_process');
router.get('/preview', (req, res) => {
  const file = req.query.file;
  exec(`convert uploads/${file} -resize 200x200 thumb_${file}`, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.send(stdout);
  });
});

module.exports = router;