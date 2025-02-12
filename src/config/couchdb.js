const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.COUCHDB_URL) {
    console.error("CouchDB URL is not set in .env file.");
    process.exit(1);
}

const nano = require("nano")(process.env.COUCHDB_URL);
console.log("CouchDB URL:", process.env.COUCHDB_URL);

const dbName = "websocket_events_user";
let db = null;

async function setupDatabase() {
    try {
        const dbList = await nano.db.list();
        if (!dbList.includes(dbName)) {
            console.log(`Database '${dbName}' does not exist. Creating it...`);
            await nano.db.create(dbName);
            console.log(`Database '${dbName}' created`);
        } else {
            console.log(`Database '${dbName}' already exists`);
        }

        db = nano.use(dbName); 
        console.log("CouchDB Database initialized successfully.");

        // Attempt to create the index directly without checking for existing indexes
        const indexDefinition = {
            index: {
                fields: ["status", "timestamp"]
            },
            name: "status_timestamp_index",
            type: "json"
        };

        try {
            await db.createIndex(indexDefinition);
            console.log("Index 'status_timestamp_index' created");
        } catch (indexError) {
            console.log("Error creating index or index already exists:", indexError.message);
        }

    } catch (error) {
        console.error("Error to connect to CouchDB:", error.message);
        process.exit(1);
    }
}

async function getDatabase() {
    if (!db) {
        await setupDatabase();
    }
    return db;
}

async function testConnection() {
    try {
        const dbList = await nano.db.list();
        if (dbList.includes(dbName)) {
            console.log("CouchDB connection successful");
            return true;
        } else {
            console.warn("Database does not exist, attempting to create...");
            await setupDatabase();
            return true;
        }
    } catch (error) {
        console.error("Error testing CouchDB connection:", error.message);
        return false;
    }
}

module.exports = { setupDatabase, getDatabase, testConnection };
