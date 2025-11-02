import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "reservas_db",
    password: "UMES2025",
    port: 5432
});
