import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import "./Profile.css";

function Profile() {

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: ""
    });

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const token = localStorage.getItem("token");


    // ==========================================
    // FETCH CURRENT USER
    // ==========================================

    useEffect(() => {

        const fetchProfile = async () => {

            if (!token) {

                setProfileError("You are not logged in.");
                setProfileLoading(false);

                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    setProfile({
                        name: data.name,
                        email: data.email,
                        role: data.role
                    });

                } else {

                    setProfileError(
                        data.detail || "Unable to load profile."
                    );

                }

            } catch (error) {

                console.error(
                    "Profile fetch error:",
                    error
                );

                setProfileError(
                    "Unable to connect to the server."
                );

            } finally {

                setProfileLoading(false);

            }

        };


        fetchProfile();

    }, [token]);


    // ==========================================
    // PROFILE INPUT
    // ==========================================

    const handleProfileChange = (e) => {

        const { name, value } = e.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleProfileSubmit = async (e) => {

        e.preventDefault();

        setProfileMessage("");
        setProfileError("");
        setProfileSaving(true);

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: profile.name,
                        email: profile.email
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setProfile({
                    name: data.name,
                    email: data.email,
                    role: data.role
                });

                localStorage.setItem(
                    "userEmail",
                    data.email
                );

                setProfileMessage(
                    "Profile updated successfully."
                );

            } else {

                setProfileError(
                    data.detail || "Unable to update profile."
                );

            }

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            setProfileError(
                "Unable to connect to the server."
            );

        } finally {

            setProfileSaving(false);

        }

    };


    // ==========================================
    // PASSWORD INPUT
    // ==========================================

    const handlePasswordChange = (e) => {

        const { name, value } = e.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handlePasswordSubmit = async (e) => {

        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");


        // ==========================================
        // CONFIRM PASSWORD
        // ==========================================

        if (
            passwordData.new_password !==
            passwordData.confirm_password
        ) {

            setPasswordError(
                "New password and confirmation password do not match."
            );

            return;
        }


        if (
            !passwordData.current_password ||
            !passwordData.new_password
        ) {

            setPasswordError(
                "Please fill in all password fields."
            );

            return;
        }


        setPasswordSaving(true);


        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/change-password`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        current_password:
                            passwordData.current_password,

                        new_password:
                            passwordData.new_password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setPasswordMessage(
                    "Password changed successfully."
                );

                setPasswordData({
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                });

            } else {

                setPasswordError(
                    data.detail ||
                    "Unable to change password."
                );

            }

        } catch (error) {

            console.error(
                "Password change error:",
                error
            );

            setPasswordError(
                "Unable to connect to the server."
            );

        } finally {

            setPasswordSaving(false);

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (profileLoading) {

        return (

            <div className="profile-page">

                <div className="profile-loading">

                    Loading profile...

                </div>

            </div>

        );

    }


    return (

        <div className="profile-page">


            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="profile-header">

                <div>

                    <p className="profile-eyebrow">
                        Account
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p className="profile-subtitle">
                        Manage your personal information and account security.
                    </p>

                </div>

            </div>



            {/* ================================= */}
            {/* PROFILE ERROR */}
            {/* ================================= */}

            {profileError && (

                <div className="profile-alert profile-alert-error">

                    <span>!</span>

                    {profileError}

                </div>

            )}



            {/* ================================= */}
            {/* PROFILE INFORMATION */}
            {/* ================================= */}

            <div className="profile-grid">


                <section className="profile-card">


                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            👤
                        </div>

                        <div>

                            <h2>
                                Profile Information
                            </h2>

                            <p>
                                Update your personal information.
                            </p>

                        </div>

                    </div>


                    <form onSubmit={handleProfileSubmit}>


                        {/* NAME */}

                        <div className="profile-form-group">

                            <label htmlFor="profile-name">
                                Full name
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="profile-form-group">

                            <label htmlFor="profile-email">
                                Email address
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                required
                            />

                        </div>


                        {/* ROLE */}

                        <div className="profile-form-group">

                            <label htmlFor="profile-role">
                                Role
                            </label>

                            <input
                                id="profile-role"
                                type="text"
                                value={profile.role}
                                disabled
                            />

                            <span className="field-note">
                                Your role can only be changed by an Administrator.
                            </span>

                        </div>


                        {profileMessage && (

                            <div className="profile-alert profile-alert-success">

                                <span>✓</span>

                                {profileMessage}

                            </div>

                        )}


                        <button
                            type="submit"
                            className="profile-button"
                            disabled={profileSaving}
                        >

                            {profileSaving
                                ? "Updating..."
                                : "Update Profile"}

                        </button>


                    </form>

                </section>



                {/* ================================= */}
                {/* PASSWORD CARD */}
                {/* ================================= */}

                <section className="profile-card">


                    <div className="profile-card-header">

                        <div className="profile-card-icon">
                            🔒
                        </div>

                        <div>

                            <h2>
                                Change Password
                            </h2>

                            <p>
                                Keep your account secure with a strong password.
                            </p>

                        </div>

                    </div>


                    <form onSubmit={handlePasswordSubmit}>


                        {/* CURRENT PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="current-password">
                                Current password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="current-password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="current_password"
                                    value={
                                        passwordData.current_password
                                    }
                                    onChange={handlePasswordChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-show-button"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                >
                                    {showCurrentPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="new-password">
                                New password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="new-password"
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="new_password"
                                    value={
                                        passwordData.new_password
                                    }
                                    onChange={handlePasswordChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-show-button"
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                >
                                    {showNewPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="confirm-password">
                                Confirm new password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirm_password"
                                    value={
                                        passwordData.confirm_password
                                    }
                                    onChange={handlePasswordChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-show-button"
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


                        {passwordError && (

                            <div className="profile-alert profile-alert-error">

                                <span>!</span>

                                {passwordError}

                            </div>

                        )}


                        {passwordMessage && (

                            <div className="profile-alert profile-alert-success">

                                <span>✓</span>

                                {passwordMessage}

                            </div>

                        )}


                        <button
                            type="submit"
                            className="profile-button"
                            disabled={passwordSaving}
                        >

                            {passwordSaving
                                ? "Changing..."
                                : "Change Password"}

                        </button>


                    </form>

                </section>


            </div>

        </div>

    );

}


export default Profile;
