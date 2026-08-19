import React, { useState } from "react";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");

        setLoading(true);


        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok && data.access_token) {

                // Store JWT token
                localStorage.setItem(
                    "token",
                    data.access_token
                );


                // Store user email
                localStorage.setItem(
                    "userEmail",
                    email
                );


                // Redirect to decisions page
                navigate("/dashboard");


            } else {

                setMessage(
                    data.message ||
                    "Invalid email or password"
                );

            }


        } catch (error) {

            console.error(
                "Login error:",
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


            {/* ========================= */}
            {/* LEFT BRANDING SECTION */}
            {/* ========================= */}

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

                        Capture, manage, compare, and replay important
                        organizational decisions with complete transparency
                        and historical context.

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



            {/* ========================= */}
            {/* RIGHT LOGIN SECTION */}
            {/* ========================= */}

            <div className="login-section">


                <div className="login-card">


                    {/* Mobile Logo */}

                    <div className="mobile-logo">

                        <div className="brand-logo">

                            <span>
                                ED
                            </span>

                        </div>

                    </div>



                    {/* Login Header */}

                    <div className="login-header">


                        <p className="welcome-text">

                            Welcome back

                        </p>


                        <h2>

                            Sign in to your account

                        </h2>


                        <p className="login-subtitle">

                            Enter your credentials to continue.

                        </p>


                    </div>



                    {/* Login Form */}

                    <form onSubmit={handleLogin}>


                        {/* ========================= */}
                        {/* EMAIL */}
                        {/* ========================= */}

                        <div className="form-group">


                            <label htmlFor="email">

                                Email address

                            </label>


                            <div className="input-wrapper">


                                <span className="input-icon">

                                    ✉

                                </span>


                                <input

                                    id="email"

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



                        {/* ========================= */}
                        {/* PASSWORD */}
                        {/* ========================= */}

                        <div className="form-group">


                            <label htmlFor="password">

                                Password

                            </label>


                            <div className="input-wrapper">


                                <span className="input-icon">

                                    🔒

                                </span>


                                <input

                                    id="password"

                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    placeholder="Enter your password"

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



                        {/* ========================= */}
                        {/* FORGOT PASSWORD */}
                        {/* ========================= */}

                        <div className="forgot-password-row">


                            <button

                                type="button"

                                onClick={() =>
                                    navigate("/forgot-password")
                                }

                            >

                                Forgot password?

                            </button>


                        </div>



                        {/* ========================= */}
                        {/* LOGIN BUTTON */}
                        {/* ========================= */}

                        <button

                            type="submit"

                            className="login-button"

                            disabled={loading}

                        >


                            {loading ? (

                                <>

                                    <span className="spinner"></span>

                                    Signing in...

                                </>

                            ) : (

                                <>

                                    Sign in

                                    <span className="arrow">
                                        →
                                    </span>

                                </>

                            )}


                        </button>



                        {/* ========================= */}
                        {/* ERROR MESSAGE */}
                        {/* ========================= */}

                        {message && (

                            <div className="login-error">

                                <span>
                                    !
                                </span>

                                {message}

                            </div>

                        )}


                    </form>



                    {/* ========================= */}
                    {/* SIGN UP LINK */}
                    {/* ========================= */}

                    <div className="auth-switch">


                        <span>

                            Don't have an account?

                        </span>


                        <button

                            type="button"

                            onClick={() =>
                                navigate("/register")
                            }

                        >

                            Create an account

                        </button>


                    </div>



                    {/* ========================= */}
                    {/* FOOTER */}
                    {/* ========================= */}

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


export default Login;
