import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VersionHistory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/decisions/${id}/versions`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch version history");
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setVersions(data);
                } else {
                    console.log("Unexpected response:", data);
                    setVersions([]);
                }
            })
            .catch(error => {
                console.log(error);
                setVersions([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <h2>Loading version history...</h2>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Decision Version History</h1>

            <button onClick={() => navigate(`/decision/${id}`)}>
                Back to Decision
            </button>

            <br />
            <br />

            {versions.length === 0 ? (
                <p>No version history available.</p>
            ) : (
                versions.map(version => (
                    <div
                        key={version.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px"
                        }}
                    >
                        <p>
                            <strong>Version Number:</strong>{" "}
                            V{version.version_number}
                        </p>

                        <p>
                            <strong>Modified By:</strong>{" "}
                            User {version.modified_by}
                        </p>

                        <p>
                            <strong>Modified Date:</strong>{" "}
                            {new Date(version.modified_at).toLocaleString(
                                "en-GB",
                                {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )}
                        </p>

                        <p>
                            <strong>Status:</strong> {version.status}
                        </p>

                        <p>
                            <strong>Change Summary:</strong>{" "}
                            {version.change_summary}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default VersionHistory;