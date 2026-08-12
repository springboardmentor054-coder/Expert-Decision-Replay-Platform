import React, { useEffect, useState } from "react";
import api from "../api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              Stay updated with your latest activities and decisions.
            </p>
          </div>

          {unreadCount > 0 && (
            <div style={styles.unreadBadge}>
              {unreadCount} Unread
            </div>
          )}
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🔔</div>
            <h3 style={styles.emptyTitle}>No notifications</h3>
            <p style={styles.emptyText}>
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationCard,
                  ...(notification.is_read
                    ? styles.readCard
                    : styles.unreadCard),
                }}
              >
                {/* Notification Icon */}
                <div
                  style={{
                    ...styles.icon,
                    ...(notification.is_read
                      ? styles.readIcon
                      : styles.unreadIcon),
                  }}
                >
                  🔔
                </div>

                {/* Content */}
                <div style={styles.content}>
                  <div style={styles.topRow}>
                    <span
                      style={{
                        ...styles.type,
                        ...(notification.is_read
                          ? styles.readType
                          : styles.unreadType),
                      }}
                    >
                      {notification.notification_type || "INFO"}
                    </span>

                    {!notification.is_read && (
                      <span style={styles.newBadge}>NEW</span>
                    )}
                  </div>

                  <p style={styles.message}>
                    {notification.message}
                  </p>

                  {notification.created_at && (
                    <p style={styles.date}>
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>
                  )}

                  {!notification.is_read && (
                    <button
                      style={styles.readButton}
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  {notification.is_read && (
                    <span style={styles.readText}>
                      ✓ Read
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f5f7fb",
    padding: "35px 20px",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "30px",
    fontWeight: "700",
    color: "#1f2937",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
  },

  unreadBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  notificationCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  },

  unreadCard: {
    backgroundColor: "#ffffff",
    borderLeft: "4px solid #2563eb",
  },

  readCard: {
    backgroundColor: "#fafafa",
  },

  icon: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  unreadIcon: {
    backgroundColor: "#dbeafe",
  },

  readIcon: {
    backgroundColor: "#f3f4f6",
  },

  content: {
    flex: 1,
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },

  type: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  unreadType: {
    color: "#2563eb",
  },

  readType: {
    color: "#6b7280",
  },

  newBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 7px",
    borderRadius: "10px",
  },

  message: {
    margin: "0 0 8px",
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.5",
  },

  date: {
    margin: "0 0 12px",
    color: "#9ca3af",
    fontSize: "12px",
  },

  readButton: {
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  readText: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "60px 20px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#1f2937",
    fontSize: "20px",
  },

  emptyText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  loadingCard: {
    maxWidth: "500px",
    margin: "100px auto",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },

  loadingText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default Notifications;