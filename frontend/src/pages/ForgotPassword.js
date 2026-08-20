import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ForgotPassword.css";


function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const API_URL =
        process.env.REACT_APP_API_URL ||
        "http://127.0.0.1:8000";


    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");


        // ==========================================
        // VALIDATE EMAIL
        // ==========================================

        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to process password reset request."
                );
            }


            setMessage(
                data.message ||
                "If the email is registered, a password reset link has been sent."
            );


            setEmail("");


        } catch (error) {

            setError(
                error.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="forgot-password-page">

            <div className="forgot-password-card">

                <h1>
                    Forgot Password?
                </h1>

                <p className="forgot-password-subtitle">
                    Enter your email address and we'll send you
                    a password reset link.
                </p>


                {/* ================================== */}
                {/* ERROR MESSAGE */}
                {/* ================================== */}

                {error && (

                    <div className="forgot-error">
                        {error}
                    </div>

                )}


                {/* ================================== */}
                {/* SUCCESS MESSAGE */}
                {/* ================================== */}

                {message && (

                    <div className="forgot-success">
                        {message}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="forgot-password-form"
                >

                    {/* ================================== */}
                    {/* EMAIL */}
                    {/* ================================== */}

                    <label>
                        Email Address
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="Enter your email"
                        disabled={loading}
                    />


                    {/* ================================== */}
                    {/* SEND BUTTON */}
                    {/* ================================== */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Sending..."
                            : "Send Reset Link"
                        }

                    </button>

                </form>


                {/* ================================== */}
                {/* BACK TO LOGIN */}
                {/* ================================== */}

                <button
                    type="button"
                    className="forgot-back-to-login"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>

            </div>

        </div>

    );

}


export default ForgotPassword;