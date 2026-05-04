import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bgImage from "./assets/register.png";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");
      setSuccess("");

      const res = await axios.post(
        "http://localhost:3000/register",
        { username, email, password },
        { withCredentials: true }
      );

      setSuccess(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.log(err);
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
     

      {/* THEMED BOX */}
      <div
        style={{
          position: "relative",
          width: "300px",
          padding: "35px",
          borderRadius: "35px",
          background: "rgba(15, 15, 15, 0.95)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          boxShadow:
            "0 0 25px rgba(0,0,0,0.8), 0 0 10px rgba(255,215,0,0.2)",
          color: "#e0e0e0",
          textAlign: "center",
        }}
      >
        {/* Title */}
        <h2
          style={{
            marginBottom: "25px",
            color: "#FFD700",
            letterSpacing: "1px",
          }}
        >
          READY TO BATTLE?
        </h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}
        {success && <p style={{ color: "#4CAF50" }}>{success}</p>}

        <button onClick={handleRegister} style={buttonStyle}>
          Enter the Battle
        </button>

        <p style={{ marginTop: "15px", fontSize: "14px" }}>
          Already a warrior?{" "}
          <span
            style={{ color: "#FFD700", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 215, 0, 0.2)",
  outline: "none",
  background: "#111",
  color: "#fff",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  background: "linear-gradient(45deg, #b8860b, #ffd700)",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
};

export default Register;