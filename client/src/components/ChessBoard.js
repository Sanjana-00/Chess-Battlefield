import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import "./ChessBoard.css";

function ChessBoard({ mode }) {
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  const socketRef = useRef(null);

  const [board, setBoard] = useState(chess.board());
  const [playerRole, setPlayerRole] = useState(null);
  const [turn, setTurn] = useState("White");
  const [dragged, setDragged] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [inCheck, setInCheck] = useState(false);

  // ================= SOCKET (MULTIPLAYER) =================
  useEffect(() => {
    if (mode === "multi") {
      socketRef.current = io("http://localhost:3000");

      socketRef.current.on("playerRole", (role) => {
        setPlayerRole(role);
      });

      socketRef.current.on("spectatorRole", () => {
        setPlayerRole(null);
      });

      socketRef.current.on("boardState", (fen) => {
        chess.load(fen);
        setBoard([...chess.board()]);
        setTurn(chess.turn() === "w" ? "White" : "Black");

        setInCheck(chess.isCheck());

        if (!gameOver) {
          if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "Black" : "White";
            setResult(`${winner} Wins by Checkmate!`);
            setGameOver(true);
          } else if (chess.isDraw()) {
            setResult("Game Draw!");
            setGameOver(true);
          }
        }
      });

      socketRef.current.on("gameRestarted", () => {
        chess.reset();
        setBoard([...chess.board()]);
        setTurn("White");
        setGameOver(false);
        setResult(null);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [mode]);

  // ================= AI FUNCTION =================
  const getAIMove = async (history) => {
    try {
      const res = await fetch("http://localhost:3000/api/ai-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moves: history }),
      });

      if (!res.ok) {
        console.error("AI API failed:", res.status);
        return null;
      }

      const data = await res.json();

      if (!data.move) {
        console.error("No move returned from AI");
        return null;
      }

      return data.move;
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  // ================= MOVE HANDLER =================
  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (gameOver) return;

    const move = {
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      promotion: "q",
    };

    try {
      const result = chess.move(move);

      if (result) {
        setBoard([...chess.board()]);
        setTurn(chess.turn() === "w" ? "White" : "Black");

        // 🔥 MULTIPLAYER
        if (mode === "multi") {
          socketRef.current.emit("move", move);
        }

        // 🤖 AI MODE
        if (mode === "ai") {
          setTimeout(async () => {
            const history = chess
              .history({ verbose: true })
              .map((m) => m.from + m.to);

            const aiMove = await getAIMove(history);

            console.log("AI move:", aiMove);

            if (!aiMove) return;

            chess.move({
              from: aiMove.slice(0, 2),
              to: aiMove.slice(2, 4),
              promotion: "q",
            });

            setBoard([...chess.board()]);
            setTurn(chess.turn() === "w" ? "White" : "Black");
          }, 500);
        }
      }
    } catch (err) {
      console.log("Invalid move:", move);
    }
  };

  // ================= RESTART =================
  const handleRestart = () => {
    chess.reset();
    setBoard([...chess.board()]);
    setTurn("White");
    setGameOver(false);
    setResult(null);

    if (mode === "multi") {
      socketRef.current.emit("restartGame");
    }
  };

  // ================= UI =================
  const getPieceUnicode = (piece) => {
    if (!piece) return "";

    const map = {
      wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
      bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
    };

    return map[piece.color + piece.type];
  };

 return (
  <div className="chess-page">

    {result && (
      <h2 className="result-text">
        {result}
      </h2>
    )}

    {inCheck && !gameOver && (
      <h3 className="check-text">
        ⚠ CHECK!
      </h3>
    )}

    <h2 className="turn-text">
      {turn}'s Turn
    </h2>

    <div className="board-container">
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${isLight ? "light" : "dark"}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragged || gameOver) return;

                handleMove(
                  dragged.row,
                  dragged.col,
                  rowIndex,
                  colIndex
                );

                setDragged(null);
              }}
            >
              {square && (
                <div
                  draggable={
                    !gameOver &&
                    (
                      (mode === "multi" &&
                        playerRole &&
                        (
                          (playerRole === "white" &&
                            square.color === "w" &&
                            turn === "White") ||

                          (playerRole === "black" &&
                            square.color === "b" &&
                            turn === "Black")
                        )) ||

                      (mode === "ai" &&
                        square.color === "w" &&
                        turn === "White")
                    )
                  }
                  onDragStart={() =>
                    setDragged({
                      row: rowIndex,
                      col: colIndex,
                    })
                  }
                  className="piece"
                  style={{
                    color:
                      square.color === "w"
                        ? "#ffffff"
                        : "#000000",

                    cursor:
                      gameOver
                        ? "not-allowed"
                        : "grab",
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

    <button
      className="restart-btn"
      onClick={handleRestart}
    >
      ↻ Restart Game
    </button>

  </div>
);
}

export default ChessBoard;