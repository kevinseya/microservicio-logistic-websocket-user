const { pool: mariaPool } = require("../config/mariadbConfig");
const { pool: mysqlPool } = require("../config/mysqlConfig");

function uuidToBuffer(uuid) {
    try {
        const hex = uuid.replace(/-/g, "");
        return Buffer.from(hex, "hex");
    } catch (error) {
        console.error('Error converting UUID to buffer:', error);
        throw error;
    }
}

const dbOperations = {
    async createUserInMariaDB(user) {
        let conn;
        try {
            console.log('Starting user creation in MariaDB for:', user.email);
            
            if (!user.id || !user.email || !user.name) {
                throw new Error('Missing required user data');
            }

            conn = await mariaPool.getConnection();
            
            const userDataLog = { ...user };
            delete userDataLog.password;
            console.log('User data to insert:', userDataLog);

            const query = `
                INSERT INTO user (id, email, lastname, name, password, phone, role, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                uuidToBuffer(user.id),
                user.email,
                user.lastname,
                user.name,
                user.password,
                user.phone ,
                user.role ,
                user.active === undefined ? true : user.active
            ];

            const result = await conn.query(query, values);
            console.log('User created successfully in MariaDB. Result:', result);
            
            if (result.affectedRows !== 1) {
                throw new Error('User creation did not affect any rows');
            }
            
            return true;
        } catch (error) {
            console.error('Error creating user in MariaDB:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                email: user.email
            });
            throw error;
        } finally {
            if (conn) await conn.release();
        }
    },

    async updateUserInMariaDB(user) {
        let conn;
        try {
            conn = await mariaPool.getConnection();
            
            let query = 'UPDATE user SET email = ?, lastname = ?, name = ?';
            const values = [user.email, user.lastname || '', user.name];

            if (user.password?.trim()) {
                query += ', password = ?';
                values.push(user.password);
            }

            query += ', phone = ?, role = ? WHERE id = ?';
            values.push(user.phone || '', user.role, uuidToBuffer(user.id));

            const result = await conn.query(query, values);
            console.log('User updated in MariaDB');
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user in MariaDB:', error);
            throw error;
        } finally {
            if (conn) await conn.release();
        }
    },

    async deleteUserFromMySQL(userId) {
        try {
            const [result] = await mysqlPool.execute(
                'UPDATE user SET active = false WHERE id = ?',
                [uuidToBuffer(userId)]
            );
            console.log('User deleted in MySQL');
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting user in MySQL:', error);
            throw error;
        }
    }
};

module.exports = dbOperations;
