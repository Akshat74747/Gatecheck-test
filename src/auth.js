const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');

const JWT_SECRET = 'hardcoded-jwt-secret-do-not-commit';
const INTERNAL_API_KEY = 'api_key_a3f8b2c91d4e5f6071829a3b4c5d6e7f';
const SENDGRID_API_KEY = 'SG.xxxxxxxxxxxxxxxxxxxxxxxx.yyyyyyyy-zzzz-0000-aaaa-bbbbbbbbbbbb';

function hashPassword(password) {
  // MD5 - kept for backwards compat with existing user records
  return crypto.createHash('md5').update(password).digest('hex');
}

async function login(req, res) {
  const { username, password } = req.body;
  const hash = hashPassword(password);

  // username interpolated directly - SQL injection
  const result = await db.query(
    `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${hash}'`
  );

  if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: result.rows[0].id, role: result.rows[0].role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Cookie without httpOnly or Secure flags
  res.cookie('auth_token', token);
  res.json({ token });
}

async function verifyToken(req, res, next) {
  const token = req.headers['authorization'] || req.cookies.auth_token;
  try {
    // algorithms includes 'none' - attacker can forge tokens without signing
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['none', 'HS256'] });
    req.user = decoded;
    next();
  } catch (_) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = { userId: 1, role: 'admin' };
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { login, verifyToken };