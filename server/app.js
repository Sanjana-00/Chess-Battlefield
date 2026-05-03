const express = require('express');
const cors = require("cors");
const authRoutes = require("./routes/auth");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
app.use(cors({
  origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
  credentials: true
}));

app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/chessDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
app.use(session({
    secret: "chesssecret",
    resave: false,
    saveUninitialized: false
}));

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
let currentPlayer = "W";


app.use(express.urlencoded({ extended: true }));
app.use("/", authRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Chess API running" });
});

io.on("connection", function (socket) {
    console.log("connected");

    

    if (!players.white) {
        players.white = socket.id;
        socket.emit("playerRole", "white");
    }
    else if (!players.black) {
        players.black = socket.id;
        socket.emit("playerRole", "black");
    }
    else {
        socket.emit("spectatorRole");
    }

    socket.emit("boardState", chess.fen());

    socket.on("disconnect", function () {
        if (socket.id === players.white) {
            delete players.white;
        }
        else if (socket.id === players.black) {
            delete players.black;
        }
    });

    socket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && socket.id !== players.white) return;
            if (chess.turn() === "b" && socket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("Invalid move:",move);
                socket.emit("invalidMove:",move);
            }
            } catch (err) { 
                console.log(err);
                socket.emit("Invalid move:",move);
            }
        });  
        
       socket.on("restartGame", () => {
    chess.reset();
    io.emit("boardState", chess.fen());
});    
});

server.listen(3000, function () {
    console.log("listening on host");
});
