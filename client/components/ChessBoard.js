import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

function ChessBoard() {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [playerRole, setPlayerRole] = useState(null);
  const [turn, setTurn] = useState("White");
  const [moveHistory, setMoveHistory] = useState([]);
  const [dragged, setDragged] = useState(null);

  const navigate = useNavigate();

  // ================= SOCKET =================
  useEffect(() => {
    socket.on("playerRole", (role) => {
      setPlayerRole(role);
    });

    socket.on("spectatorRole", () => {
      setPlayerRole(null);
    });

    socket.on("boardState", ({ fen, move }) => {
      chess.load(fen);

      setBoard([...chess.board()]);
      setTurn(chess.turn() === "w" ? "White" : "Black");

      // ✅ track moves
      if (move) {
        setMoveHistory((prev) => {
          const newMove = move.from + move.to;
          if (prev[prev.length - 1] === newMove) return prev;
          return [...prev, newMove];
        });
      }
    });

    return () => {
      socket.off("playerRole");
      socket.off("spectatorRole");
      socket.off("boardState");
    };
  }, [chess]);

  // ================= MOVE =================
  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    const move = {
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      promotion: "q",
    };

    socket.emit("move", move);
  };

  // ================= ANALYSIS =================
  const handleAnalysis = async () => {
    console.log("Sending moves:", moveHistory);

    if (moveHistory.length === 0) {
      alert("Play some moves before analysis!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moves: moveHistory }),
      });

      const data = await res.json();

      console.log("Evaluations:", data.evaluations);

      navigate("/analysis", {
        state: {
          moves: moveHistory,
          evaluations: data.evaluations,
        },
      });
    } catch (err) {
      console.error("Analysis error:", err);
    }
  };

  // ================= UI =================
  const getPieceUnicode = (piece) => {
    const map = {
      wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
      bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
    };
    return map[piece.color + piece.type];
  };

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>{turn}'s Turn</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          width: "480px",
          margin: "auto",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: isLight ? "#f0d9b5" : "#b58863",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "30px",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragged) {
                    handleMove(
                      dragged.row,
                      dragged.col,
                      rowIndex,
                      colIndex
                    );
                    setDragged(null);
                  }
                }}
              >
                {square && (
                  <div
                    draggable={playerRole === square.color}
                    onDragStart={() =>
                      setDragged({ row: rowIndex, col: colIndex })
                    }
                    style={{ cursor: "grab" }}
                  >
                    {getPieceUnicode(square)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <br />

      <button onClick={() => socket.emit("restartGame")}>
        Restart Game
      </button>

      {/* ✅ Your existing button just connect this */}
      <button onClick={handleAnalysis}>
        Analyze Game
      </button>
    </div>
  );
}

export default ChessBoard;