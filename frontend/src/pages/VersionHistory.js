import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VersionHistory.css";

function VersionHistory() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetch(
            `http://127.0.0.1:8000/decisions/${id}/versions`
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch version history"
                    );

                }

                return response.json();

            })

            .then(data => {

                if (Array.isArray(data)) {

                    setVersions(data);

                } else {

                    console.log(
                        "Unexpected response:",
                        data
                    );

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


    /* ================================= */
    /* LOADING */
    /* ================================= */

    if (loading) {

        return (

            <div className="version-loading">

                <div className="version-spinner"></div>

                <p>
                    Loading version history...
                </p>

            </div>

        );

    }


    return (

        <div className="version-page">


            {/* ================================= */}
            {/* TOP NAVBAR */}
            {/* ================================= */}

            <nav className="version-navbar">


                <div className="version-brand">


                    <div className="version-logo">
                        ED
                    </div>


                    <div>

                        <h2>
                            Expert Decision Replay
                        </h2>

                        <span>
                            Decision Version Tracking
                        </span>

                    </div>


                </div>


                <div className="version-nav-actions">


                    <button

                        onClick={() =>
                            navigate("/decisions")
                        }

                        className="version-nav-button"

                    >
                        ← All Decisions
                    </button>


                    <button

                        onClick={() =>
                            navigate(`/decision/${id}`)
                        }

                        className="version-nav-primary"

                    >
                        Decision Details
                    </button>


                </div>


            </nav>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="version-main">


                {/* Header */}

                <div className="version-header">


                    <div>

                        <span className="version-eyebrow">
                            AUDIT & TRACEABILITY
                        </span>


                        <h1>
                            Version History
                        </h1>


                        <p>
                            Track how Decision #{id} has changed over time.
                        </p>

                    </div>


                    <div className="version-count">

                        <strong>
                            {versions.length}
                        </strong>

                        <span>
                            {versions.length === 1
                                ? "Version"
                                : "Versions"}
                        </span>

                    </div>


                </div>


                {/* ================================= */}
                {/* VERSION TIMELINE */}
                {/* ================================= */}

                {versions.length === 0 ? (

                    <div className="version-empty">


                        <div className="version-empty-icon">
                            🔄
                        </div>


                        <h2>
                            No Version History
                        </h2>


                        <p>
                            No changes have been recorded
                            for this decision yet.
                        </p>


                        <button

                            onClick={() =>
                                navigate(`/decision/${id}`)
                            }

                        >
                            Back to Decision
                        </button>


                    </div>

                ) : (


                    <div className="version-timeline">


                        {versions.map(
                            (version, index) => (


                                <div
                                    key={version.id}
                                    className="version-item"
                                >


                                    {/* Timeline Line */}

                                    <div className="timeline-marker">


                                        <div className="timeline-dot">
                                            V{version.version_number}
                                        </div>


                                        {index !==
                                            versions.length - 1 && (

                                            <div className="timeline-line"></div>

                                        )}


                                    </div>


                                    {/* Version Card */}

                                    <div className="version-card">


                                        <div className="version-card-top">


                                            <div>

                                                <span className="version-label">
                                                    VERSION
                                                </span>


                                                <h2>
                                                    V{version.version_number}
                                                </h2>

                                            </div>


                                            <span className="version-status">

                                                {version.status ||
                                                    "Not Specified"}

                                            </span>


                                        </div>


                                        <div className="version-details">


                                            <div className="version-detail">


                                                <span>
                                                    Modified By
                                                </span>


                                                <strong>
                                                    User {version.modified_by}
                                                </strong>


                                            </div>


                                            <div className="version-detail">


                                                <span>
                                                    Modified Date
                                                </span>


                                                <strong>

                                                    {new Date(
                                                        version.modified_at
                                                    ).toLocaleString(
                                                        "en-GB",
                                                        {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        }
                                                    )}

                                                </strong>


                                            </div>


                                        </div>


                                        <div className="change-summary">


                                            <span>
                                                CHANGE SUMMARY
                                            </span>


                                            <p>
                                                {version.change_summary ||
                                                    "No change summary available."}
                                            </p>


                                        </div>


                                    </div>


                                </div>


                            )
                        )}


                    </div>

                )}


            </main>


        </div>

    );

}


export default VersionHistory;