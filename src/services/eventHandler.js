const { getDatabase } = require("../config/couchdb");

async function saveEvent(event) {
    try {
        const db = await getDatabase(); 
        if (!db || typeof db.insert !== "function") {
            throw new Error("Error: Database CouchDB not initilized");
        }

        event.timestamp = new Date().toISOString();
        event.status = "PENDING";
        await db.insert(event);
        console.log("Event saved on CouchDB.");
    } catch (error) {
        console.error("Error saving event on CouchDB:", error.message);
        throw error;
    }
}

module.exports = { saveEvent };
