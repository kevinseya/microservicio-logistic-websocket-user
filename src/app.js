require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { testConnection: testCouchDB, setupDatabase } = require("./config/couchdb");
const { setupWebSocket } = require("./config/websocket");
const { testConnection: testMariaDB } = require("./config/mariadbConfig");
const { testConnection: testMySQL } = require("./config/mysqlConfig");
const eventBus = require('./services/eventBus');
const { processPendingEvents } = require("./services/syncQueue");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

setupWebSocket(server);

eventBus.on('eventSaved', async () => {
    await processPendingEvents();
});

async function startServer() {
    try {
        console.log("Initializing WebSocket Service User...");
        
        await setupDatabase();

        const mariadbConnected = await testMariaDB();
        const mysqlConnected = await testMySQL();
        const couchdbConnected = await testCouchDB();

        if (!mariadbConnected || !mysqlConnected || !couchdbConnected) {
            throw new Error('Failed to connect to one or more databases');
        }

        await processPendingEvents();
        console.log("Pending events processed.");

        setInterval(async () => {
            await processPendingEvents();
        }, 10000);

        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => console.log(`WebSocket Service User running on port ${PORT}`));
    } catch (error) {
        console.error("Error starting WebSocket Service User:", error);
        process.exit(1);
    }
}

startServer();