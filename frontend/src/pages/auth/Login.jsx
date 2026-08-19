import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #2563eb)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "430px",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-5">

          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">
              Expert Decision Replay Platform
            </h2>

            <p className="text-muted">
              Sign in to continue
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="mb-3">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            {/* Forgot Password */}

            <div className="text-end mb-4">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                onClick={() =>
                  navigate("/forgot-password")
                }
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <hr />

          <div className="text-center">

            <p className="mb-2">
              Don't have an account?
            </p>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate("/register")}
            >
              Create New Account
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;