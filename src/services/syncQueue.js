const { getDatabase } = require("../config/couchdb");
const dbOperations = require('../repository/dbOperations');
const eventBus = require('./eventBus');

async function processPendingEvents() {
    try {
        console.log("Processing pending events...");
        
        const db = await getDatabase(); 

        if (!db) {
            console.error("The database is not initialized.");
            return;
        }

        const response = await db.find({  
            selector: { status: "PENDING" },
            sort: [{ timestamp: "asc" }]
        });

        if (response.docs.length === 0) {
            console.log("No pending events to process.");
            return;
        }

        for (const event of response.docs) {
            console.log(`Processing event: ${event.operation} for ${event.user?.email || event.userId}`);

            try {
                eventBus.emit('processingEvent', event);
                switch (event.operation) {
                    case "CREATED":
                        await dbOperations.createUserInMariaDB(event.user);
                        console.log(`User ${event.user.email} saved in MariaDB.`); 
                        break;
                    case "UPDATE":
                        await dbOperations.updateUserInMariaDB(event.user);
                        break;
                    case "DELETE":
                        await dbOperations.deleteUserFromMySQL(event.userId);
                        break;
                }
                
                event.status = "PROCESSED";
                await db.insert(event);
                console.log(`Event ${event.operation} processed and marked as PROCESSED.`);
                eventBus.emit('eventProcessed', event);
            } catch (err) {
                console.error(`Error processing event ${event.operation}:`, err);
                eventBus.emit('eventError', { event, error: err });
            }
        }
    } catch (error) {
        console.error("Error processing events:", error);
    }
}

module.exports = { processPendingEvents };
