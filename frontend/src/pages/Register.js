import React, { useState } from "react";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Employee");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must contain at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(
                    "Account created successfully! Please login."
                );

                navigate("/login");
            } else {
                console.error(
                    "Registration Error:",
                    data
                );

                setMessage(
                    data.detail ||
                    data.message ||
                    "Unable to create account"
                );
            }
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setMessage(
                "Unable to connect to the server"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        <span>
                            ED
                        </span>
                    </div>

                    <h1>
                        Expert Decision
                        <br />
                        Replay Platform
                    </h1>

                    <p className="brand-description">
                        Create your account and start managing
                        important organizational decisions with
                        transparency, context, and historical insight.
                    </p>

                    <div className="feature-list">

                        <div className="feature-item">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Centralized Decisions
                                </strong>

                                <span>
                                    Manage important decisions in one place.
                                </span>
                            </div>

                        </div>

                        <div className="feature-item">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Decision History
                                </strong>

                                <span>
                                    Track changes with automatic version history.
                                </span>
                            </div>

                        </div>

                        <div className="feature-item">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Complete Context
                                </strong>

                                <span>
                                    Connect alternatives, documents, and discussions.
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="brand-footer">
                    Decision Intelligence
                    &nbsp;•&nbsp;
                    Secure
                    &nbsp;•&nbsp;
                    Transparent
                </div>

            </div>

            <div className="login-section">

                <div className="login-card">

                    <div className="mobile-logo">

                        <div className="brand-logo">
                            <span>
                                ED
                            </span>
                        </div>

                    </div>

                    <div className="login-header">

                        <p className="welcome-text">
                            Get started
                        </p>

                        <h2>
                            Create your account
                        </h2>

                        <p className="login-subtitle">
                            Join the Expert Decision Replay Platform.
                        </p>

                    </div>

                    <form onSubmit={handleRegister}>

                        <div className="form-group">

                            <label htmlFor="name">
                                Full name
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    👤
                                </span>

                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label htmlFor="register-email">
                                Email address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>

                       <div className="form-group">

    <label htmlFor="register-role">
        Select role
    </label>

    <div className="input-wrapper">

        <select
            id="register-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
        >
            <option value="Employee">
                Employee
            </option>

            <option value="Reviewer">
                Reviewer
            </option>

            <option value="Manager">
                Manager
            </option>
        </select>

    </div>

</div>
                        <div className="form-group">

                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="register-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        <div className="form-group">

                            <label htmlFor="confirm-password">
                                Confirm password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account

                                    <span className="arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                        {message && (
                            <div className="login-error">

                                <span>
                                    !
                                </span>

                                {message}

                            </div>
                        )}

                    </form>

                    <div className="auth-switch">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Sign in
                        </button>

                    </div>

                    <div className="login-footer">

                        <span>
                            Expert Decision Replay Platform
                        </span>

                        <span>
                            Secure Decision Management
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;
