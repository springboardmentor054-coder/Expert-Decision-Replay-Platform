import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import "./Reports.css";

function Reports() {

    const [decisionReport, setDecisionReport] = useState(null);
    const [approvalReport, setApprovalReport] = useState(null);
    const [teamReport, setTeamReport] = useState(null);
    const [auditReport, setAuditReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // FETCH REPORTS
    // ==========================================

    useEffect(() => {

        fetchReports();

    }, []);


    const fetchReports = async () => {

        setLoading(true);
        setError("");

        try {

            const token = localStorage.getItem("token");

            const headers = {
                "Content-Type": "application/json"
            };

            if (token) {

                headers.Authorization =
                    `Bearer ${token}`;

            }


            // ------------------------------------------
            // FETCH ALL REPORTS
            // ------------------------------------------

            const [
                decisionResponse,
                approvalResponse,
                teamResponse,
                auditResponse
            ] = await Promise.all([

                fetch(
                    `${API_BASE_URL}/reports/decisions`,
                    {
                        headers
                    }
                ),

                fetch(
                    `${API_BASE_URL}/reports/approvals`,
                    {
                        headers
                    }
                ),

                fetch(
                    `${API_BASE_URL}/reports/teams`,
                    {
                        headers
                    }
                ),

                fetch(
                    `${API_BASE_URL}/reports/audit`,
                    {
                        headers
                    }
                )

            ]);


            // ------------------------------------------
            // CHECK RESPONSES
            // ------------------------------------------

            if (
                !decisionResponse.ok ||
                !approvalResponse.ok ||
                !teamResponse.ok ||
                !auditResponse.ok
            ) {

                throw new Error(
                    "Unable to load reports"
                );

            }


            // ------------------------------------------
            // CONVERT TO JSON
            // ------------------------------------------

            const decisionData =
                await decisionResponse.json();

            const approvalData =
                await approvalResponse.json();

            const teamData =
                await teamResponse.json();

            const auditData =
                await auditResponse.json();


            // ------------------------------------------
            // STORE DATA
            // ------------------------------------------

            setDecisionReport(
                decisionData
            );

            setApprovalReport(
                approvalData
            );

            setTeamReport(
                teamData
            );

            setAuditReport(
                auditData
            );


        } catch (error) {

            console.error(
                "Reports error:",
                error
            );

            setError(
                "Unable to load reports. Please try again."
            );


        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    <div className="reports-spinner"></div>

                    <p>
                        Loading reports...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div className="reports-page">

                <div className="reports-error">

                    <div className="reports-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to Load Reports
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchReports}
                        className="retry-button"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="reports-page">


            {/* ================================== */}
            {/* HEADER */}
            {/* ================================== */}

            <div className="reports-header">

                <div>

                    <p className="reports-eyebrow">
                        ANALYTICS & INSIGHTS
                    </p>

                    <h1>
                        Reports
                    </h1>

                    <p className="reports-subtitle">
                        View decision activity, approval performance,
                        team statistics, and audit activity.
                    </p>

                </div>


                <div className="reports-actions">

                    <button
                        className="export-button pdf-button"
                        onClick={() =>
                            window.open(
                                `${API_BASE_URL}/reports/export/pdf`,
                                "_blank"
                            )
                        }
                    >

                        <span>
                            📄
                        </span>

                        Export PDF

                    </button>


                    <button
                        className="export-button excel-button"
                        onClick={() =>
                            window.open(
                                `${API_BASE_URL}/reports/export/excel`,
                                "_blank"
                            )
                        }
                    >

                        <span>
                            📊
                        </span>

                        Export Excel

                    </button>

                </div>

            </div>


            {/* ================================== */}
            {/* DECISION REPORT */}
            {/* ================================== */}

            <section className="report-section">

                <div className="section-header">

                    <div>

                        <span className="section-icon">
                            📋
                        </span>

                        <div>

                            <h2>
                                Decision Report
                            </h2>

                            <p>
                                Overview of all organizational decisions.
                            </p>

                        </div>

                    </div>

                </div>


                {/* Decision Summary Cards */}

                <div className="summary-grid">


                    <div className="summary-card">

                        <span className="summary-label">
                            Total Decisions
                        </span>

                        <strong>
                            {
                                decisionReport?.summary
                                    ?.total_decisions ?? 0
                            }
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span className="summary-label">
                            Approved
                        </span>

                        <strong>
                            {
                                decisionReport?.summary
                                    ?.approved ?? 0
                            }
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span className="summary-label">
                            Rejected
                        </span>

                        <strong>
                            {
                                decisionReport?.summary
                                    ?.rejected ?? 0
                            }
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span className="summary-label">
                            Pending
                        </span>

                        <strong>
                            {
                                decisionReport?.summary
                                    ?.pending ?? 0
                            }
                        </strong>

                    </div>

                </div>


                {/* Decision Table */}

                <div className="report-table-container">

                    <table className="report-table">

                        <thead>

                            <tr>

                                <th>
                                    Title
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Created By
                                </th>

                                <th>
                                    Created Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                decisionReport?.decisions?.length > 0
                                    ? decisionReport.decisions.map(
                                        (decision, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {decision.title}
                                                </td>

                                                <td>
                                                    {decision.category}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge status-${String(
                                                                decision.status
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )}`
                                                        }
                                                    >
                                                        {decision.status}
                                                    </span>

                                                </td>

                                                <td>
                                                    {decision.created_by}
                                                </td>

                                                <td>
                                                    {
                                                        decision.created_date
                                                            ? new Date(
                                                                decision.created_date
                                                            ).toLocaleString(
                                                                "en-GB"
                                                            )
                                                            : "-"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )
                                    : (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="empty-cell"
                                            >
                                                No decisions found.
                                            </td>

                                        </tr>

                                    )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ================================== */}
            {/* APPROVAL REPORT */}
            {/* ================================== */}

            <section className="report-section">

                <div className="section-header">

                    <div>

                        <span className="section-icon">
                            ✅
                        </span>

                        <div>

                            <h2>
                                Approval Report
                            </h2>

                            <p>
                                Reviewer approval activity and workload.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="report-table-container">

                    <table className="report-table">

                        <thead>

                            <tr>

                                <th>
                                    Reviewer
                                </th>

                                <th>
                                    Approved
                                </th>

                                <th>
                                    Rejected
                                </th>

                                <th>
                                    Pending
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                approvalReport?.reviewers?.length > 0
                                    ? approvalReport.reviewers.map(
                                        (reviewer, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {
                                                        reviewer.reviewer_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        reviewer.decisions_approved
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        reviewer.decisions_rejected
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        reviewer.pending_reviews
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )
                                    : (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="empty-cell"
                                            >
                                                No approval data found.
                                            </td>

                                        </tr>

                                    )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ================================== */}
            {/* TEAM REPORT */}
            {/* ================================== */}

            <section className="report-section">

                <div className="section-header">

                    <div>

                        <span className="section-icon">
                            👥
                        </span>

                        <div>

                            <h2>
                                Team Report
                            </h2>

                            <p>
                                Team-level decision and approval statistics.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="report-table-container">

                    <table className="report-table">

                        <thead>

                            <tr>

                                <th>
                                    Team
                                </th>

                                <th>
                                    Total Users
                                </th>

                                <th>
                                    Total Decisions
                                </th>

                                <th>
                                    Total Approvals
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                teamReport?.teams?.length > 0
                                    ? teamReport.teams.map(
                                        (team, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {team.team_name}
                                                </td>

                                                <td>
                                                    {team.total_users}
                                                </td>

                                                <td>
                                                    {team.total_decisions}
                                                </td>

                                                <td>
                                                    {team.total_approvals}
                                                </td>

                                            </tr>

                                        )
                                    )
                                    : (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="empty-cell"
                                            >
                                                No team data found.
                                            </td>

                                        </tr>

                                    )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ================================== */}
            {/* AUDIT REPORT */}
            {/* ================================== */}

            <section className="report-section">

                <div className="section-header">

                    <div>

                        <span className="section-icon">
                            📝
                        </span>

                        <div>

                            <h2>
                                Audit Report
                            </h2>

                            <p>
                                Summary of recorded platform activity.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="audit-grid">


                    <div className="audit-card">

                        <span>
                            🔐
                        </span>

                        <div>

                            <strong>
                                {
                                    auditReport?.total_logins ?? 0
                                }
                            </strong>

                            <p>
                                Total Logins
                            </p>

                        </div>

                    </div>


                    <div className="audit-card">

                        <span>
                            📋
                        </span>

                        <div>

                            <strong>
                                {
                                    auditReport?.decisions_created ?? 0
                                }
                            </strong>

                            <p>
                                Decisions Created
                            </p>

                        </div>

                    </div>


                    <div className="audit-card">

                        <span>
                            📎
                        </span>

                        <div>

                            <strong>
                                {
                                    auditReport?.documents_uploaded ?? 0
                                }
                            </strong>

                            <p>
                                Documents Uploaded
                            </p>

                        </div>

                    </div>


                    <div className="audit-card">

                        <span>
                            💬
                        </span>

                        <div>

                            <strong>
                                {
                                    auditReport?.comments_added ?? 0
                                }
                            </strong>

                            <p>
                                Comments Added
                            </p>

                        </div>

                    </div>


                    <div className="audit-card">

                        <span>
                            ⚡
                        </span>

                        <div>

                            <strong>
                                {
                                    auditReport?.approval_actions ?? 0
                                }
                            </strong>

                            <p>
                                Approval Actions
                            </p>

                        </div>

                    </div>

                </div>

            </section>


        </div>

    );

}


export default Reports;
