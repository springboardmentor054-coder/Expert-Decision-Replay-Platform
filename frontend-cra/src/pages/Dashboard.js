import React, { useEffect, useState } from "react";
import api from "../api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>
          Unable to load dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>
              Overview of your decision management activities.
            </p>
          </div>
        </div>

        <div style={styles.grid}>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <div>
              <p style={styles.label}>Total Decisions</p>
              <h2 style={styles.number}>
                {stats.total_decisions}
              </h2>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>✅</div>
            <div>
              <p style={styles.label}>Approved</p>
              <h2 style={styles.number}>
                {stats.approved}
              </h2>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>⏳</div>
            <div>
              <p style={styles.label}>Pending</p>
              <h2 style={styles.number}>
                {stats.pending}
              </h2>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>❌</div>
            <div>
              <p style={styles.label}>Rejected</p>
              <h2 style={styles.number}>
                {stats.rejected}
              </h2>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📝</div>
            <div>
              <p style={styles.label}>Draft</p>
              <h2 style={styles.number}>
                {stats.draft}
              </h2>
            </div>
          </div>

        </div>

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
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "30px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  icon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  label: {
    margin: "0 0 5px",
    color: "#6b7280",
    fontSize: "13px",
  },

  number: {
    margin: 0,
    color: "#1f2937",
    fontSize: "28px",
  },

  loading: {
    textAlign: "center",
    padding: "100px",
    color: "#6b7280",
  },

  error: {
    textAlign: "center",
    padding: "100px",
    color: "#dc2626",
  },
};

export default Dashboard;