const { getDatabase } = require("../config/couchdb");
const { sendWebSocketMessage } = require("../services/eventSender");
const mariadbConnection = require("../config/mariadbConfig");
const mysqlConnection = require("../config/mysqlConfig");

// Function to convert UUID to 16 bytes
function uuidToBuffer(uuid) {
  const hex = uuid.replace(/-/g, "");
  return Buffer.from(hex, "hex");
}

// Create USER on MariaDB
async function createUserInMariaDB(user) {
    try {
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
            user.phone,
            user.role,
            user.active
        ];
        await mariadbConnection.query(query, values);
        console.log("User created on MariaDB.");
    } catch (error) {
        console.error("Error creating user on MariaDB:", error.message);
        throw error;
    }
}

// Update USER on MariaDB
async function updateUserInMariaDB(user) {
    try {
        // Fields that are usually updated
        let query = 'UPDATE user SET email = ?, lastname = ?, name = ?';
        const values = [user.email, user.lastname, user.name];

        // If allowed password not empty, save on the update
        if (user.password && user.password.trim() !== '') {
            query += ', password = ?';
            values.push(user.password);
        }

        //Continue to the rest of the fields
        query += ', phone = ?, role = ? WHERE id = ?';
        values.push(user.phone, user.role, uuidToBuffer(user.id)); // Conversión de UUID a Buffer

        await mariadbConnection.query(query, values);
        console.log("User update on MariaDB.");
    } catch (error) {
        console.error("Error updating user on MariaDB:", error.message);
        throw error;
    }
}



//Delete USER on MySQL
async function deleteUserFromMySQL(user) {
    try {
        const query = `UPDATE user SET active = false WHERE id = ?`;
        await mysqlConnection.query(query, [uuidToBuffer(user)]);
        console.log("User delete on MySQL.");
    } catch (error) {
        console.error("Error deleting user on MySQL:", error.message);
        throw error;
    }
}

async function processPendingEvents() {
    try {
        console.log("Proccesing pending events...");
        const db = await getDatabase();

        if (!db) {
            console.error("The database not initialized.");
            return;
        }

        const response = await db.find({
            selector: { status: "PENDING" },
            sort: [{ timestamp: "asc" }]
        });

        if (response.docs.length === 0) {
            console.log("There are no pending events to process.");
            return;
        }

        for (const event of response.docs) {
            console.log(`📌 Proccesing event: ${event.operation} to ${event.user?.email || event.userId}`);
            
            try {
                // Sent event by WebSocket all services 
                sendWebSocketMessage(event.operation, event);

                // Synchronize between bases according to the type of operation: 
                if (event.operation === "CREATE") {
                    await createUserInMariaDB(event.user);
                } else if (event.operation === "UPDATE") {
                    await updateUserInMariaDB(event.user);
                } else if (event.operation === "DELETE") {
                    await deleteUserFromMySQL(event.user);
                }
                
                event.status = "PROCESSED";
                await db.insert(event);
                console.log(`Event ${event.operation} proccesed and mark with PROCESSED.`);
            } catch (err) {
                console.error(`Error processing event ${event.operation}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error("Error processing events:", error.message);
    }
}

module.exports = { processPendingEvents };
