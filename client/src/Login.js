import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Login.css";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await axios.post(
        "http://localhost:3000/login",
        { email, password },
        { withCredentials: true }
      );
      navigate("/mode");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="container">

      {/* 🔥 HERO SECTION */}
      <section className="hero">
        <h1>♟ Chess Battlefield</h1>
        <p>Where strategy meets war.</p>
        <button onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
          Enter the Arena
        </button>
      </section>

      {/* 🔐 LOGIN SECTION */}
      <section className="login">
        <div className="login-box">
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Login</button>

          <p onClick={() => navigate("/register")}>
            Don’t have an account? Register
          </p>
        </div>
      </section>

    </div>
  );
}

export default Login;