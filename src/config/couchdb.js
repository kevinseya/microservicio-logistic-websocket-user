// src/config/couchdb.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const nano = require("nano")(process.env.COUCHDB_URL);
const dbName = "websocket_events_user";
let db;

async function setupDatabase() {
    try {
        const dbList = await nano.db.list();
        if (!dbList.includes(dbName)) {
            await nano.db.create(dbName);
            console.log(`✅ Base de datos '${dbName}' creada con éxito.`);
        } else {
            console.log(`🔄 Base de datos '${dbName}' ya existe.`);
        }
        db = nano.use(dbName);

        // Crear índice para poder usar el sort en el campo "timestamp"
        // Si filtras también por "status", es conveniente incluirlo en el índice.
        const indexDefinition = {
            index: {
                fields: ["status", "timestamp"]
            },
            name: "status_timestamp_index",
            type: "json"
        };

        await db.createIndex(indexDefinition);
        console.log("✅ Índice 'status_timestamp_index' creado o verificado.");

    } catch (error) {
        console.error("❌ Error conectando a CouchDB:", error.message);
        process.exit(1);
    }
}

async function getDatabase() {
    if (!db) {
        throw new Error("⚠️ La base de datos aún no está inicializada.");
    }
    return db;
}

module.exports = { setupDatabase, getDatabase };
