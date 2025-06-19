class WebSocketEvent {
    constructor(type, topic, payload) {
        if (!type || typeof type !== "string") {
            throw new Error("Invalid WebSocket event: 'type' is required and must be a string.");
        }
        if (!topic || typeof topic !== "string") {
            throw new Error("Invalid WebSocket event: 'topic' is required and must be a string.");
        }
        if (!payload || typeof payload !== "object") {
            throw new Error("Invalid WebSocket event: 'payload' is required and must be an object.");
        }

        this.type = type.trim();       
        this.topic = topic.trim();     
        this.payload = payload; 
    }

    toJSON() {
        return {
            type: this.type,
            topic: this.topic,
            payload: this.payload
        };
    }

    static fromJSON(data) {
        try {
            const parsed = typeof data === "string" ? JSON.parse(data) : data;

            if (!parsed || typeof parsed !== "object") {
                throw new Error("Invalid WebSocket event: Event must be an object.");
            }

            return new WebSocketEvent(parsed.type, parsed.topic, parsed.payload);
        } catch (error) {
            console.error(" Error parsing WebSocket event:", error.message);
            return null;
        }
    }
}

module.exports = WebSocketEvent;
