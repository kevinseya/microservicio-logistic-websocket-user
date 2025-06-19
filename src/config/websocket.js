const { Server } = require("ws");
const WebSocketService = require("../services/webSocketService");
const eventBus = require("../services/eventBus");

function setupWebSocket(server) {
    const wss = new Server({ server, path: "/ws" });

    wss.on("connection", (ws) => WebSocketService.addClient(ws));

    eventBus.on("processingEvent", (event) => {
        WebSocketService.broadcastToClients("PROCESSING", `user.${event.operation.toLowerCase()}`, event);
    });

    eventBus.on("eventProcessed", (event) => {
        WebSocketService.broadcastToClients("COMPLETED", `user.${event.operation.toLowerCase()}`, event);
    });

    eventBus.on("eventError", (data) => {
        WebSocketService.broadcastToClients("ERROR", "user.error", data);
    });
}

module.exports = { setupWebSocket };
