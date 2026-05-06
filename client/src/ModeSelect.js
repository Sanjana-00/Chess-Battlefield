import "./ModeSelect.css";
import { useNavigate } from "react-router-dom";

function ModeSelect() {
  const navigate = useNavigate();

  return (
      <div className="mode-container">

  <div className="overlay">

    <h1 className="title">
      CHOOSE YOUR <span>BATTLE</span>
    </h1>

    <p className="subtitle">
      Test your strategy. Challenge your mind.
    </p>

    <div className="card-wrapper">

      <div className="mode-card">
        <div className="icon">👤</div>

        <h2>Play with Player</h2>

        <p>
          Challenge a friend and enjoy a classic game of chess.
        </p>

        <button onClick={() => navigate("/game/multi")}>
          PLAY NOW →
        </button>
      </div>

      <div className="mode-card ai">
        <div className="icon">🤖</div>

        <h2>Play with AI</h2>

        <p>
          Take on the AI and improve your chess skills.
        </p>

        <button onClick={() => navigate("/game/ai")}>
          PLAY NOW →
        </button>
      </div>

    </div>

  </div>

</div>
  );
}

export default ModeSelect;