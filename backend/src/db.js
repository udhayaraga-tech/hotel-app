require('dotenv').config();
const { Pool } = require('pg');

// Plain node-postgres pool: all queries are native, parameterised SQL (no ORM).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
