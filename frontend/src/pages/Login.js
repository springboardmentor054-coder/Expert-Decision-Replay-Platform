import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/login", {
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

            if (response.ok && data.access_token) {

                // Store JWT token
                localStorage.setItem("token", data.access_token);

                // Store user email
                localStorage.setItem("userEmail", email);

                // Redirect to decisions page
                navigate("/decisions");

            } else {
                setMessage(data.message || "Login failed");
            }

        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to the server");
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.loginBox}>

                <h2 style={styles.heading}>
                    Expert Decision Replay Platform
                </h2>

                <h3 style={styles.subHeading}>
                    Login
                </h3>

                <form onSubmit={handleLogin}>

                    <div style={styles.inputGroup}>
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Login
                    </button>

                </form>

                {message && (
                    <p style={styles.message}>
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8"
    },

    loginBox: {
        width: "400px",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
    },

    heading: {
        textAlign: "center",
        marginBottom: "10px"
    },

    subHeading: {
        textAlign: "center",
        marginBottom: "30px"
    },

    inputGroup: {
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column"
    },

    input: {
        padding: "12px",
        marginTop: "7px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "15px"
    },

    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer"
    },

    message: {
        textAlign: "center",
        marginTop: "20px",
        color: "red"
    }
};

export default Login;