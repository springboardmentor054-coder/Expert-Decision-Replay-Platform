import React, { useEffect, useState } from "react";
import "./AuditLogs.css";

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAuditLogs();
    fetchUsers();
    fetchDecisions();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/audit-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDecisions = async () => {
    try {
      const response = await fetch("http://localhost:8000/decisions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch decisions");
      }

      const data = await response.json();
      setDecisions(data);
    } catch (error) {
      console.error("Error fetching decisions:", error);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);

    if (!user) {
      return `User ${userId}`;
    }

    return (
      user.name ||
      user.username ||
      user.full_name ||
      user.email ||
      `User ${userId}`
    );
  };

  const getDecisionTitle = (decisionId) => {
    if (!decisionId) {
      return "—";
    }

    const decision = decisions.find(
      (decision) => decision.id === decisionId
    );

    if (!decision) {
      return `Decision ${decisionId}`;
    }

    return (
      decision.title ||
      decision.decision_title ||
      `Decision ${decisionId}`
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    const date = new Date(dateTime);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const clearFilters = () => {
    setUserFilter("");
    setActionFilter("");
    setDateFilter("");
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesUser =
      userFilter === "" ||
      log.user_id.toString() === userFilter;

    const matchesAction =
      actionFilter === "" ||
      log.action_type === actionFilter;

    const matchesDate =
      dateFilter === "" ||
      (log.created_at &&
        new Date(log.created_at).toISOString().split("T")[0] === dateFilter);

    return matchesUser && matchesAction && matchesDate;
  });

  const actionTypes = [
    ...new Set(auditLogs.map((log) => log.action_type)),
  ];

  return (
    <div className="audit-logs-page">

      <div className="audit-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track user activities and system actions</p>
        </div>

        <div className="audit-count">
          {filteredLogs.length} Logs
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="audit-filters">

        <div className="filter-group">
          <label>Filter by User</label>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">All Users</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserName(user.id)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Action Type</label>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>

            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Date</label>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <button
          className="clear-filter-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* ================= AUDIT TABLE ================= */}

      <div className="audit-table-container">

        <table className="audit-table">

          <thead>
            <tr>
              <th>User Name</th>
              <th>Action Type</th>
              <th>Decision Title</th>
              <th>Description</th>
              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>

            {filteredLogs.length === 0 ? (

              <tr>
                <td
                  colSpan="5"
                  className="no-audit-logs"
                >
                  No audit logs found.
                </td>
              </tr>

            ) : (

              filteredLogs.map((log) => (

                <tr key={log.id}>

                  <td>
                    <span className="user-name">
                      {getUserName(log.user_id)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`action-badge ${log.action_type
                        .toLowerCase()
                        .replace(/_/g, "-")}`}
                    >
                      {log.action_type}
                    </span>
                  </td>

                  <td>
                    {getDecisionTitle(log.decision_id)}
                  </td>

                  <td>
                    {log.description}
                  </td>

                  <td>
                    {formatDateTime(log.created_at)}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AuditLogs;