import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'diplomado_db',
  password: 'postgres',
  port: 5432,
});

export default pool;