import { useNavigate } from "react-router-dom";

function ModeSelect() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Choose Your Battle ⚔️</h1>

      <button onClick={() => navigate("/game/multi")}>
        👤 Play with Player
      </button>

      <br /><br />

      <button onClick={() => navigate("/game/ai")}>
        🤖 Play with AI
      </button>
    </div>
  );
}

export default ModeSelect;