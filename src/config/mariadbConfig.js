const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mariadb = require('mysql2/promise');

const mariadbConnection = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    port: process.env.MARIADB_PORT
});

module.exports = mariadbConnection;
