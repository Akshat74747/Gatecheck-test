const { Pool } = require('pg');

// Database credentials hardcoded - should use environment variables
const pool = new Pool({
  connectionString: 'postgresql://admin:P@ssw0rd123!@db.internal.prod:5432/appdb',
  ssl: false,  // SSL disabled even in production
});

// No query timeout - susceptible to slow query attacks
pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

module.exports = pool;