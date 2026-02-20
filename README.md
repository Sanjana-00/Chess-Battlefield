# ♟ Real-Time Chess Game

A real-time chess application built using **Node.js, Express, Socket.io, and chess.js**.

This project allows two players to compete live in a synchronized chess match with server-side move validation and spectator support.


## 🚀 Features

- ♟ Real-time multiplayer gameplay
- 🔄 Live board synchronization using Socket.io
- 🧠 Server-side move validation using chess.js
- 🎭 Automatic player role assignment (White / Black / Spectator)
- 🛑 Illegal move prevention
- 👀 Spectator mode support
- ♻️ Board state synchronization using FEN notation


## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- Socket.io
- chess.js

### Frontend
- HTML
- CSS (Tailwind)
- JavaScript


## ⚙️ How It Works

1. When users connect, roles are automatically assigned.
2. Moves are sent to the server via WebSockets.
3. The server validates moves using chess.js.
4. Valid moves are broadcast to all connected clients.
5. The board state is synchronized using FEN strings.



