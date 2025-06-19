const WebSocketEvent = require("../model/webSocketEvent");
const { saveEvent } = require("./eventHandler");
const eventBus = require("./eventBus");

class WebSocketService {
    constructor() {
        this.clients = new Set();
        this.topics = {};
    }

    addClient(ws) {
        console.log("Client WebSocket connected");
        this.clients.add(ws);

        ws.on("message", (message) => this.handleMessage(ws, message));
        ws.on("close", () => this.removeClient(ws));
        ws.on("error", (error) => console.error("WebSocket error:", error));
    }

    removeClient(ws) {
        console.log("Client WebSocket disconnected");
        this.clients.delete(ws);
        Object.keys(this.topics).forEach(topic => {
            this.topics[topic].delete(ws);
            if (this.topics[topic].size === 0) delete this.topics[topic];
        });
    }

    async handleMessage(ws, message) {
        const msgString = message instanceof Buffer ? message.toString("utf8") : message;
        const event = WebSocketEvent.fromJSON(msgString);
        if (!event) return;

        console.log("Message received:", event);

        if (event.type === "subscribe") {
            this.subscribeClient(ws, event);
        } else if (event.type === "publish") {
            await this.handlePublish(event);
        }
    }

    subscribeClient(ws, event) {
        const { topic } = event;
        if (!this.topics[topic]) {
            this.topics[topic] = new Set();
        }
        this.topics[topic].add(ws);
        ws.send(JSON.stringify(new WebSocketEvent("subscribed", topic, null)));
    }

    async handlePublish(event) {
        const { topic, payload } = event;
        this.broadcastToTopic(topic, payload);

        if (topic.startsWith("user.")) {
            const operation = topic.split(".")[1].toUpperCase();
            const transformedEvent = { operation, user: payload };
            await saveEvent(transformedEvent);
            console.log(`Event ${operation} saved on CouchDB.`);
        }
    }

    broadcastToTopic(topic, payload) {
        if (this.topics[topic]) {
            const message = JSON.stringify(new WebSocketEvent("message", topic, payload));
            this.topics[topic].forEach(client => {
                if (client.readyState === 1) client.send(message);
            });
        }
    }

    broadcastToClients(type, topic, payload) {
        const message = JSON.stringify(new WebSocketEvent(type, topic, payload));
        this.clients.forEach((ws) => {
            if (ws.readyState === 1) ws.send(message);
        });

        console.log(`📤 Sent to ${this.clients.size} clients:`, message);
    }
}

module.exports = new WebSocketService();
