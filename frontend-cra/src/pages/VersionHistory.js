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
    <div>
      <h2>Decision Version History</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Version Number</th>
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
                <td>{version.version_number}</td>
                <td>{version.modified_by}</td>
                <td>{new Date(version.modified_at).toLocaleString()}</td>
                <td>{version.status}</td>
                <td>{version.change_summary}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No version history found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VersionHistory;