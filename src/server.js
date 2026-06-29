const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { login, verifyToken } = require('./auth');
const usersRouter = require('./api/users');
const filesRouter = require('./api/files');

const app = express();

// Wildcard CORS - allows any origin to make credentialed requests
app.use(cors({ origin: '*', credentials: true }));

app.use(express.json({ limit: '100mb' }));  // No size limit protection
app.use(cookieParser());

// No rate limiting on login endpoint - brute force possible
app.post('/api/login', login);

// Routes - no CSRF protection
app.use('/api', verifyToken, usersRouter);
app.use('/api', verifyToken, filesRouter);

// Debug endpoint left in production
app.get('/debug/env', (req, res) => {
  res.json(process.env);
});

// Stack traces exposed to client
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));