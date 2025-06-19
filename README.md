# microservicio-logistic-websocket-user

# WebSocket Microservice for User Management

This project is a **WebSockets**-based microservice that allows real-time event management for users within the logistics system. It uses **Node.js**, **Express**, **WebSockets**, and databases such as **CouchDB, MariaDB, and MySQL** to store and process data.

## 📂 Project Structure

- **`server.js`**: Application entry point. Initializes the Express server and WebSocket.
- **`config/`**: Database and WebSocket configuration.
- **`services/`**: Contains the event and WebSocket logic.
- **`repository/`**: Contains the interaction with CouchDB, MariaDB, and MySQL.
- **`models/`**: Defines the WebSocket event model.
- **`eventBus.js`**: Implements an EventEmitter to handle internal events.

## 📌 WebSocket Endpoints

The microservice exposes a WebSocket connection at the `/ws` route.

### **1️ Subscribing to events**
To receive real-time user events, the client must subscribe by sending a message in JSON format:

```json
{
"type": "subscribe",
"topic": "user.created"
}
```

### **2️ Publishing events**
To send a user creation event, the client sends:

```json
{
"type": "publish",
"topic": "user.created",
"payload": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"email": "user@example.com",
"name": "Test User"
}
}
```

## 🛠 Requirements

- **Node.js** v16 or higher.
- **Docker** (optional for deployment).
- **CouchDB**, **MariaDB** and **MySQL** installed.

## 🚀 Installation and Execution

### 1️ **Clone the repository**
```sh
git clone https://github.com/kevinseya/microservicio-logistic-websocket-user.git
cd microservicio-logistic-websocket-user
```

### 2️ **Install dependencies**
```sh
npm install
```

### 3️ **Configure environment variables**
Create a `.env` file in the root with the values suitable:
```sh
PORT=5001
COUCHDB_URL=http://localhost:5984
MARIADB_HOST=localhost
MARIADB_USER=root
MARIADB_PASSWORD=root
MARIADB_DATABASE=logistic
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=logistic
```

### 4️ **Run the application**
```sh
npm start
```

The application will run on **http://localhost:5001** and the WebSocket on **ws://localhost:5001/ws**.

## 📦 Deployment to AWS EC2
This microservice uses **GitHub Actions** for automated deployment to an EC2 instance using Docker:

### **CI/CD Flow**
1. **Build and publish the Docker image** to Docker Hub.
2. **Deployment to EC2**, ensuring the image is up to date.
3. **Run the Docker container** with the appropriate environment variables.

For more details, check the `.github/workflows/ci-cd.yml` file.

## 📡 How WebSocket Works

- 📩 **Subscription:** Clients can subscribe to events (`user.created`, `user.updated`, `user.deleted`).
- 🔄 **Publish:** When an event occurs, it is saved to **CouchDB** and processed in the background.
- 📨 **Notification:** Subscribed clients receive real-time events.

## 📌 Server Responses
### 📤 **Successful response example**
```json
{
"type": "message",
"topic": "user.created",
"payload": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"email": "user@example.com",
"name": "Test User"
}
}
```

###  **Error codes**
- `400 Bad Request`: Invalid data in the request.
- `500 Internal Server Error`: Error on the server.





