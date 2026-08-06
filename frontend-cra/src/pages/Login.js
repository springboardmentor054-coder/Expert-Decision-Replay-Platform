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
    <div>
      <h1>Login Page</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/>

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/>

      <button onClick={handleLogin}>
        Login
      </button>

    </div>
  );
}

export default Login;