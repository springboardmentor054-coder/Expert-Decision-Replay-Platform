import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DecisionDetails.css";


function ApprovalHistory() {

    const navigate = useNavigate();

    const [approvals, setApprovals] = useState([]);
    const [decisions, setDecisions] = useState({});
    const [loading, setLoading] = useState(true);


    // =========================================
    // GET TOKEN
    // =========================================

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // =========================================
    // FETCH APPROVAL HISTORY
    // =========================================

    useEffect(() => {

        const fetchHistory = async () => {

            const token = getToken();


            // =========================================
            // CHECK LOGIN
            // =========================================

            if (!token) {

                alert(
                    "You are not logged in."
                );

                navigate("/login");

                return;

            }


            try {

                // =========================================
                // GET CURRENT LOGGED-IN USER
                // =========================================

                const userResponse = await fetch(
                    "http://127.0.0.1:8000/auth/me",
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


                if (!userResponse.ok) {

                    throw new Error(
                        "Failed to get current user"
                    );

                }


                const currentUser =
                    await userResponse.json();


                // =========================================
                // GET CURRENT USER ID
                // =========================================

                const currentUserId =
                    currentUser.id;


                console.log(
                    "Current User:",
                    currentUser
                );


                console.log(
                    "Current User ID:",
                    currentUserId
                );


                // =========================================
                // GET ALL APPROVALS
                // =========================================

                const response = await fetch(
                    "http://127.0.0.1:8000/approvals",
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch approval history"
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "All Approvals:",
                    data
                );


                // =========================================
                // FILTER APPROVALS
                // ONLY CURRENT USER'S APPROVALS
                // =========================================

                const userApprovals =
                    data.filter(
                        approval => {

                            const isMatch =
                                String(
                                    approval.reviewer_id
                                ) ===
                                String(
                                    currentUserId
                                );


                            console.log(
                                "Approval:",
                                approval.id,
                                "Reviewer:",
                                approval.reviewer_id,
                                "Current User:",
                                currentUserId,
                                "Match:",
                                isMatch
                            );


                            return isMatch;

                        }
                    );


                console.log(
                    "User Approval History:",
                    userApprovals
                );


                setApprovals(
                    userApprovals
                );


                // =========================================
                // FETCH DECISION DETAILS
                // =========================================

                userApprovals.forEach(
                    approval => {

                        fetchDecision(
                            approval.decision_id,
                            token
                        );

                    }
                );


            } catch (error) {

                console.log(
                    "Approval History Error:",
                    error
                );

                alert(
                    "Failed to load approval history."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchHistory();

    }, [navigate]);


    // =========================================
    // GET DECISION DETAILS
    // =========================================

    const fetchDecision = async (
        decisionId,
        token
    ) => {

        try {

            const response =
                await fetch(
                    `http://127.0.0.1:8000/decisions/${decisionId}`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (response.ok) {

                const data =
                    await response.json();


                setDecisions(
                    previous => ({

                        ...previous,

                        [decisionId]:
                            data

                    })
                );

            }

        } catch (error) {

            console.log(
                "Decision Fetch Error:",
                error
            );

        }

    };


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass =
        (status) => {

            if (!status) {

                return "status-default";

            }


            const normalized =
                status.toLowerCase();


            if (
                normalized === "pending"
            ) {

                return "status-pending";

            }


            if (
                normalized === "approved"
            ) {

                return "status-completed";

            }


            if (
                normalized === "rejected"
            ) {

                return "status-cancelled";

            }


            return "status-default";

        };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="details-loading">

                <div className="details-spinner"></div>

                <p>
                    Loading approval history...
                </p>

            </div>

        );

    }


    // =========================================
    // MAIN UI
    // =========================================

    return (

        <div className="decision-details-page">


            {/* ================================= */}
            {/* TOP NAVBAR */}
            {/* ================================= */}

            <header className="details-navbar">

                <div className="details-brand">

                    <div className="details-logo">
                        ED
                    </div>


                    <div>

                        <strong>
                            Expert Decision
                        </strong>

                        <span>
                            Replay Platform
                        </span>

                    </div>

                </div>


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/approvals")
                    }
                >

                    ← Pending Approvals

                </button>

            </header>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="details-main">


                {/* ================================= */}
                {/* BREADCRUMB */}
                {/* ================================= */}

                <div className="breadcrumb">

                    <span
                        onClick={() =>
                            navigate("/approvals")
                        }
                    >

                        Approvals

                    </span>


                    <span>
                        /
                    </span>


                    <strong>
                        Approval History
                    </strong>

                </div>


                {/* ================================= */}
                {/* HERO */}
                {/* ================================= */}

                <section className="decision-hero">

                    <div className="hero-content">

                        <div className="hero-label">
                            APPROVAL WORKFLOW
                        </div>


                        <h1>
                            Approval History
                        </h1>


                        <p>
                            Review your previous decision
                            approval actions.
                        </p>

                    </div>

                </section>


                {/* ================================= */}
                {/* SUMMARY */}
                {/* ================================= */}

                <section className="overview-grid">


                    {/* TOTAL */}

                    <div className="overview-card">

                        <div className="overview-icon">
                            📋
                        </div>


                        <div>

                            <span>
                                Total Approvals
                            </span>


                            <strong>
                                {approvals.length}
                            </strong>

                        </div>

                    </div>


                    {/* APPROVED */}

                    <div className="overview-card">

                        <div className="overview-icon">
                            ✓
                        </div>


                        <div>

                            <span>
                                Approved
                            </span>


                            <strong>

                                {
                                    approvals.filter(
                                        approval =>
                                            approval.status ===
                                            "Approved"
                                    ).length
                                }

                            </strong>

                        </div>

                    </div>


                    {/* REJECTED */}

                    <div className="overview-card">

                        <div className="overview-icon">
                            ✕
                        </div>


                        <div>

                            <span>
                                Rejected
                            </span>


                            <strong>

                                {
                                    approvals.filter(
                                        approval =>
                                            approval.status ===
                                            "Rejected"
                                    ).length
                                }

                            </strong>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="overview-card">

                        <div className="overview-icon">
                            ⏳
                        </div>


                        <div>

                            <span>
                                Pending
                            </span>


                            <strong>

                                {
                                    approvals.filter(
                                        approval =>
                                            approval.status ===
                                            "Pending"
                                    ).length
                                }

                            </strong>

                        </div>

                    </div>


                </section>


                {/* ================================= */}
                {/* APPROVAL HISTORY */}
                {/* ================================= */}

                <section className="information-section">


                    <div className="section-title">

                        <div className="section-number">
                            01
                        </div>


                        <div>

                            <h2>
                                Approval Records
                            </h2>


                            <p>
                                All approval actions assigned
                                to you.
                            </p>

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* NO HISTORY */}
                    {/* ================================= */}

                    {
                        approvals.length === 0

                            ?

                            <div className="empty-comments">

                                <div>
                                    📋
                                </div>


                                <p>
                                    No approval history found.
                                </p>

                            </div>


                            :


                            /* ================================= */
                            /* HISTORY CARDS */
                            /* ================================= */

                            <div className="resource-grid">

                                {
                                    approvals.map(
                                        approval => {

                                            const decision =
                                                decisions[
                                                    approval.decision_id
                                                ];


                                            return (

                                                <button
                                                    className="resource-card"
                                                    key={
                                                        approval.id
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/approval/${approval.id}`
                                                        )
                                                    }
                                                >


                                                    <div className="resource-icon purple">
                                                        📋
                                                    </div>


                                                    <div>

                                                        <h3>

                                                            {
                                                                decision
                                                                    ? decision.title
                                                                    : `Decision #${approval.decision_id}`
                                                            }

                                                        </h3>


                                                        <p>

                                                            Approval Level:{" "}

                                                            {
                                                                approval.approval_level
                                                            }

                                                        </p>


                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                approval.status
                                                            )}`}
                                                        >

                                                            {
                                                                approval.status
                                                            }

                                                        </span>


                                                        {
                                                            approval.remarks &&

                                                            <p>

                                                                Remarks:{" "}

                                                                {
                                                                    approval.remarks
                                                                }

                                                            </p>

                                                        }

                                                    </div>


                                                    <span>
                                                        →
                                                    </span>

                                                </button>

                                            );

                                        }
                                    )

                                }

                            </div>

                    }

                </section>


            </main>

        </div>

    );

}


export default ApprovalHistory;