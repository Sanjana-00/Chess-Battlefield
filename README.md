# ♟ Chess Battlefield

An AI Powered Real-Time Multiplayer Chess Platform built using the **MERN Stack**, **Socket.IO**, and **Stockfish AI**.

Chess Battlefield delivers an immersive chess experience with real-time multiplayer gameplay, AI opponent mode, premium themed UI, live move synchronization, and server-side move validation.


---

# 🚀 Features

- ♟ Real-time multiplayer chess gameplay
- 🤖 Play against AI powered by Stockfish
- 🔄 Live board synchronization using Socket.IO
- 🧠 Server-side move validation using chess.js
- 👥 Automatic player role assignment
- 👀 Spectator mode support
- ⚡ Real-time game updates
- 🛑 Illegal move prevention
- 🎨 Premium cinematic chess-themed UI
- ♻️ Board state synchronization using FEN notation
- 🔐 Login and Registration system
- 📱 Responsive modern interface


---

# 🛠 Tech Stack

## Frontend
- React.js
- CSS3
- JavaScript
- Socket.IO Client

## Backend
- Node.js
- Express.js
- Socket.IO
- chess.js

## Database
- MongoDB

## AI Engine
- Stockfish


---

# ⚙️ How It Works

1. Users can log in and choose between Multiplayer or AI mode.
2. Players are automatically assigned roles (White / Black).
3. Moves are sent to the server using WebSockets.
4. The server validates every move using chess.js.
5. Valid moves are synchronized instantly across all clients.
6. In AI mode, Stockfish generates intelligent counter moves.


---

# ▶️ Run Locally

## Clone the repository

```bash
git clone https://github.com/Sanjana-00/Chess-Battlefield.git
```

## Install dependencies

### Client
```bash
cd client
npm install
```

### Server
```bash
cd server
npm install
```

## Start the project

### Frontend
```bash
npm start
```

### Backend
```bash
node app.js
```
