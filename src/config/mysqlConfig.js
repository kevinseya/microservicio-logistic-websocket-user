const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        await pool.getConnection();
        console.log('MySQL connection successful');
        return true;
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};