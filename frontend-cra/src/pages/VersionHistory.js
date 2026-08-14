import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function VersionHistory() {
  const { id } = useParams();

  const [versions, setVersions] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);

  useEffect(() => {
    getVersions();
    getApprovalHistory();
  }, [id]);

  const getVersions = async () => {
    try {
      const response = await api.get(`/decisions/${id}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load version history");
    }
  };

  const getApprovalHistory = async () => {
    try {
      const response = await api.get(
        `/audit-logs/decision/${id}`
      );

      // Only show approval-related actions
      const approvalLogs = response.data.filter((log) =>
        log.action.toLowerCase().includes("approval") ||
        log.action.toLowerCase().includes("approved") ||
        log.action.toLowerCase().includes("rejected")
      );

      setApprovalHistory(approvalLogs);
    } catch (error) {
      console.log(error);
      alert("Failed to load approval history");
    }
  };

  return (
    <div className="container">

      {/* VERSION HISTORY */}

      <div className="page-header">
        <div>
          <h1>Version History</h1>
          <p className="page-subtitle">
            Track changes and previous versions of this decision
          </p>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Status</th>
                <th>Change Summary</th>
              </tr>
            </thead>

            <tbody>
              {versions.length > 0 ? (
                versions.map((version) => (
                  <tr key={version.id}>

                    <td>
                      <span className="version-badge">
                        v{version.version_number}
                      </span>
                    </td>

                    <td>{version.modified_by}</td>

                    <td>
                      {new Date(
                        version.modified_at
                      ).toLocaleString()}
                    </td>

                    <td>
                      <span className="status-badge">
                        {version.status}
                      </span>
                    </td>

                    <td>{version.change_summary}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No version history found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>


      {/* APPROVAL HISTORY */}

      <div className="page-header" style={{ marginTop: "40px" }}>
        <div>
          <h1>Approval History</h1>
          <p className="page-subtitle">
            Track submission, approval and rejection actions
          </p>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {approvalHistory.length > 0 ? (
                approvalHistory.map((log) => (
                  <tr key={log.id}>

                    <td>
                      <span className="status-badge">
                        {log.action}
                      </span>
                    </td>

                    <td>
                      {log.user_id}
                    </td>

                    <td>
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </td>

                    <td>
                      {log.details}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No approval history found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default VersionHistory;