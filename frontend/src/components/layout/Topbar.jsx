import React, { useState, useEffect, useCallback } from "react";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaChevronDown,
  FaTrash
} from "react-icons/fa";

import "../../styles/topbar.css";

import {
  getNotifications,
  markAsRead,
  deleteNotification
} from "../../services/notificationService";

const Topbar = ({ title = "Dashboard" }) => {

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Logged in User
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const userName = user?.username || "Guest";
  const userRole = user?.role || "User";

  // Load Notifications
  const loadNotifications = useCallback(async () => {

    if (!user?.user_id) return;

    try {

      const res = await getNotifications(user.user_id);

      setNotifications(Array.isArray(res.data) ? res.data : []);

    } catch (err) {

      console.error(err);

      setNotifications([]);

    }

  }, [user]);

  // Auto Refresh
  useEffect(() => {

    if (!user?.user_id) return;

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);

  }, [user, loadNotifications]);

  // Mark Read
  const handleRead = async (id) => {

    try {

      await markAsRead(id);

      loadNotifications();

    } catch (err) {

      console.error(err);

    }

  };

  // Delete Notification
  const handleDelete = async (id) => {

    try {

      await deleteNotification(id);

      loadNotifications();

    } catch (err) {

      console.error(err);

    }

  };

  // Logout
  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.replace("/");

  };

  return (

    <header className="topbar">

      {/* Left */}

      <div className="topbar-left">

        <button className="menu-btn">
          <FaBars />
        </button>

        <div>

          <h3>{title}</h3>

          <small>Expert Decision Replay Platform</small>

        </div>

      </div>

      {/* Search */}

      <div className="topbar-search">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search decisions..."
        />

      </div>

      {/* Right */}

      <div className="topbar-right">

        {/* Notifications */}

        <div className="notification-wrapper">

          <button
            className="icon-btn"
            onClick={() => {

              setShowProfileMenu(false);

              setShowNotifications(!showNotifications);

            }}
          >

            <FaBell />

            {notifications.filter(n => !n.is_read).length > 0 && (

              <span className="notification-badge">

                {notifications.filter(n => !n.is_read).length}

              </span>

            )}

          </button>

          {showNotifications && (

            <div className="notification-dropdown">

              <div className="notification-header">

                <strong>Notifications</strong>

              </div>

              {notifications.length === 0 ? (

                <div className="notification-empty">

                  No Notifications

                </div>

              ) : (

                notifications.map(item => (

                  <div
                    key={item.notification_id}
                    className={
                      item.is_read
                        ? "notification-item"
                        : "notification-item unread"
                    }
                  >

                    <div
                      className="notification-content"
                      onClick={() => handleRead(item.notification_id)}
                    >

                      <strong>{item.title}</strong>

                      <br />

                      <small>{item.message}</small>

                      <br />

                      <small
                        style={{
                          color: "#6b7280",
                          fontSize: "11px"
                        }}
                      >
                        {new Date(item.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </small>

                    </div>

                    <button
                      className="notification-delete"
                      onClick={(e) => {

                        e.stopPropagation();

                        handleDelete(item.notification_id);

                      }}
                    >

                      <FaTrash />

                    </button>

                  </div>

                ))

              )}

            </div>

          )}

        </div>

        {/* Profile */}

        <div
          className="profile-section"
          onClick={() => {

            setShowNotifications(false);

            setShowProfileMenu(!showProfileMenu);

          }}
        >

          <FaUserCircle className="profile-icon" />

          <div className="profile-info">

            <strong>{userName}</strong>

            <small>{userRole}</small>

          </div>

          <FaChevronDown className="dropdown-arrow" />

          {showProfileMenu && (

            <div className="profile-dropdown">

              <button>Profile</button>

              <button>Settings</button>

              <hr />

              <button
                className="logout"
                onClick={handleLogout}
              >

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );

};

export default Topbar;