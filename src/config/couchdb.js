const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const nano = require("nano")(process.env.COUCHDB_URL);
const dbName = process.env.COUCHDB_DATABASE;
let db = null;

async function setupDatabase() {
    try {
        const dbList = await nano.db.list();
        if (!dbList.includes(dbName)) {
            await nano.db.create(dbName);
            console.log(`Database '${dbName}' created`);
        } else {
            console.log(`Database '${dbName}' already exist`);
        }

        db = nano.use(dbName); 
        console.log("CouchDB Database initialized successfully.");
        
        const indexDefinition = {
            index: {
                fields: ["status", "timestamp"]
            },
            name: "status_timestamp_index",
            type: "json"
        };

        await db.createIndex(indexDefinition);
        console.log("Index 'status_timestamp_index' created");
    } catch (error) {
        console.error("Error to connect CouchDB:", error.message);
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
