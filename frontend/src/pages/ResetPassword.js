import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";


function ResetPassword() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
        // CHECK TOKEN
        // ==========================================

        if (!token) {

            setError(
                "Invalid password reset link."
            );

            return;
        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        if (!newPassword || !confirmPassword) {

            setError(
                "Please enter and confirm your new password."
            );

            return;
        }


        // ==========================================
        // CHECK PASSWORD MATCH
        // ==========================================

        if (newPassword !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        // ==========================================
        // PASSWORD LENGTH
        // ==========================================

        if (newPassword.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        token: token,
                        new_password: newPassword
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Password reset failed."
                );
            }


            setMessage(
                "Password reset successfully! Redirecting to login..."
            );


            setNewPassword("");
            setConfirmPassword("");


            // ==========================================
            // REDIRECT TO LOGIN
            // ==========================================

            setTimeout(() => {

                navigate("/login");

            }, 2000);


        } catch (error) {

            setError(
                error.message ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="reset-password-page">

            <div className="reset-password-card">

                <h1>
                    Reset Password
                </h1>

                <p className="reset-password-subtitle">
                    Create a new password for your account.
                </p>


                {/* ================================== */}
                {/* ERROR MESSAGE */}
                {/* ================================== */}

                {error && (

                    <div className="reset-error">
                        {error}
                    </div>

                )}


                {/* ================================== */}
                {/* SUCCESS MESSAGE */}
                {/* ================================== */}

                {message && (

                    <div className="reset-success">
                        {message}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="reset-password-form"
                >

                    {/* ================================== */}
                    {/* NEW PASSWORD */}
                    {/* ================================== */}

                    <label>
                        New Password
                    </label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(
                                event.target.value
                            )
                        }
                        placeholder="Enter new password"
                        disabled={loading}
                    />


                    {/* ================================== */}
                    {/* CONFIRM PASSWORD */}
                    {/* ================================== */}

                    <label>
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }
                        placeholder="Confirm new password"
                        disabled={loading}
                    />


                    {/* ================================== */}
                    {/* RESET BUTTON */}
                    {/* ================================== */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Resetting..."
                            : "Reset Password"
                        }

                    </button>

                </form>


                {/* ================================== */}
                {/* BACK TO LOGIN */}
                {/* ================================== */}

                <button
                    type="button"
                    className="back-to-login"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>

            </div>

        </div>

    );

}


export default ResetPassword;