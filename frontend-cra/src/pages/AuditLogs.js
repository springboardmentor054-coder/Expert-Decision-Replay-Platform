import React, { useEffect, useState } from "react";
import api from "../api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get("/audit-logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          Loading audit logs...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Audit Logs</h1>
            <p style={styles.subtitle}>
              Track important activities performed on decisions.
            </p>
          </div>

          <div style={styles.countBadge}>
            {logs.length} Activities
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.icon}>📋</div>

            <h3 style={styles.emptyTitle}>
              No audit logs yet
            </h3>

            <p style={styles.emptyText}>
              Decision approval and rejection activities will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {logs.map((log) => (
              <div key={log.id} style={styles.card}>

                <div style={styles.icon}>
                  📋
                </div>

                <div style={styles.content}>
                  <div style={styles.topRow}>
                    <span style={styles.action}>
                      {log.action}
                    </span>

                    {log.created_at && (
                      <span style={styles.date}>
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p style={styles.details}>
                    {log.details}
                  </p>

                  <div style={styles.meta}>
                    <span>
                      User ID: {log.user_id ?? "N/A"}
                    </span>

                    <span>
                      Decision ID: {log.decision_id ?? "N/A"}
                    </span>
                  </div>
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

  countBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  icon: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  content: {
    flex: 1,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "8px",
  },

  action: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "14px",
  },

  date: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  details: {
    margin: "0 0 12px",
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  meta: {
    display: "flex",
    gap: "20px",
    color: "#6b7280",
    fontSize: "12px",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "60px 20px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
    color: "#6b7280",
  },
};

export default AuditLogs;