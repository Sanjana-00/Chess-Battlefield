import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";

const socket = io("http://localhost:3000");

function ChessBoard() {
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  const [board, setBoard] = useState(chess.board());
  const [playerRole, setPlayerRole] = useState(null);
  const [turn, setTurn] = useState("White");
  const [dragged, setDragged] = useState(null);

  useEffect(() => {
    // 🔹 Get player role
    socket.on("playerRole", (role) => {
      console.log("ROLE:", role); // ✅ debug
      setPlayerRole(role); // "white" or "black"
    });

    socket.on("spectatorRole", () => {
      console.log("You are spectator");
      setPlayerRole(null);
    });

    // 🔹 Update board from server
    socket.on("boardState", (fen) => {
      chess.load(fen);
      setBoard([...chess.board()]);
      setTurn(chess.turn() === "w" ? "White" : "Black");
    });

    // 🔹 Restart sync
    socket.on("gameRestarted", () => {
      chess.reset();
      setBoard([...chess.board()]);
      setTurn("White");
    });

    return () => {
      socket.off("playerRole");
      socket.off("spectatorRole");
      socket.off("boardState");
      socket.off("gameRestarted");
    };
  }, [chess]);

  // 🔹 Piece symbols
  const getPieceUnicode = (piece) => {
    if (!piece) return "";

    const map = {
      wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
      bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
    };

    return map[piece.color + piece.type];
  };

  // 🔹 Move logic
  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    const move = {
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      promotion: "q",
    };

    const result = chess.move(move);

    if (result) {
      setBoard([...chess.board()]);
      setTurn(chess.turn() === "w" ? "White" : "Black");
      socket.emit("move", move);
    } else {
      console.log("Invalid move");
    }
  };

  // 🔹 Restart game
  const handleRestart = () => {
    chess.reset();
    setBoard([...chess.board()]);
    setTurn("White");
    socket.emit("restartGame");
  };

  return (
    <div style={{ textAlign: "center" }}>
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
                  fontSize: "32px",
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
                    draggable={
                      playerRole &&
                      (
                        (playerRole === "white" && square.color === "w") ||
                        (playerRole === "black" && square.color === "b")
                      )
                    }
                    onDragStart={() =>
                      setDragged({ row: rowIndex, col: colIndex })
                    }
                    style={{
                      cursor: "grab",
                      color: square.color === "w" ? "#ffffff" : "#000000", // ✅ FIXED COLORS
                    }}
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

      <button onClick={handleRestart} disabled={!playerRole}>
        Restart Game
      </button>
    </div>
  );
}

export default ChessBoard;