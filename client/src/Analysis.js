import { useLocation } from "react-router-dom";

function Analysis() {
  const location = useLocation();

  const moves = location.state?.moves || [];
  const evaluations = location.state?.evaluations || [];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Game Analysis</h1>

      <h3>Moves:</h3>
      {moves.map((m, i) => (
        <div key={i}>
          {i + 1}. {m}
        </div>
      ))}

      <h3>Evaluations:</h3>
      {evaluations.map((e, i) => (
        <div key={i}>
          Move {i}: {e}
        </div>
      ))}
    </div>
  );
}

export default Analysis;