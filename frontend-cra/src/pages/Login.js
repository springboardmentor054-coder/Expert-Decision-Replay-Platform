import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        alert("Login successful");

        // Redirect to Dashboard
        navigate("/dashboard");
      } else {
        alert(data.detail || "Login failed");
      }

      console.log("Token:", localStorage.getItem("token"));
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Expert Decision</h1>

          <p>Decision Intelligence & Knowledge Platform</p>

          <small>
            Capture decisions. Preserve knowledge. Make better decisions.
          </small>
        </div>

        <div className="login-form">

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>
            Login
          </button>

          <div className="signup-link">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Sign up
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;