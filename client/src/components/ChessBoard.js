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
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null); 
  const [inCheck, setInCheck] = useState(false);


  useEffect(() => {
    socket.on("playerRole", (role) => {
      setPlayerRole(role);
    });

    socket.on("spectatorRole", () => {
      setPlayerRole(null);
    });

    socket.on("boardState", (fen) => {
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

    socket.on("gameRestarted", () => {
      chess.reset();
      setBoard([...chess.board()]);
      setTurn("White");
      setGameOver(false);
      setResult(null); // ✅ RESET RESULT
    });

    return () => {
      socket.off("playerRole");
      socket.off("spectatorRole");
      socket.off("boardState");
      socket.off("gameRestarted");
    };
  }, [chess, gameOver]);

  const getPieceUnicode = (piece) => {
    if (!piece) return "";

    const map = {
      wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
      bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
    };

    return map[piece.color + piece.type];
  };

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
        socket.emit("move", move);
      }
    } catch (err) {
      console.log("Invalid move prevented:", move);
    }
  };

  const handleRestart = () => {
    chess.reset();
    setBoard([...chess.board()]);
    setTurn("White");
    setGameOver(false);
    setResult(null);
    socket.emit("restartGame");
  };

  return (
    <div style={{ textAlign: "center" }}>
      
      {/* ✅ RESULT DISPLAY */}
      {result && (
        <h2 style={{ color: "red" }}>{result}</h2>
      )}

      {inCheck && !gameOver && (
    <h3 style={{ color: "orange" }}>⚠ CHECK!</h3>
  )}

      <h2>{turn}'s Turn</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          width: "480px",
          margin: "auto",
          border: "3px solid #FFD700",
           boxShadow: "0 0 25px rgba(255,215,0,0.4)",
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
                      playerRole &&
                      (
                        (playerRole === "white" &&
                          square.color === "w" &&
                          turn === "White") ||
                        (playerRole === "black" &&
                          square.color === "b" &&
                          turn === "Black")
                      )
                    }
                    onDragStart={() =>
                      setDragged({ row: rowIndex, col: colIndex })
                    }
                    style={{
                      cursor: gameOver ? "not-allowed" : "grab",
                      color: square.color === "w" ? "#ffffff" : "#000000",
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