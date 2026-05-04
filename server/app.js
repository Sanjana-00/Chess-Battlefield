const express = require('express');
const cors = require("cors");
const authRoutes = require("./routes/auth");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const mongoose = require("mongoose");
const session = require("express-session");


const app = express();

// =========================
// ✅ CORS
// =========================
app.use(cors({
  origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
  credentials: true
}));

// =========================
// ✅ Middlewares
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// ✅ MongoDB
// =========================
mongoose.connect("mongodb://127.0.0.1:27017/chessDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// =========================
// ✅ Session
// =========================
app.use(session({
  secret: "chesssecret",
  resave: false,
  saveUninitialized: false
}));

// =========================
// 🤖 AI ROUTE (FIXED)
// =========================
const { spawn } = require("child_process");

app.post("/api/ai-move", (req, res) => {
  console.log("AI ROUTE HIT");

  const { moves } = req.body;

  if (!moves || !Array.isArray(moves)) {
    return res.status(400).json({ error: "Invalid moves" });
  }

  const engine = spawn("stockfish.exe");

  let responded = false;

  engine.stdin.write("uci\n");
  engine.stdin.write("ucinewgame\n");
  engine.stdin.write(`position startpos moves ${moves.join(" ")}\n`);
  engine.stdin.write("go depth 10\n");

  engine.stdout.on("data", (data) => {
    const text = data.toString();

    if (!responded && text.includes("bestmove")) {
      responded = true;

      const move = text.split("bestmove ")[1].split(" ")[0];
      console.log("AI move:", move);

      res.json({ move });
      engine.kill();
    }
  });

  engine.stderr.on("data", (err) => {
    console.error("Stockfish error:", err.toString());
  });

  engine.on("error", (err) => {
    console.error("Engine failed:", err);
    if (!responded) {
      responded = true;
      res.status(500).json({ error: "Engine error" });
    }
  });
});

// =========================
// 🔐 AUTH ROUTES
// =========================
app.use("/", authRoutes);

// =========================
// 🧪 TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.json({ message: "Chess API running" });
});

// =========================
// 🔌 SOCKET.IO (MULTIPLAYER)
// =========================
const server = http.createServer(app);

const io = socket(server, {
  cors: {
    origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const chess = new Chess();
let players = {};

io.on("connection", function (socket) {
  console.log("connected");

  // Assign roles
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "white");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "black");
  } else {
    socket.emit("spectatorRole");
  }

  socket.emit("boardState", chess.fen());

  // Disconnect
  socket.on("disconnect", function () {
    if (socket.id === players.white) delete players.white;
    if (socket.id === players.black) delete players.black;
  });

  // Move
  socket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;

      const result = chess.move(move);

      if (result) {
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
      }
    } catch (err) {
      console.log(err);
    }
  });

  // Restart
  socket.on("restartGame", () => {
    chess.reset();
    io.emit("boardState", chess.fen());
  });
});

// =========================
// 🚀 SERVER START
// =========================
server.listen(3000, () => {
  console.log("Server running on port 3000");
});