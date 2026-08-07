import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function VersionHistory() {
  const { id } = useParams();

  const [versions, setVersions] = useState([]);

  useEffect(() => {
    getVersions();
  }, []);

  const getVersions = async () => {
    try {
      const response = await api.get(`/decisions/${id}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load version history");
    }
  };

  return (
  <div className="container">

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

  </div>
);
}

export default VersionHistory;