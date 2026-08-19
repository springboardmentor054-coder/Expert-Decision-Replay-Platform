import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {

        const fetchUser = async () => {

            if (!token) {
                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await response.json();

                setUser(data);

            } catch (error) {

                console.error(
                    "Error fetching logged-in user:",
                    error
                );

            }

        };

        fetchUser();

    }, [token]);


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");

        navigate("/login");
    };


    const getInitials = () => {

        if (user?.name) {

            return user.name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();
        }

        if (user?.email) {

            return user.email
                .charAt(0)
                .toUpperCase();
        }

        return "U";
    };


    const role = user?.role?.toLowerCase() || "";

    const isAdministrator =
        role === "administrator";

    const isManager =
        role === "manager";

    const isReviewer =
        role === "reviewer";


    return (

        <aside className="sidebar">


            {/* ========================= */}
            {/* BRAND */}
            {/* ========================= */}

            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    ED
                </div>

                <div className="sidebar-brand-text">

                    <h2>
                        Expert Decision
                    </h2>

                    <span>
                        Replay Platform
                    </span>

                </div>

            </div>


            {/* ========================= */}
            {/* NAVIGATION */}
            {/* ========================= */}

            <nav className="sidebar-navigation">


                {/* ========================= */}
                {/* MAIN */}
                {/* ========================= */}

                <div className="sidebar-section">

                    <div className="sidebar-section-title">
                        MAIN
                    </div>

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            🏠
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </NavLink>

                </div>


                {/* ========================= */}
                {/* DECISIONS */}
                {/* ========================= */}

                <div className="sidebar-section">

                    <div className="sidebar-section-title">
                        DECISIONS
                    </div>


                    <NavLink
                        to="/decisions"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            📋
                        </span>

                        <span>
                            Decisions
                        </span>

                    </NavLink>


                    <NavLink
                        to="/create-decision"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            ➕
                        </span>

                        <span>
                            Create Decision
                        </span>

                    </NavLink>


                    <NavLink
                        to="/alternatives"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            🔄
                        </span>

                        <span>
                            Alternatives
                        </span>

                    </NavLink>

                </div>


                {/* ========================= */}
                {/* WORKFLOW */}
                {/* ========================= */}

                <div className="sidebar-section">

                    <div className="sidebar-section-title">
                        WORKFLOW
                    </div>


                    {(isReviewer ||
                        isManager ||
                        isAdministrator) && (

                        <>

                            <NavLink
                                to="/approvals"
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <span className="sidebar-icon">
                                    ⏳
                                </span>

                                <span>
                                    Pending Approvals
                                </span>

                            </NavLink>


                            <NavLink
                                to="/approval-history"
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <span className="sidebar-icon">
                                    ✅
                                </span>

                                <span>
                                    Approval History
                                </span>

                            </NavLink>

                        </>

                    )}


                    <NavLink
                        to="/documents"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            📁
                        </span>

                        <span>
                            Documents
                        </span>

                    </NavLink>


                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            🔔
                        </span>

                        <span>
                            Notifications
                        </span>

                    </NavLink>

                </div>


                {/* ========================= */}
                {/* MANAGEMENT */}
                {/* ========================= */}

                {(isManager ||
                    isAdministrator) && (

                    <div className="sidebar-section">

                        <div className="sidebar-section-title">
                            MANAGEMENT
                        </div>


                        <NavLink
                            to="/reports"
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                📊
                            </span>

                            <span>
                                Reports
                            </span>

                        </NavLink>

                    </div>

                )}


                {/* ========================= */}
                {/* ADMINISTRATION */}
                {/* ========================= */}

                {isAdministrator && (

                    <div className="sidebar-section">

                        <div className="sidebar-section-title">
                            ADMINISTRATION
                        </div>


                        <NavLink
                            to="/audit-logs"
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                🛡️
                            </span>

                            <span>
                                Audit Logs
                            </span>

                        </NavLink>

                    </div>

                )}


                {/* ========================= */}
                {/* ACCOUNT */}
                {/* ========================= */}

                <div className="sidebar-section">

                    <div className="sidebar-section-title">
                        ACCOUNT
                    </div>


                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="sidebar-icon">
                            👤
                        </span>

                        <span>
                            Profile
                        </span>

                    </NavLink>

                </div>

            </nav>


            {/* ========================= */}
            {/* USER AREA */}
            {/* ========================= */}

            <div className="sidebar-user">

                <div className="sidebar-user-info">

                    <div className="sidebar-avatar">
                        {getInitials()}
                    </div>


                    <div className="sidebar-user-details">

                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.role || "Employee"}
                        </span>

                    </div>

                </div>


                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                    title="Logout"
                >
                    ↪
                </button>

            </div>

        </aside>

    );
}

export default Sidebar;
