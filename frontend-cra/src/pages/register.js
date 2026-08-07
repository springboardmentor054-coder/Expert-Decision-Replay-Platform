import { useState } from "react";
import API from "../api";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {
      const response = await API.post("/register", {
        name: name,
        email: email,
        password: password
      });

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      if (error.response) {
        alert(error.response.data.detail);
      } else {
        alert("Registration failed. Backend is not reachable.");
      }

    }

  };


  return (
  <div className="login-page">
    <div className="login-card">
      <div className="login-header">
        <h1>Expert Decision</h1>
        <p>Create your account</p>
      </div>

      <div className="login-form">
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>
          Create Account
        </button>
      </div>
    </div>
  </div>
);
}

export default Register;