const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✔ Table "hotels" is ready');
  } catch (err) {
    console.error('✖ Could not create table:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
