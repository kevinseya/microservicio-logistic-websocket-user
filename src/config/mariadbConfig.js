const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    port: process.env.MARIADB_PORT,
    connectionLimit: 5
});

async function testConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('MariaDB connection successful');
        return true;
    } catch (err) {
        console.error('Error connecting to MariaDB:', err);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    pool,
    testConnection
};