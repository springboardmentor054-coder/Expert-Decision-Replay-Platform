import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    console.log(data);

    // Save JWT token
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      alert("Login successful");
    } else {
      alert("Login failed");
    }

    console.log("Token:", localStorage.getItem("token"));
  };


  return (
  <div className="login-page">
    <div className="login-card">
      <div className="login-header">
        <h1>Expert Decision</h1>
        <p>Sign in to continue</p>
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
      </div>
    </div>
  </div>
);
}

export default Login;