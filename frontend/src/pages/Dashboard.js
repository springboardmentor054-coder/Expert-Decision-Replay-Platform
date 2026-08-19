import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";


/* ==========================================
   CHART COLORS
========================================== */

const CHART_COLORS = [
    "#3157a6",
    "#238653",
    "#c43c3c",
    "#b57900",
    "#6d4bc3",
    "#2876a8",
    "#7c3aed",
    "#0891b2"
];


/* ==========================================
   NORMALIZE CHART DATA
========================================== */

const normalizeChartData = (data) => {

    if (!data) {
        return [];
    }


    /* ------------------------------------------
       ARRAY RESPONSE
    ------------------------------------------ */

    if (Array.isArray(data)) {

        return data.map((item, index) => {

            if (
                typeof item === "string" ||
                typeof item === "number"
            ) {
                return {
                    name: String(item),
                    value: 0
                };
            }


            if (!item || typeof item !== "object") {
                return {
                    name: `Item ${index + 1}`,
                    value: 0
                };
            }


            const name =
                item.status ??
                item.category ??
                item.category_name ??
                item.month ??
                item.name ??
                item.label ??
                `Item ${index + 1}`;


            const value =
                item.count ??
                item.total ??
                item.value ??
                item.number ??
                item.approved ??
                item.decisions ??
                0;


            return {
                ...item,
                name: String(name),
                value: Number(value) || 0
            };

        });
    }


    /* ------------------------------------------
       OBJECT RESPONSE
    ------------------------------------------ */

    if (
        typeof data === "object" &&
        !Array.isArray(data)
    ) {

        return Object.entries(data).map(
            ([name, value]) => {

                let numericValue = 0;


                if (
                    typeof value === "number"
                ) {

                    numericValue = value;

                } else if (
                    typeof value === "string"
                ) {

                    numericValue =
                        Number(value) || 0;

                } else if (
                    value &&
                    typeof value === "object"
                ) {

                    numericValue =
                        Number(
                            value.count ??
                            value.total ??
                            value.value ??
                            value.number ??
                            value.approved ??
                            value.decisions ??
                            0
                        ) || 0;
                }


                return {
                    name: String(name),
                    value: numericValue
                };

            }
        );
    }


    return [];
};


/* ==========================================
   DASHBOARD
========================================== */

function Dashboard() {

    const navigate = useNavigate();


    const [dashboard, setDashboard] =
        useState(null);

    const [charts, setCharts] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ==========================================
       FORMAT DATE
    ========================================== */

    const formatDate = (dateString) => {

        if (!dateString) {
            return "";
        }


        return new Date(dateString).toLocaleString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    /* ==========================================
       STATUS CLASS
    ========================================== */

    const getStatusClass = (status) => {

        if (!status) {
            return "status-default";
        }


        switch (
            status.toLowerCase()
        ) {

            case "approved":
                return "status-approved";

            case "rejected":
                return "status-rejected";

            case "pending":
                return "status-pending";

            case "under review":
                return "status-review";

            case "in review":
                return "status-review";

            case "draft":
                return "status-default";

            default:
                return "status-default";
        }
    };


    /* ==========================================
       ACTIVITY ICON
    ========================================== */

    const getActivityIcon = (
        actionType
    ) => {

        switch (actionType) {

            case "DECISION_CREATED":
                return "📝";

            case "DECISION_APPROVED":
                return "✓";

            case "DECISION_REJECTED":
                return "✕";

            case "DOCUMENT_UPLOADED":
                return "📄";

            case "COMMENT_ADDED":
                return "💬";

            case "LOGIN":
                return "🔐";

            default:
                return "📋";
        }
    };


    /* ==========================================
       ACTIVITY TITLE
    ========================================== */

    const getActivityTitle = (
        actionType
    ) => {

        switch (actionType) {

            case "DECISION_CREATED":
                return "Decision Created";

            case "DECISION_APPROVED":
                return "Decision Approved";

            case "DECISION_REJECTED":
                return "Decision Rejected";

            case "DOCUMENT_UPLOADED":
                return "Document Uploaded";

            case "COMMENT_ADDED":
                return "Comment Added";

            case "LOGIN":
                return "User Login";

            default:
                return actionType || "Activity";
        }
    };


    /* ==========================================
       LOGOUT
    ========================================== */

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "userEmail"
        );

        navigate("/login");
    };


    /* ==========================================
       LOAD DASHBOARD + CHARTS
    ========================================== */

    useEffect(() => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            navigate("/login");

            return;
        }


        const loadData = async () => {

            try {

                setLoading(true);

                setError("");


                /* ==========================================
                   DASHBOARD API
                ========================================== */

                const dashboardResponse =
                    await fetch(
                        `${API_BASE_URL}/dashboard/role-dashboard`,
                        {
                            method: "GET",
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                if (
                    dashboardResponse.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "userEmail"
                    );

                    navigate("/login");

                    return;
                }


                if (
                    !dashboardResponse.ok
                ) {

                    throw new Error(
                        "Unable to load dashboard."
                    );
                }


                const dashboardData =
                    await dashboardResponse.json();


                console.log(
                    "ROLE DASHBOARD RESPONSE:",
                    dashboardData
                );


                setDashboard(
                    dashboardData
                );


                /* ==========================================
                   CHART API
                   
                   IMPORTANT:
                   Fetch independently.
                   Do NOT depend on dashboard.role.
                ========================================== */

                try {

                    const chartResponse =
                        await fetch(
                            `${API_BASE_URL}/dashboard/charts`,
                            {
                                method: "GET",
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                    "Content-Type":
                                        "application/json"
                                }
                            }
                        );


                    console.log(
                        "CHART API STATUS:",
                        chartResponse.status
                    );


                    if (
                        chartResponse.status === 401
                    ) {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "userEmail"
                        );

                        navigate("/login");

                        return;
                    }


                    if (
                        chartResponse.ok
                    ) {

                        const chartData =
                            await chartResponse.json();


                        console.log(
                            "CHART API RESPONSE:",
                            chartData
                        );


                        setCharts(
                            chartData
                        );

                    } else {

                        console.error(
                            "Chart API failed:",
                            chartResponse.status
                        );

                        setCharts(null);
                    }

                } catch (chartError) {

                    console.error(
                        "Chart API error:",
                        chartError
                    );

                    setCharts(null);
                }


            } catch (dashboardError) {

                console.error(
                    "Dashboard error:",
                    dashboardError
                );


                setError(
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);
            }
        };


        loadData();

    }, [navigate]);


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-loading">
                    Loading dashboard...
                </div>

            </div>
        );
    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-error">
                    {error}
                </div>

            </div>
        );
    }


    /* ==========================================
       NO DASHBOARD
    ========================================== */

    if (!dashboard) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-empty">
                    No dashboard data available.
                </div>

            </div>
        );
    }


    /* ==========================================
       EMPLOYEE DASHBOARD
    ========================================== */

    if (
        dashboard.role ===
        "Employee"
    ) {

        const decisions =
            dashboard.my_decisions || [];

        const activities =
            dashboard.recent_activities || [];


        return (

            <div className="dashboard-page">

                <div className="dashboard-header">

                    <div>

                        <p className="dashboard-label">
                            EMPLOYEE DASHBOARD
                        </p>

                        <h1>
                            Welcome,{" "}
                            {dashboard.user?.name}
                        </h1>

                        <p className="dashboard-subtitle">
                            Manage your decisions
                            and review recent
                            activities.
                        </p>

                    </div>


                    <div className="dashboard-header-actions">

                        <button
                            className="dashboard-action-button"
                            onClick={() =>
                                navigate(
                                    "/decisions"
                                )
                            }
                        >
                            My Decisions
                        </button>


                        <button
                            className="dashboard-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>


                <div className="dashboard-cards">

                    <div className="summary-card">

                        <div className="summary-icon decisions-icon">
                            ◈
                        </div>

                        <p className="summary-title">
                            My Decisions
                        </p>

                        <h2>
                            {decisions.length}
                        </h2>

                        <p className="summary-description">
                            Decisions created by you
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon pending-icon">
                            ◷
                        </div>

                        <p className="summary-title">
                            Pending Reviews
                        </p>

                        <h2>
                            {dashboard.pending_reviews || 0}
                        </h2>

                        <p className="summary-description">
                            Reviews awaiting action
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon users-icon">
                            ✓
                        </div>

                        <p className="summary-title">
                            Recent Activities
                        </p>

                        <h2>
                            {activities.length}
                        </h2>

                        <p className="summary-description">
                            Your latest activities
                        </p>

                    </div>

                </div>


                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                DECISIONS
                            </p>

                            <h2>
                                My Decisions
                            </h2>

                            <p>
                                Decisions created by
                                your account.
                            </p>

                        </div>


                        <button
                            className="section-button"
                            onClick={() =>
                                navigate(
                                    "/decisions"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {decisions.length === 0 ? (

                        <div className="dashboard-empty-card">

                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>
                                No decisions yet
                            </h3>

                            <p>
                                Create your first
                                decision to see it here.
                            </p>

                        </div>

                    ) : (

                        <div className="decision-list">

                            {decisions.map(
                                (decision) => (

                                    <div
                                        className="dashboard-list-item"
                                        key={decision.id}
                                    >

                                        <div className="list-item-main">

                                            <span className="decision-id">
                                                Decision #
                                                {decision.id}
                                            </span>

                                            <h3>
                                                {decision.title}
                                            </h3>

                                            <p>
                                                Created{" "}
                                                {formatDate(
                                                    decision.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div className="list-item-right">

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    decision.status
                                                )}`}
                                            >
                                                {decision.status}
                                            </span>


                                            <button
                                                className="small-view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/decision/${decision.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                ACTIVITY
                            </p>

                            <h2>
                                Recent Activities
                            </h2>

                            <p>
                                Your latest actions
                                on the platform.
                            </p>

                        </div>

                    </div>


                    {activities.length === 0 ? (

                        <div className="dashboard-empty-card">

                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>
                                No recent activities
                            </h3>

                            <p>
                                Your recent activities
                                will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="activity-list">

                            {activities.map(
                                (activity) => (

                                    <div
                                        className="activity-item"
                                        key={activity.id}
                                    >

                                        <div className="activity-icon">
                                            {getActivityIcon(
                                                activity.action_type
                                            )}
                                        </div>


                                        <div className="activity-content">

                                            <h3>
                                                {getActivityTitle(
                                                    activity.action_type
                                                )}
                                            </h3>

                                            <p>
                                                {activity.description}
                                            </p>

                                        </div>


                                        <div className="activity-date">

                                            {formatDate(
                                                activity.created_at
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>
        );
    }


    /* ==========================================
       MANAGER DASHBOARD
    ========================================== */

    if (
        dashboard.role ===
        "Manager"
    ) {

        const teamDecisions =
            dashboard.team_decisions || [];

        const statistics =
            dashboard.decision_statistics || {};


        return (

            <div className="dashboard-page">

                <div className="dashboard-header">

                    <div>

                        <p className="dashboard-label">
                            MANAGER DASHBOARD
                        </p>

                        <h1>
                            Welcome,{" "}
                            {dashboard.user?.name}
                        </h1>

                        <p className="dashboard-subtitle">
                            Monitor team decisions
                            and approval activity.
                        </p>

                    </div>


                    <div className="dashboard-header-actions">

                        <button
                            className="dashboard-action-button"
                            onClick={() =>
                                navigate(
                                    "/approvals"
                                )
                            }
                        >
                            Pending Approvals
                        </button>


                        <button
                            className="dashboard-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>


                <div className="dashboard-cards">

                    <div className="summary-card">

                        <div className="summary-icon decisions-icon">
                            ◈
                        </div>

                        <p className="summary-title">
                            Team Decisions
                        </p>

                        <h2>
                            {statistics.total || 0}
                        </h2>

                        <p className="summary-description">
                            Total decisions in your team
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon pending-icon">
                            ◷
                        </div>

                        <p className="summary-title">
                            Pending Approvals
                        </p>

                        <h2>
                            {dashboard.pending_approvals || 0}
                        </h2>

                        <p className="summary-description">
                            Decisions awaiting approval
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon approved-icon">
                            ✓
                        </div>

                        <p className="summary-title">
                            Approved
                        </p>

                        <h2>
                            {statistics.approved || 0}
                        </h2>

                        <p className="summary-description">
                            Approved team decisions
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon rejected-icon">
                            ×
                        </div>

                        <p className="summary-title">
                            Rejected
                        </p>

                        <h2>
                            {statistics.rejected || 0}
                        </h2>

                        <p className="summary-description">
                            Rejected team decisions
                        </p>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon pending-icon">
                            !
                        </div>

                        <p className="summary-title">
                            Pending Decisions
                        </p>

                        <h2>
                            {statistics.pending || 0}
                        </h2>

                        <p className="summary-description">
                            Decisions awaiting review
                        </p>

                    </div>

                </div>


                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                TEAM
                            </p>

                            <h2>
                                Team Decisions
                            </h2>

                            <p>
                                Latest decisions
                                created by your team.
                            </p>

                        </div>


                        <button
                            className="section-button"
                            onClick={() =>
                                navigate(
                                    "/decisions"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {teamDecisions.length === 0 ? (

                        <div className="dashboard-empty-card">

                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>
                                No team decisions
                            </h3>

                            <p>
                                Team decisions will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="decision-list">

                            {teamDecisions.map(
                                (decision) => (

                                    <div
                                        className="dashboard-list-item"
                                        key={decision.id}
                                    >

                                        <div className="list-item-main">

                                            <span className="decision-id">
                                                Decision #
                                                {decision.id}
                                            </span>

                                            <h3>
                                                {decision.title}
                                            </h3>

                                            <p>
                                                Created{" "}
                                                {formatDate(
                                                    decision.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div className="list-item-right">

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    decision.status
                                                )}`}
                                            >
                                                {decision.status}
                                            </span>


                                            <button
                                                className="small-view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/decision/${decision.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                MANAGEMENT
                            </p>

                            <h2>
                                Manager Actions
                            </h2>

                        </div>

                    </div>


                    <div className="manager-actions-grid">

                        <button
                            className="manager-action-card"
                            onClick={() =>
                                navigate(
                                    "/approvals"
                                )
                            }
                        >

                            <span className="manager-action-icon">
                                ⏳
                            </span>

                            <div>

                                <strong>
                                    Pending Approvals
                                </strong>

                                <small>
                                    Review decisions
                                    awaiting approval
                                </small>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="manager-action-card"
                            onClick={() =>
                                navigate(
                                    "/approval-history"
                                )
                            }
                        >

                            <span className="manager-action-icon">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Approval History
                                </strong>

                                <small>
                                    View completed
                                    approval records
                                </small>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="manager-action-card"
                            onClick={() =>
                                navigate(
                                    "/reports"
                                )
                            }
                        >

                            <span className="manager-action-icon">
                                📊
                            </span>

                            <div>

                                <strong>
                                    Organization Reports
                                </strong>

                                <small>
                                    View team and
                                    decision reports
                                </small>

                            </div>

                            <span>
                                →
                            </span>

                        </button>

                    </div>

                </section>

            </div>
        );
    }


    /* ==========================================
       ADMINISTRATOR DASHBOARD
    ========================================== */

    if (
        dashboard.role ===
        "Administrator"
    ) {

        const analytics =
            dashboard.system_analytics || {};

        const reports =
            dashboard.organization_reports || {};

        const activities =
            dashboard.user_activity || [];


        /* ==========================================
           PREPARE CHART DATA
        ========================================== */

        const statusData =
            normalizeChartData(
                charts?.decision_status
            );


        const categoryData =
            normalizeChartData(
                charts?.decisions_by_category
            );


        const monthlyData =
            normalizeChartData(
                charts?.monthly_decisions
            );


        const approvalData =
            normalizeChartData(
                charts?.approval_status
            );


        console.log(
            "STATUS DATA:",
            statusData
        );

        console.log(
            "CATEGORY DATA:",
            categoryData
        );

        console.log(
            "MONTHLY DATA:",
            monthlyData
        );

        console.log(
            "APPROVAL DATA:",
            approvalData
        );


        return (

            <div className="dashboard-page">

                {/* ==========================================
                   HEADER
                ========================================== */}

                <div className="dashboard-header">

                    <div>

                        <p className="dashboard-label">
                            ADMINISTRATOR DASHBOARD
                        </p>

                        <h1>
                            Welcome,{" "}
                            {dashboard.user?.name}
                        </h1>

                        <p className="dashboard-subtitle">
                            Monitor system activity
                            and organization-wide
                            performance.
                        </p>

                    </div>


                    <div className="dashboard-header-actions">

                        <button
                            className="dashboard-action-button"
                            onClick={() =>
                                navigate(
                                    "/reports"
                                )
                            }
                        >
                            Organization Reports
                        </button>


                        <button
                            className="dashboard-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>


                {/* ==========================================
                   SYSTEM ANALYTICS
                ========================================== */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                SYSTEM ANALYTICS
                            </p>

                            <h2>
                                System Analytics
                            </h2>

                            <p>
                                Overview of the
                                entire platform.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-cards">

                        <div className="summary-card">

                            <div className="summary-icon users-icon">
                                ◉
                            </div>

                            <p className="summary-title">
                                Total Users
                            </p>

                            <h2>
                                {analytics.users || 0}
                            </h2>

                            <p className="summary-description">
                                Registered platform users
                            </p>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon decisions-icon">
                                ◈
                            </div>

                            <p className="summary-title">
                                Total Decisions
                            </p>

                            <h2>
                                {analytics.decisions || 0}
                            </h2>

                            <p className="summary-description">
                                Organization decisions
                            </p>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon documents-icon">
                                ▣
                            </div>

                            <p className="summary-title">
                                Documents
                            </p>

                            <h2>
                                {analytics.documents || 0}
                            </h2>

                            <p className="summary-description">
                                Uploaded documents
                            </p>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon approved-icon">
                                ✓
                            </div>

                            <p className="summary-title">
                                Approvals
                            </p>

                            <h2>
                                {analytics.approvals || 0}
                            </h2>

                            <p className="summary-description">
                                Total approval records
                            </p>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon users-icon">
                                ◈
                            </div>

                            <p className="summary-title">
                                Teams
                            </p>

                            <h2>
                                {analytics.teams || 0}
                            </h2>

                            <p className="summary-description">
                                Organization teams
                            </p>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon pending-icon">
                                📝
                            </div>

                            <p className="summary-title">
                                Audit Logs
                            </p>

                            <h2>
                                {analytics.audit_logs || 0}
                            </h2>

                            <p className="summary-description">
                                Recorded system activities
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                   TASK 3 - CHARTS
                ========================================== */}

                <section className="dashboard-analytics-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                ANALYTICS
                            </p>

                            <h2>
                                Decision Analytics
                            </h2>

                            <p>
                                Visual overview of
                                decisions and
                                approval activity.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-chart-grid">


                        {/* ==================================
                           1. DECISION STATUS
                        ================================== */}

                        <div className="dashboard-chart-card">

                            <h3>
                                Decision Status Distribution
                            </h3>

                            <p>
                                Distribution of decisions
                                by status.
                            </p>


                            <div className="chart-container">

                                {statusData.length === 0 ? (

                                    <div className="chart-empty">
                                        No decision status
                                        data available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={90}
                                                label
                                            >

                                                {statusData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (

                                                        <Cell
                                                            key={
                                                                `status-${index}`
                                                            }
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />

                                                    )
                                                )}

                                            </Pie>


                                            <Tooltip />


                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>


                        {/* ==================================
                           2. CATEGORY
                        ================================== */}

                        <div className="dashboard-chart-card">

                            <h3>
                                Decisions by Category
                            </h3>

                            <p>
                                Number of decisions
                                grouped by category.
                            </p>


                            <div className="chart-container">

                                {categoryData.length === 0 ? (

                                    <div className="chart-empty">
                                        No category data
                                        available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                categoryData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 20,
                                                left: 0,
                                                bottom: 20
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />


                                            <XAxis
                                                dataKey="name"
                                            />


                                            <YAxis
                                                allowDecimals={false}
                                            />


                                            <Tooltip />


                                            <Legend />


                                            <Bar
                                                dataKey="value"
                                                name="Decisions"
                                                fill="#3157a6"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>


                        {/* ==================================
                           3. MONTHLY
                        ================================== */}

                        <div className="dashboard-chart-card">

                            <h3>
                                Monthly Decisions
                            </h3>

                            <p>
                                Decision creation
                                trends by month.
                            </p>


                            <div className="chart-container">

                                {monthlyData.length === 0 ? (

                                    <div className="chart-empty">
                                        No monthly decision
                                        data available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <LineChart
                                            data={
                                                monthlyData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 20,
                                                left: 0,
                                                bottom: 20
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />


                                            <XAxis
                                                dataKey="name"
                                            />


                                            <YAxis
                                                allowDecimals={false}
                                            />


                                            <Tooltip />


                                            <Legend />


                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                name="Decisions"
                                                stroke="#6d4bc3"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 5
                                                }}
                                                activeDot={{
                                                    r: 7
                                                }}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>


                        {/* ==================================
                           4. APPROVAL STATISTICS
                        ================================== */}

                        <div className="dashboard-chart-card">

                            <h3>
                                Approval Statistics
                            </h3>

                            <p>
                                Approval activity
                                grouped by status.
                            </p>


                            <div className="chart-container">

                                {approvalData.length === 0 ? (

                                    <div className="chart-empty">
                                        No approval data
                                        available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={
                                                    approvalData
                                                }
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={90}
                                                label
                                            >

                                                {approvalData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (

                                                        <Cell
                                                            key={
                                                                `approval-${index}`
                                                            }
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />

                                                    )
                                                )}

                                            </Pie>


                                            <Tooltip />


                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                   ORGANIZATION REPORTS
                ========================================== */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-label">
                                REPORTS
                            </p>

                            <h2>
                                Organization Reports
                            </h2>

                            <p>
                                Organization-wide
                                decision statistics.
                            </p>

                        </div>


                        <button
                            className="section-button"
                            onClick={() =>
                                navigate(
                                    "/reports"
                                )
                            }
                        >
                            Open Reports
                        </button>

                    </div>


                    <div className="dashboard-cards">

                        <div className="summary-card">

                            <div className="summary-icon decisions-icon">
                                ◈
                            </div>

                            <p className="summary-title">
                                Total Decisions
                            </p>

                            <h2>
                                {reports.total_decisions || 0}
                            </h2>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon approved-icon">
                                ✓
                            </div>

                            <p className="summary-title">
                                Approved
                            </p>

                            <h2>
                                {reports.approved || 0}
                            </h2>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon rejected-icon">
                                ×
                            </div>

                            <p className="summary-title">
                                Rejected
                            </p>

                            <h2>
                                {reports.rejected || 0}
                            </h2>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon pending-icon">
                                ◷
                            </div>

                            <p className="summary-title">
                                Pending
                            </p>

                            <h2>
                                {reports.pending || 0}
                            </h2>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                   TASK 4 - RECENT ACTIVITIES
                ========================================== */}

                <section className="recent-activities-section">

                    <div className="recent-activities-header">

                        <div>

                            <p className="dashboard-label">
                                USER ACTIVITY
                            </p>

                            <h2>
                                Recent Activities
                            </h2>

                            <p>
                                Latest activities across
                                the organization.
                            </p>

                        </div>


                        <div className="recent-activities-actions">

                            <span className="activity-count">
                                {activities.length} Activities
                            </span>


                            <button
                                className="section-button"
                                onClick={() =>
                                    navigate(
                                        "/audit-logs"
                                    )
                                }
                            >
                                Audit Logs
                            </button>

                        </div>

                    </div>


                    {activities.length === 0 ? (

                        <div className="activities-empty">

                            <div className="activities-empty-icon">
                                📋
                            </div>

                            <h3>
                                No user activity
                            </h3>

                            <p>
                                Recent user activities
                                will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="activities-list">

                            {activities.map(
                                (activity) => {

                                    let activityClass =
                                        "activity-default";


                                    if (
                                        activity.action_type ===
                                        "DECISION_CREATED"
                                    ) {
                                        activityClass =
                                            "activity-created";
                                    }


                                    if (
                                        activity.action_type ===
                                        "DECISION_APPROVED"
                                    ) {
                                        activityClass =
                                            "activity-approved";
                                    }


                                    if (
                                        activity.action_type ===
                                        "DOCUMENT_UPLOADED"
                                    ) {
                                        activityClass =
                                            "activity-document";
                                    }


                                    if (
                                        activity.action_type ===
                                        "COMMENT_ADDED"
                                    ) {
                                        activityClass =
                                            "activity-comment";
                                    }


                                    return (

                                        <div
                                            className="activity-item"
                                            key={
                                                activity.id
                                            }
                                        >

                                            <div
                                                className={`activity-icon ${activityClass}`}
                                            >
                                                {getActivityIcon(
                                                    activity.action_type
                                                )}
                                            </div>


                                            <div className="activity-content">

                                                <div className="activity-title-row">

                                                    <h3>
                                                        {getActivityTitle(
                                                            activity.action_type
                                                        )}
                                                    </h3>


                                                    {activity.decision_id && (

                                                        <span className="activity-decision">

                                                            Decision #
                                                            {
                                                                activity.decision_id
                                                            }

                                                        </span>

                                                    )}

                                                </div>


                                                <p>
                                                    {
                                                        activity.description
                                                    }
                                                </p>


                                                {activity.user_id && (

                                                    <span className="activity-user">

                                                        User #
                                                        {
                                                            activity.user_id
                                                        }

                                                    </span>

                                                )}

                                            </div>


                                            <div className="activity-date">

                                                {formatDate(
                                                    activity.created_at
                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </div>
        );
    }


    /* ==========================================
       UNKNOWN ROLE
    ========================================== */

    return (

        <div className="dashboard-page">

            <div className="dashboard-empty">

                Your account does not have
                a supported dashboard role.

            </div>

        </div>
    );
}


export default Dashboard;
