import { useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [mode, setMode] = useState("login");

  // register form
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [role, setRole] = useState("employee");

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: regEmail,
          password: regPassword,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Registration failed");
        return;
      }

      setMessage("Registration successful ✅");
      setFullName("");
      setRegEmail("");
      setRegPassword("");
      setRole("employee");
      setMode("login");
    } catch (error) {
      setMessage("Server error while registering");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      setToken(data.access_token);
      setMessage(`Login successful ✅ Welcome ${data.user.full_name}`);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setMessage("Server error while login");
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Expert Decision Replay Platform</h1>
        <p className="subtitle">Milestone 1 - Authentication UI</p>

        <div className="toggle-buttons">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegister} className="form">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="reviewer">Reviewer</option>
            </select>

            <button type="submit">Register</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="form">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>
        )}

        {message && <p className="message">{message}</p>}

        {token && (
          <div className="token-box">
            <h3>JWT Token</h3>
            <p>{token}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;