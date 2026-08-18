import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

function Notifications() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";


    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================

    const fetchNotifications = useCallback(async () => {

        try {

            setLoading(true);

            const response = await fetch(
                API_BASE_URL + "/notifications",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch notifications"
                );

            }


            const data = await response.json();

            setNotifications(data);

            setError("");

        } catch (error) {

            console.error(
                "Error fetching notifications:",
                error
            );

            setError(
                "Unable to load notifications."
            );

        } finally {

            setLoading(false);

        }

    }, [token, API_BASE_URL]);


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    useEffect(() => {

        fetchNotifications();

    }, [fetchNotifications]);


    // ==========================================
    // MARK AS READ
    // ==========================================

    const markAsRead = async (id) => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/notifications/${id}/read`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to mark notification as read"
                );

            }


            const updatedNotification =
                await response.json();


            setNotifications(
                (previousNotifications) =>
                    previousNotifications.map(
                        (notification) =>
                            notification.id === id
                                ? updatedNotification
                                : notification
                    )
            );


        } catch (error) {

            console.error(
                "Error marking notification as read:",
                error
            );

            alert(
                "Unable to mark notification as read."
            );

        }

    };


    // ==========================================
    // DELETE NOTIFICATION
    // ==========================================

    const deleteNotification = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this notification?"
        );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await fetch(
                `${API_BASE_URL}/notifications/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to delete notification"
                );

            }


            setNotifications(
                (previousNotifications) =>
                    previousNotifications.filter(
                        (notification) =>
                            notification.id !== id
                    )
            );


        } catch (error) {

            console.error(
                "Error deleting notification:",
                error
            );

            alert(
                "Unable to delete notification."
            );

        }

    };


    // ==========================================
    // FORMAT DATE & TIME
    // ==========================================

    const formatDateTime = (dateString) => {

        if (!dateString) {

            return "N/A";

        }


        return new Date(
            dateString
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="notifications-page">

                <div className="notifications-container">

                    <h1>🔔 Notifications</h1>

                    <p className="loading-message">
                        Loading notifications...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (

        <div className="notifications-page">

            <div className="notifications-container">


                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <div className="notifications-header">

                    <div>

                        <h1>
                            🔔 Notifications
                        </h1>

                        <p>
                            Stay updated with your decision activities.
                        </p>

                    </div>


                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/decisions")
                        }
                    >
                        ← Back to Decisions
                    </button>

                </div>


                {/* ================================= */}
                {/* ERROR MESSAGE */}
                {/* ================================= */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {/* ================================= */}
                {/* EMPTY STATE */}
                {/* ================================= */}

                {!error &&
                    notifications.length === 0 && (

                    <div className="empty-notifications">

                        <div className="empty-icon">
                            🔔
                        </div>

                        <h2>
                            No Notifications
                        </h2>

                        <p>
                            You don't have any notifications yet.
                        </p>

                    </div>

                )}


                {/* ================================= */}
                {/* NOTIFICATION LIST */}
                {/* ================================= */}

                <div className="notifications-list">

                    {notifications.map(
                        (notification) => (

                        <div
                            key={notification.id}
                            className={
                                notification.status === "Unread"
                                    ? "notification-card unread"
                                    : "notification-card"
                            }
                        >


                            {/* ================================= */}
                            {/* NOTIFICATION CONTENT */}
                            {/* ================================= */}

                            <div className="notification-content">


                                <div className="notification-title-row">

                                    <h2>
                                        {notification.title}
                                    </h2>


                                    <span
                                        className={
                                            notification.status === "Unread"
                                                ? "status-badge unread-status"
                                                : "status-badge read-status"
                                        }
                                    >
                                        {notification.status}
                                    </span>

                                </div>


                                <p className="notification-message">

                                    {notification.message}

                                </p>


                                <p className="notification-date">

                                    🕐{" "}

                                    {formatDateTime(
                                        notification.created_at
                                    )}

                                </p>


                            </div>


                            {/* ================================= */}
                            {/* ACTION BUTTONS */}
                            {/* ================================= */}

                            <div className="notification-actions">


                                {notification.status === "Unread" && (

                                    <button
                                        className="read-button"
                                        onClick={() =>
                                            markAsRead(
                                                notification.id
                                            )
                                        }
                                    >
                                        ✓ Mark as Read
                                    </button>

                                )}


                                <button
                                    className="delete-button"
                                    onClick={() =>
                                        deleteNotification(
                                            notification.id
                                        )
                                    }
                                >
                                    🗑 Delete
                                </button>


                            </div>


                        </div>

                    ))}

                </div>


            </div>

        </div>

    );

}


export default Notifications;




